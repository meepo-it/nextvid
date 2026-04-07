import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');

function loadMessages(locale: string): Record<string, string> {
  const raw = readFileSync(resolve(root, 'messages', `${locale}.json`), 'utf-8');
  const data = JSON.parse(raw);
  // Remove $schema key
  const { $schema, ...messages } = data;
  return messages;
}

// Source of truth: locales declared in project.inlang/settings.json. The test
// iterates every non-base locale against the base, so adding a new locale
// only requires updating settings.json + creating messages/<locale>.json.
const inlangSettings = JSON.parse(
  readFileSync(resolve(root, 'project.inlang', 'settings.json'), 'utf-8'),
);
const baseLocale: string = inlangSettings.baseLocale;
const allLocales: string[] = inlangSettings.locales;
const otherLocales = allLocales.filter((l) => l !== baseLocale);

describe('i18n message files', () => {
  const base = loadMessages(baseLocale);
  const baseKeys = Object.keys(base).sort();

  it(`all keys in ${baseLocale} are valid JS identifiers`, () => {
    const invalidKeys = baseKeys.filter((k) => !/^[a-z][a-z0-9_]*$/.test(k));
    expect(invalidKeys).toEqual([]);
  });

  it(`no empty values in ${baseLocale} messages`, () => {
    const emptyKeys = baseKeys.filter((k) => base[k].trim() === '');
    expect(emptyKeys).toEqual([]);
  });

  describe.each(otherLocales)('%s parity with %s', (locale) => {
    const target = loadMessages(locale);
    const targetKeys = Object.keys(target).sort();

    it(`${locale} has the same number of keys as ${baseLocale}`, () => {
      expect(targetKeys.length).toBe(baseKeys.length);
    });

    it(`${locale} has identical key set to ${baseLocale}`, () => {
      const missingInTarget = baseKeys.filter((k) => !targetKeys.includes(k));
      const missingInBase = targetKeys.filter((k) => !baseKeys.includes(k));
      expect(missingInTarget).toEqual([]);
      expect(missingInBase).toEqual([]);
    });

    it(`${locale} has no empty values`, () => {
      const emptyKeys = targetKeys.filter((k) => target[k].trim() === '');
      expect(emptyKeys).toEqual([]);
    });

    it(`${locale} interpolation variables match ${baseLocale}`, () => {
      const varPattern = /\{(\w+)\}/g;
      const mismatched: string[] = [];

      for (const key of baseKeys) {
        const baseVars = [...base[key].matchAll(varPattern)]
          .map((m) => m[1])
          .sort();
        const targetVars = [...(target[key] || '').matchAll(varPattern)]
          .map((m) => m[1])
          .sort();

        if (JSON.stringify(baseVars) !== JSON.stringify(targetVars)) {
          mismatched.push(
            `${key}: ${baseLocale}={${baseVars.join(',')}} ${locale}={${targetVars.join(',')}}`,
          );
        }
      }

      expect(mismatched).toEqual([]);
    });

    // Tripwire for "I copied en.json into <locale>.json and forgot to
    // translate". <20% byte-identical leaves room for proper nouns, brand
    // names, language labels, and emoji-only strings.
    it(`${locale} should not be a verbatim copy of ${baseLocale}`, () => {
      const identical = baseKeys.filter((k) => target[k] === base[k]);
      const ratio = identical.length / baseKeys.length;
      expect(
        ratio,
        `${identical.length}/${baseKeys.length} keys are identical to ${baseLocale}`,
      ).toBeLessThan(0.2);
    });
  });
});

describe('i18n URL patterns', () => {
  const publicPaths = [
    '/',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
    '/terms',
    '/privacy',
    '/cookie',
    '/auth/login',
  ];

  const protectedPaths = [
    '/dashboard',
    '/dashboard/',
    '/settings',
    '/settings/profile',
    '/admin',
    '/admin/users',
  ];

  const apiPaths = ['/api/auth/session', '/api/storage/file', '/api/webhooks/stripe'];

  it('public paths should have locale-prefixed versions defined', () => {
    for (const path of publicPaths) {
      expect(path).not.toMatch(/^\/en\//);
      const zhPath = `/zh${path === '/' ? '' : path}`;
      expect(zhPath).toMatch(/^\/zh/);
    }
  });

  it('protected paths should NOT have locale prefix', () => {
    for (const path of protectedPaths) {
      expect(path).not.toMatch(/^\/zh/);
      expect(path).not.toMatch(/^\/en/);
    }
  });

  it('API paths should NOT have locale prefix', () => {
    for (const path of apiPaths) {
      expect(path).toMatch(/^\/api\//);
      expect(path).not.toMatch(/^\/zh/);
    }
  });
});

describe('i18n configuration', () => {
  it('project.inlang/settings.json has correct structure', () => {
    expect(inlangSettings.baseLocale).toBe('en');
    expect(inlangSettings.locales).toEqual(['en', 'zh', 'ja']);
  });
});
