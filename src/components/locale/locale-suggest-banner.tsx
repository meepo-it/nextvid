import { useEffect, useState } from 'react';
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import { IconLanguage, IconX } from '@tabler/icons-react';
import * as m from '@/paraglide/messages.js';

const DISMISS_COOKIE = 'PARAGLIDE_LOCALE_DISMISSED';
const DISMISS_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function getLocaleLabel(code: string): string {
  switch (code) {
    case 'en':
      return m.language_name_en();
    case 'zh':
      return m.language_name_zh();
    case 'ja':
      return m.language_name_ja();
    default:
      return code;
  }
}

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Detect the user's preferred locale from browser settings.
 * Returns a supported locale if it differs from the current one, or null.
 */
/**
 * Match a BCP-47 navigator language tag (e.g. `zh-Hant-HK`, `en-US`) against
 * our supported locale set. Strategy:
 *
 *   1. Lowercased exact match (`en-us` → `en-US` if we have it).
 *   2. Try common variants of the form `<lang>-<region>` (e.g. browser
 *      `zh-CN` → our `zh-CN`).
 *   3. For Chinese specifically, distinguish Simplified vs Traditional:
 *      - `zh-Hans*` / `zh-CN` / `zh-SG` / `zh-MY` → match `zh-CN` if available
 *      - `zh-Hant*` / `zh-TW` / `zh-HK` / `zh-MO` → match `zh-TW` if available
 *      Never cross-suggest (a Traditional reader is not happy seeing
 *      Simplified, and vice versa). When neither match exists, fall through
 *      to the next browser-language entry rather than guessing.
 *   4. Bare language prefix (`en` → `en`).
 */
function matchSupportedLocale(tag: string): string | null {
  const supported = locales as readonly string[];
  const lower = tag.toLowerCase();
  const subtags = lower.split('-');
  const prefix = subtags[0];

  // Direct match (case-insensitive vs the canonical locale code).
  for (const s of supported) {
    if (s.toLowerCase() === lower) return s;
  }

  // Chinese: must distinguish script before falling back to bare `zh`.
  // Our `zh` locale is Simplified — never push Traditional users to it.
  // When `zh-TW` is added later, this branch automatically picks it up.
  if (prefix === 'zh') {
    const isTraditional =
      subtags.includes('hant') ||
      subtags.includes('tw') ||
      subtags.includes('hk') ||
      subtags.includes('mo');
    if (isTraditional) {
      return supported.includes('zh-TW') ? 'zh-TW' : null;
    }
    return supported.includes('zh') ? 'zh' : null;
  }

  // Generic prefix fallback for languages without script ambiguity.
  for (const s of supported) {
    if (s.toLowerCase() === prefix) return s;
  }
  return null;
}

function detectSuggestedLocale(): string | null {
  if (typeof navigator === 'undefined') return null;

  const currentLocale = getLocale();
  const browserLangs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const raw of browserLangs) {
    const matched = matchSupportedLocale(raw);
    if (matched && matched !== currentLocale) return matched;
  }
  return null;
}

export function LocaleSuggestBanner() {
  const [suggestedLocale, setSuggestedLocale] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed
    if (getCookie(DISMISS_COOKIE)) return;

    const suggested = detectSuggestedLocale();
    if (suggested) {
      setSuggestedLocale(suggested);
      // Small delay for smoother UX — don't flash immediately on load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible || !suggestedLocale) return null;

  const handleSwitch = () => {
    setVisible(false);
    setLocale(suggestedLocale as (typeof locales)[number]);
  };

  const handleDismiss = () => {
    setVisible(false);
    setCookie(DISMISS_COOKIE, '1', DISMISS_MAX_AGE);
  };

  const languageName = getLocaleLabel(suggestedLocale);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-border bg-popover p-4 shadow-lg">
        <IconLanguage className="size-5 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-popover-foreground">
          {m.locale_suggest_message({ language: languageName })}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSwitch}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {m.locale_suggest_switch()}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <IconX className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
