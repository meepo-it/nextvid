import { websiteConfig } from '../config/website';

export const Routes = {
  Root: '/',

  // Marketing routes
  Features: '/features',
  Pricing: '/pricing',
  Blog: '/blog',
  Docs: '/docs',
  About: '/about',
  Contact: '/contact',
  Waitlist: '/waitlist',

  // Auth routes
  Login: '/auth/login',
  Register: '/auth/register',
  AuthError: '/auth/error',
  ForgotPassword: '/auth/forgot-password',
  ResetPassword: '/auth/reset-password',

  // Legal routes
  TermsOfService: '/terms',
  PrivacyPolicy: '/privacy',
  CookiePolicy: '/cookie',

  // Dashboard routes
  Dashboard: '/dashboard',

  // Settings routes
  SettingsProfile: '/settings/profile',
  SettingsBilling: '/settings/billing',
  SettingsCredits: '/settings/credits',
  SettingsSecurity: '/settings/security',
  SettingsApiKeys: '/settings/apikeys',
  SettingsNotifications: '/settings/notifications',

  // Admin routes
  AdminUsers: '/admin/users',
} as const;

export const DEFAULT_LOGIN_REDIRECT =
  websiteConfig.routes?.defaultLoginRedirect ?? Routes.Dashboard;

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
