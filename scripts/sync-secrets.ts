import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Secrets required by deploy.yml (lines 39-54)
const REQUIRED_SECRETS = [
  'VITE_BASE_URL',
  'VITE_STRIPE_PRICE_PRO_MONTHLY',
  'VITE_STRIPE_PRICE_PRO_YEARLY',
  'VITE_STRIPE_PRICE_LIFETIME',
  'VITE_GOOGLE_ANALYTICS_ID',
  'VITE_CLARITY_PROJECT_ID',
  'VITE_PLAUSIBLE_SCRIPT',
  'VITE_UMAMI_WEBSITE_ID',
  'VITE_UMAMI_SCRIPT',
  'VITE_CRISP_WEBSITE_ID',
  'VITE_AFFILIATE_AFFONSO_ID',
  'VITE_AFFILIATE_PROMOTEKIT_ID',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
];

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    // Strip surrounding quotes (single or double)
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }

  return env;
}

const DELAY_MS = 1500;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getArgValue(shortFlag: string, longFlag: string): string | undefined {
  const args = process.argv.slice(2);

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg) continue;

    if (arg === shortFlag || arg === longFlag) {
      return args[index + 1];
    }

    if (arg.startsWith(`${shortFlag}=`)) {
      return arg.slice(shortFlag.length + 1);
    }

    if (arg.startsWith(`${longFlag}=`)) {
      return arg.slice(longFlag.length + 1);
    }
  }

  return undefined;
}

function parseGitHubRepoFromUrl(remoteUrl: string): string | undefined {
  const normalized = remoteUrl.trim().replace(/\.git$/, '');
  const sshMatch = normalized.match(
    /^(?:git@|ssh:\/\/git@)github\.com[:/](.+\/.+)$/i
  );
  if (sshMatch) return sshMatch[1];

  const httpsMatch = normalized.match(/^https?:\/\/github\.com\/(.+\/.+)$/i);
  if (httpsMatch) return httpsMatch[1];

  return undefined;
}

function normalizeRepoIdentifier(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const repoFromUrl = parseGitHubRepoFromUrl(trimmed);
  if (repoFromUrl) return repoFromUrl;

  if (/^[^/\s]+\/[^/\s]+$/.test(trimmed)) {
    return trimmed.replace(/\.git$/, '');
  }

  return undefined;
}

function getGitRemoteUrl(remoteName: string, cwd: string): string | undefined {
  try {
    const output = execFileSync(
      'git',
      ['config', '--get', `remote.${remoteName}.url`],
      {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    );

    return output.trim() || undefined;
  } catch {
    return undefined;
  }
}

function resolveRepo(cwd: string): string {
  const repoOverride =
    getArgValue('-R', '--repo') ?? process.env.GITHUB_REPOSITORY;
  const normalizedOverride = repoOverride
    ? normalizeRepoIdentifier(repoOverride)
    : undefined;

  if (repoOverride && !normalizedOverride) {
    console.error(
      '❌ Invalid repo value. Use --repo owner/name or set GITHUB_REPOSITORY=owner/name.'
    );
    process.exit(1);
  }

  if (normalizedOverride) {
    return normalizedOverride;
  }

  const originUrl = getGitRemoteUrl('origin', cwd);
  const originRepo = originUrl ? parseGitHubRepoFromUrl(originUrl) : undefined;
  if (originRepo) {
    return originRepo;
  }

  try {
    const remotes = execFileSync('git', ['remote'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split(/\r?\n/)
      .map((remote) => remote.trim())
      .filter(Boolean);

    for (const remote of remotes) {
      const remoteUrl = getGitRemoteUrl(remote, cwd);
      const repo = remoteUrl ? parseGitHubRepoFromUrl(remoteUrl) : undefined;
      if (repo) {
        return repo;
      }
    }
  } catch {
    // Ignore and show the explicit guidance below.
  }

  console.error(
    '❌ Could not determine the GitHub repo automatically. Use --repo owner/name.'
  );
  process.exit(1);
}

async function setSecret(
  key: string,
  value: string,
  cwd: string,
  repo: string
): Promise<boolean> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      execFileSync('gh', ['secret', 'set', key, '--repo', repo], {
        input: value,
        stdio: ['pipe', 'inherit', 'inherit'],
        cwd,
      });
      return true;
    } catch {
      if (attempt < MAX_RETRIES) {
        const waitMs = DELAY_MS * attempt;
        console.log(
          `   ⏳ Retry ${attempt}/${MAX_RETRIES} for ${key} (waiting ${waitMs}ms)...`
        );
        await sleep(waitMs);
      }
    }
  }
  return false;
}

async function main() {
  const envPath = path.join(__dirname, '..', '.env.production');
  const rootDir = path.join(__dirname, '..');

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.production not found');
    process.exit(1);
  }

  // Check gh CLI is available
  try {
    execFileSync('gh', ['--version'], { stdio: 'ignore' });
  } catch {
    console.error('❌ GitHub CLI (gh) is not installed or not in PATH');
    process.exit(1);
  }

  // Check gh auth status
  try {
    execFileSync('gh', ['auth', 'status'], { stdio: 'ignore' });
  } catch {
    console.error('❌ Not logged in to GitHub CLI. Run `gh auth login` first.');
    process.exit(1);
  }

  const repo = resolveRepo(rootDir);
  const env = parseEnvFile(envPath);
  const missing: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];
  let successCount = 0;

  console.log('🔄 Syncing secrets to GitHub Actions...');
  console.log(`📦 Target GitHub repo: ${repo}\n`);

  for (const key of REQUIRED_SECRETS) {
    const value = env[key];

    if (value === undefined) {
      missing.push(key);
      continue;
    }

    if (value === '') {
      skipped.push(key);
      console.log(`⏭️  ${key} (empty, skipped)`);
      continue;
    }

    if (await setSecret(key, value, rootDir, repo)) {
      successCount++;
      console.log(`✅ ${key}`);
    } else {
      failed.push(key);
      console.error(`❌ Failed to set ${key}`);
    }

    // Delay between requests to avoid GitHub API rate limits
    await sleep(DELAY_MS);
  }

  console.log(`\n--- Summary ---`);
  console.log(`✅ Set: ${successCount}`);
  if (skipped.length > 0) {
    console.log(`⏭️  Skipped (empty): ${skipped.join(', ')}`);
  }
  if (missing.length > 0) {
    console.log(`⚠️  Missing in .env.production: ${missing.join(', ')}`);
  }
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.join(', ')}`);
    process.exit(1);
  }
}

main();
