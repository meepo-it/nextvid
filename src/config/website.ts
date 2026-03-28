import { clientEnv } from '@/env/client';
import * as m from '@/paraglide/messages.js';
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
    get name() { return m.site_name(); },
    get title() { return m.site_title(); },
    get description() { return m.site_description(); },
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
    fromEmail: 'TanStarter <support@tanstarter.dev>',
    supportEmail: 'TanStarter <support@tanstarter.dev>',
  },
  newsletter: {
    enable: true,
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
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
          get name() { return m.pricing_plans_free_name(); },
          get description() { return m.pricing_plans_free_description(); },
          get features() { return [m.pricing_plans_free_features_0(), m.pricing_plans_free_features_1(), m.pricing_plans_free_features_2(), m.pricing_plans_free_features_3()]; },
          get limits() { return [m.pricing_plans_free_limits_0(), m.pricing_plans_free_limits_1(), m.pricing_plans_free_limits_2()]; },
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
            },
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_PRO_YEARLY!,
              amount: 9900,
              currency: 'USD',
              interval: 'year',
            },
          ],
          isFree: false,
          isLifetime: false,
          popular: true,
          get name() { return m.pricing_plans_pro_name(); },
          get description() { return m.pricing_plans_pro_description(); },
          get features() { return [m.pricing_plans_pro_features_0(), m.pricing_plans_pro_features_1(), m.pricing_plans_pro_features_2(), m.pricing_plans_pro_features_3(), m.pricing_plans_pro_features_4()]; },
          get limits() { return [m.pricing_plans_pro_limits_0(), m.pricing_plans_pro_limits_1()]; },
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
          get name() { return m.pricing_plans_lifetime_name(); },
          get description() { return m.pricing_plans_lifetime_description(); },
          get features() { return [m.pricing_plans_lifetime_features_0(), m.pricing_plans_lifetime_features_1(), m.pricing_plans_lifetime_features_2(), m.pricing_plans_lifetime_features_3(), m.pricing_plans_lifetime_features_4(), m.pricing_plans_lifetime_features_5(), m.pricing_plans_lifetime_features_6()]; },
          get limits() { return [] as string[]; },
        },
      },
    },
  },
};
