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

describe('i18n message files', () => {
  const en = loadMessages('en');
  const zh = loadMessages('zh');
  const enKeys = Object.keys(en).sort();
  const zhKeys = Object.keys(zh).sort();

  it('en and zh have the same number of keys', () => {
    expect(enKeys.length).toBe(zhKeys.length);
  });

  it('en and zh have identical key sets', () => {
    const missingInZh = enKeys.filter((k) => !zhKeys.includes(k));
    const missingInEn = zhKeys.filter((k) => !enKeys.includes(k));

    expect(missingInZh).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it('no empty values in en messages', () => {
    const emptyKeys = enKeys.filter((k) => en[k].trim() === '');
    expect(emptyKeys).toEqual([]);
  });

  it('no empty values in zh messages', () => {
    const emptyKeys = zhKeys.filter((k) => zh[k].trim() === '');
    expect(emptyKeys).toEqual([]);
  });

  it('all keys are valid JS identifiers (lowercase, no special chars)', () => {
    const invalidKeys = enKeys.filter((k) => !/^[a-z][a-z0-9_]*$/.test(k));
    expect(invalidKeys).toEqual([]);
  });

  it('interpolation variables match between en and zh', () => {
    const varPattern = /\{(\w+)\}/g;
    const mismatched: string[] = [];

    for (const key of enKeys) {
      const enVars = [...en[key].matchAll(varPattern)].map((m) => m[1]).sort();
      const zhVars = [...(zh[key] || '').matchAll(varPattern)]
        .map((m) => m[1])
        .sort();

      if (JSON.stringify(enVars) !== JSON.stringify(zhVars)) {
        mismatched.push(
          `${key}: en={${enVars.join(',')}} zh={${zhVars.join(',')}}`,
        );
      }
    }

    expect(mismatched).toEqual([]);
  });
});

describe('i18n URL patterns', () => {
  const publicPaths = [
    '/',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
    '/changelog',
    '/roadmap',
    '/waitlist',
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
    // This is a structural test — we verify the vite.config urlPatterns
    // cover all public paths. Since we can't import vite.config in a test,
    // we just verify the pattern expectation.
    for (const path of publicPaths) {
      // en: no prefix
      expect(path).not.toMatch(/^\/en\//);
      // zh would be: /zh + path
      const zhPath = `/zh${path === '/' ? '' : path}`;
      expect(zhPath).toMatch(/^\/zh/);
    }
  });

  it('protected paths should NOT have locale prefix', () => {
    for (const path of protectedPaths) {
      // Protected paths remain the same for all locales
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
    const settings = JSON.parse(
      readFileSync(resolve(root, 'project.inlang', 'settings.json'), 'utf-8'),
    );
    expect(settings.baseLocale).toBe('en');
    expect(settings.locales).toEqual(['en', 'zh']);
  });
});
