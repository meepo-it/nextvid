/**
 * Website config
 */
export const websiteConfig = {
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  auth: {
    enableGoogleLogin: true,
    enableCredentialLogin: true,
  },
  mail: {
    provider: 'resend' as const,
    fromEmail: process.env.MAIL_FROM_EMAIL ?? 'MkFast <support@mksaas.link>',
    supportEmail: process.env.MAIL_SUPPORT_EMAIL ?? 'MkFast <support@mksaas.link>',
  },
} as const
