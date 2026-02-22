import { websiteConfig } from '../config/website';

export const Routes = {
  Root: '/',

  // Marketing routes
  Features: '/#features',
  Faqs: '/#faqs',
  Pricing: '/pricing',
  Blog: '/blog',
  Changelog: '/changelog',
  Roadmap: '/roadmap',
  About: '/about',
  Contact: '/contact',
  Waitlist: '/waitlist',

  // Auth routes
  Auth: '/auth',
  Login: '/auth/login',
  Register: '/auth/register',
  AuthError: '/auth/error',
  ForgotPassword: '/auth/forgot-password',
  ResetPassword: '/auth/reset-password',

  // Legal routes
  TermsOfService: '/terms',
  PrivacyPolicy: '/privacy',
  CookiePolicy: '/cookie',

  // Payment routes
  Payment: '/payment',

  // Dashboard routes
  Dashboard: '/dashboard',

  // Settings routes
  Settings: '/settings',
  SettingsProfile: '/settings/profile',
  SettingsBilling: '/settings/billing',
  SettingsCredits: '/settings/credits',
  SettingsSecurity: '/settings/security',
  SettingsFiles: '/settings/files',
  SettingsApiKeys: '/settings/apikeys',
  SettingsNotifications: '/settings/notifications',

  // Admin routes
  Admin: '/admin',
  AdminUsers: '/admin/users',
} as const;

/**
 * Default login redirect route
 */
export const DEFAULT_LOGIN_REDIRECT =
  websiteConfig.routes?.defaultLoginRedirect ?? Routes.Dashboard;

/**
 * Whether the current pathname matches the given href
 */
export function isPathActive(
  href: string | undefined,
  pathname: string
): boolean {
  if (!href) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
