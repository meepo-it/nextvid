import { clientEnv } from '@/env/client';
import { messages } from '@/messages';
import type { WebsiteConfig } from '../types';
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_USER_FILES_FOLDER,
} from '@/storage/types';

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
    discord: 'https://mksaas.link/discord',
    twitter: 'https://x.com/TanStarter',
    youtube: 'https://www.youtube.com/@TanStarter',
  },
  auth: {
    enable: true,
    enableGoogleLogin: true,
    enableCredentialLogin: true,
    enableDeleteAccount: true,
  },
  blog: {
    enable: true,
    paginationSize: 6,
  },
  affiliates: {
    enable: false,
    provider: 'affonso',
  },
  mail: {
    enable: true,
    provider: 'resend',
    fromEmail: 'TanStarter <noreply@example.com>',
    supportEmail: 'TanStarter <support@example.com>',
  },
  newsletter: {
    enable: true,
    provider: 'resend',
    autoSubscribeAfterSignUp: false,
  },
  notification: {
    enable: true,
    provider: 'discord',
  },
  storage: {
    enable: true,
    provider: 'r2',
    maxFileSize: DEFAULT_MAX_FILE_SIZE,
    allowedTypes: DEFAULT_ALLOWED_TYPES,
    userFilesFolder: DEFAULT_USER_FILES_FOLDER,
  },
  payment: {
    enable: true,
    provider: 'stripe',
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
  },
};
