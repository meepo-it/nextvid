import type { WebsiteConfig } from '../types';
import { messages } from './messages';

/**
 * Website config
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    mode: {
      defaultMode: 'dark',
      enableSwitch: true,
    },
  },
  metadata: {
    name: messages.site.name,
    title: messages.site.title,
    description: messages.site.description,
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    }
  },
  social: {
    github: 'https://github.com/MkFastHQ',
    twitter: 'https://mkfast.link/twitter',
    blueSky: 'https://mkfast.link/bsky',
    discord: 'https://mkfast.link/discord',
    linkedin: 'https://mkfast.link/linkedin',
    youtube: 'https://mkfast.link/youtube',
  },
  features: {
    enableUpgradeCard: true,
    enableUpdateAvatar: true,
    enableCrispChat: false,
    enableTurnstileCaptcha: false,
  },
  routes: {
    defaultLoginRedirect: '/dashboard',
  },
  analytics: {
    enable: true,
  },
  auth: {
    enable: true,
    enableGoogleLogin: true,
    enableCredentialLogin: true,
  },
  blog: {
    enable: true,
    paginationSize: 6,
    relatedPostsSize: 3,
  },
  mail: {
    enable: true,
    provider: 'resend',
    fromEmail: 'MkFast <noreply@mksaas.link>',
    supportEmail: 'MkFast <support@mksaas.link>',
  },
  newsletter: {
    enable: true,
    provider: 'resend',
    autoSubscribeAfterSignUp: false,
  },
  storage: {
    enable: false,
    provider: 'r2',
  },
  payment: {
    provider: 'stripe',
  },
  price: {
    enable: true,
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: 'subscription',
            priceId: '',
            amount: 990,
            currency: 'USD',
            interval: 'month',
          },
          {
            type: 'subscription',
            priceId: '',
            amount: 9900,
            currency: 'USD',
            interval: 'year',
          },
        ],
        isFree: false,
        isLifetime: false,
        popular: true,
      },
      lifetime: {
        id: 'lifetime',
        prices: [
          {
            type: 'one_time',
            priceId: '',
            amount: 19900,
            currency: 'USD',
            allowPromotionCode: true,
          },
        ],
        isFree: false,
        isLifetime: true,
      },
    },
  },
};
