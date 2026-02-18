/**
 * Returns whether the current pathname matches the given href (for nav active state).
 */
export function isPathActive(
  href: string | undefined,
  pathname: string
): boolean {
  if (!href) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
