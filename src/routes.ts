import { websiteConfig } from './config/website';

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

  // Settings routes
  Dashboard: '/dashboard',
  SettingsProfile: '/dashboard/settings/profile',
  SettingsBilling: '/dashboard/settings/billing',
  SettingsCredits: '/dashboard/settings/credits',
  SettingsSecurity: '/dashboard/settings/security',
  SettingsNotifications: '/dashboard/settings/notifications',

  // Admin routes
  AdminUsers: '/dashboard/admin/users',
} as const;

export const DEFAULT_LOGIN_REDIRECT =
  websiteConfig.routes?.defaultLoginRedirect ?? Routes.Dashboard;
