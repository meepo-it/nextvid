import {
  baseLocale,
  locales,
  serverAsyncLocalStorage,
  overwriteServerAsyncLocalStorage,
} from '@/paraglide/runtime.js';

/**
 * BCP-47 locale tag we support, narrowed by Paraglide's compiled `locales`
 * tuple. Use this on DB columns / function params that store user locale
 * preferences so unsupported values are caught at compile time.
 */
export type SupportedLocale = (typeof locales)[number];

/**
 * Coerce an arbitrary string (e.g. a row from the DB written before a locale
 * was added, or `Accept-Language: zh-Hant-HK`) into one of our supported
 * locales. Falls back to `baseLocale` when there is no reasonable match.
 *
 * Chinese is handled with script awareness: `zh-Hant*` / `zh-TW` / `zh-HK` /
 * `zh-MO` → `zh-TW` (when supported); `zh-Hans*` / `zh-CN` / `zh-SG` /
 * `zh-MY` → `zh-CN`. We never collapse a Traditional tag into Simplified or
 * vice versa, since the scripts are not mutually intelligible to many users.
 */
export function normalizeLocale(input: string | null | undefined): SupportedLocale {
  if (!input) return baseLocale as SupportedLocale;
  const supported = locales as readonly string[];

  // Direct case-insensitive match against canonical codes.
  for (const s of supported) {
    if (s.toLowerCase() === input.toLowerCase()) return s as SupportedLocale;
  }

  const subtags = input.toLowerCase().split('-');
  const prefix = subtags[0];

  // Script-aware Chinese. Our `zh` locale is Simplified; Traditional users
  // (zh-Hant / zh-TW / zh-HK / zh-MO) only get a match when `zh-TW` is
  // explicitly added — otherwise we fall back to baseLocale rather than
  // collapse them into Simplified.
  if (prefix === 'zh') {
    const isTraditional =
      subtags.includes('hant') ||
      subtags.includes('tw') ||
      subtags.includes('hk') ||
      subtags.includes('mo');
    if (isTraditional) {
      if (supported.includes('zh-TW')) return 'zh-TW' as SupportedLocale;
      return baseLocale as SupportedLocale;
    }
    if (supported.includes('zh')) return 'zh' as SupportedLocale;
    return baseLocale as SupportedLocale;
  }

  // Bare language prefix for everything else.
  for (const s of supported) {
    if (s.toLowerCase() === prefix) return s as SupportedLocale;
  }
  return baseLocale as SupportedLocale;
}

async function ensureAsyncLocalStorage() {
  if (serverAsyncLocalStorage) return serverAsyncLocalStorage;
  // Mirror what Paraglide's `paraglideMiddleware` does on first request, so
  // `withLocale()` works from background jobs / webhooks that never went
  // through the middleware.
  const { AsyncLocalStorage } = await import('async_hooks');
  overwriteServerAsyncLocalStorage(new AsyncLocalStorage());
  return serverAsyncLocalStorage!;
}

/**
 * Run `fn` with `getLocale()` pinned to `locale`. Uses Paraglide's server-side
 * AsyncLocalStorage so message functions called inside the callback (and any
 * `await`-chained children) resolve to the requested locale, without leaking
 * into other concurrent requests.
 *
 * Use for any rendering that should follow the *recipient* rather than the
 * *current request* — most importantly background email jobs:
 *
 * ```ts
 * await withLocale(user.locale ?? 'en', () =>
 *   sendEmail({ to: user.email, template: 'featureRequestStatusUpdate', context })
 * );
 * ```
 */
export async function withLocale<T>(
  locale: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const normalized = normalizeLocale(locale);
  const als = await ensureAsyncLocalStorage();
  return als.run(
    { locale: normalized, origin: '', messageCalls: new Set() },
    () => Promise.resolve(fn())
  );
}
