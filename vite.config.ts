import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath, URL } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import contentCollections from '@content-collections/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

// ── i18n URL pattern helpers ──────────────────────────────────────
const BASE_LOCALE = 'en';
const LOCALES = ['en', 'zh'] as const;

/** Public route: default locale has no prefix, others get /{locale} prefix */
function publicPattern(path: string) {
  return {
    pattern: path,
    localized: LOCALES.map((l) => [
      l,
      l === BASE_LOCALE ? path : `/${l}${path === '/' ? '' : path}`,
    ]),
  };
}

/** Protected/API route: same URL for all locales, no prefix */
function protectedPattern(path: string) {
  return {
    pattern: path,
    localized: LOCALES.map((l) => [l, path]),
  };
}

/**
 * Vite configuration
 * https://vite.dev/config/
 */
const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    // `cloudflare:*` modules are provided by the Cloudflare Vite plugin only in
    // the Worker (ssr) environment. Vite's client environment also analyses
    // server-only files (e.g. src/db/index.ts) and fails to resolve them.
    // We provide an empty stub for the client so the bundle stays valid; the
    // Worker runtime supplies the real implementation at request time.
    {
      name: 'cloudflare-modules-client-stub',
      enforce: 'pre',
      resolveId(id) {
        if (id.startsWith('cloudflare:') && (this as any).environment?.name === 'client') {
          return `\0cloudflare-stub:${id}`;
        }
      },
      load(id) {
        if (id.startsWith('\0cloudflare-stub:')) {
          return 'export const env = {};';
        }
      },
    },
    devtools({
      eventBusConfig: {
        enabled: false,
      },
    }),
    tailwindcss(),
    contentCollections(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // Paraglide i18n — compile-time translations with URL-based locale routing
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      cookieName: 'PARAGLIDE_LOCALE',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        // Public / marketing pages — default locale has no prefix
        publicPattern('/'),
        publicPattern('/pricing'),
        publicPattern('/about'),
        publicPattern('/contact'),
        publicPattern('/blog'),
        publicPattern('/blog/:slug'),
        publicPattern('/auth/:path(.*)?'),
        publicPattern('/terms'),
        publicPattern('/privacy'),
        publicPattern('/cookie'),
        publicPattern('/requests-and-roadmap'),
        // Protected & API routes — no locale prefix
        protectedPattern('/dashboard/:path(.*)?'),
        protectedPattern('/settings/:path(.*)?'),
        protectedPattern('/admin/:path(.*)?'),
        protectedPattern('/api/:path(.*)?'),
      ],
    }),
    // https://tanstack.dev/start/latest/docs/framework/react/build-from-scratch
    tanstackStart({
      srcDirectory: 'src',
      start: { entry: './start.tsx' },
      server: { entry: './server.ts' },
    }),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
    // https://developers.cloudflare.com/workers/vite-plugin/
    cloudflare({
      viteEnvironment: {
        name: 'ssr',
      },
    }),
  ],
});

export default config;
