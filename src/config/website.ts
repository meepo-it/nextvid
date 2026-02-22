import { clientEnv } from '@/env/client';
import { messages } from '@/messages';
import type { WebsiteConfig } from '../types';

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
    },
  },
  social: {
    github: 'https://github.com/MkFastHQ',
    twitter: 'https://mksaas.link/twitter',
    blueSky: 'https://mksaas.link/bsky',
    discord: 'https://mksaas.link/discord',
    linkedin: 'https://mksaas.link/linkedin',
    youtube: 'https://mksaas.link/youtube',
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
    enableDeleteUser: true,
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
    enable: true,
    provider: 'r2',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.jpg', '.jpeg', '.png', '.webp'],
    userFilesFolder: 'userfiles',
  },
  payment: {
    provider: 'stripe',
  },
  price: {
    plans: {
      free: {
        id: 'free',
        prices: [],
        isFree: true,
        isLifetime: false,
        name: messages.pricing.plans.free.name,
        description: messages.pricing.plans.free.description,
        features: [...messages.pricing.plans.free.features],
        limits: [...messages.pricing.plans.free.limits],
      },
      pro: {
        id: 'pro',
        prices: [
          {
            type: 'subscription',
            priceId: clientEnv.VITE_STRIPE_PRICE_PRO_MONTHLY!,
            amount: 990,
            currency: 'USD',
            interval: 'month',
            trialPeriodDays: 7,
          },
          {
            type: 'subscription',
            priceId: clientEnv.VITE_STRIPE_PRICE_PRO_YEARLY!,
            amount: 9900,
            currency: 'USD',
            interval: 'year',
            trialPeriodDays: 7,
          },
        ],
        isFree: false,
        isLifetime: false,
        popular: true,
        name: messages.pricing.plans.pro.name,
        description: messages.pricing.plans.pro.description,
        features: [...messages.pricing.plans.pro.features],
        limits: [...messages.pricing.plans.pro.limits],
      },
      lifetime: {
        id: 'lifetime',
        prices: [
          {
            type: 'one_time',
            priceId: clientEnv.VITE_STRIPE_PRICE_LIFETIME!,
            amount: 19900,
            currency: 'USD',
            allowPromotionCode: true,
          },
        ],
        isFree: false,
        isLifetime: true,
        name: messages.pricing.plans.lifetime.name,
        description: messages.pricing.plans.lifetime.description,
        features: [...messages.pricing.plans.lifetime.features],
        limits: [...messages.pricing.plans.lifetime.limits],
      },
    },
  },
};
