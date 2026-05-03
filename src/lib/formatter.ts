import { getLocale } from '@/paraglide/runtime.js';

/**
 * Format a price for display.
 *
 * Locale defaults to the active runtime locale (set by Paraglide via URL,
 * cookie, or browser preference). Pass an explicit locale only when rendering
 * for a different audience than the current request (e.g. an email going to a
 * specific user).
 *
 * @param price Price amount in cents
 * @param currency ISO currency code
 * @param locale BCP-47 locale tag, defaults to `getLocale()`
 */
export function formatPrice(
  price: number,
  currency: string,
  locale: string = getLocale()
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });

  return formatter.format(price / 100); // Convert from cents to dollars
}

/**
 * Format bytes to a human-readable string using `Intl.NumberFormat` so the
 * decimal separator follows the active locale.
 */
export function formatBytes(
  bytes: number,
  locale: string = getLocale()
): string {
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  if (bytes < 1024) return `${nf.format(bytes)} B`;
  if (bytes < 1024 * 1024) return `${nf.format(bytes / 1024)} KB`;
  return `${nf.format(bytes / (1024 * 1024))} MB`;
}

/**
 * Format a date for display in the active locale (e.g. "2026/04/07" in
 * en-US, "2026年4月7日" in ja-JP).
 */
export function formatDate(date: Date, locale: string = getLocale()): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format a date and time for display in the active locale.
 */
export function formatDateTime(
  date: Date,
  locale: string = getLocale()
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
