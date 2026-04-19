export const Routes = {
  Root: '/',

  // Marketing routes
  Features: '/#features',
  Faqs: '/#faqs',
  Pricing: '/pricing',
  Blog: '/blog',
  About: '/about',
  Contact: '/contact',
  RequestsAndRoadmap: '/requests-and-roadmap',
  PromoteAndEarn: '/promote',

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
  AdminFeatureRequests: '/admin/feature-requests',
} as const;

/** Default login redirect route */
export const DEFAULT_LOGIN_REDIRECT = Routes.Dashboard;
