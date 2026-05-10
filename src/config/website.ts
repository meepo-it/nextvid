import { clientEnv } from '@/env/client';
import * as m from '@/paraglide/messages.js';
import type { WebsiteConfig } from '../types';
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_USER_FILES_FOLDER,
} from '@/storage/types';
import { SUBSCRIPTION_PRICES, CREDIT_PACK_PRICES } from '@/config/plans-config';

/**
 * Website config
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    mode: {
      defaultMode: 'light',
      enableSwitch: true,
    },
  },
  metadata: {
    get name() {
      return m.site_name();
    },
    get title() {
      return m.site_title();
    },
    get description() {
      return m.site_description();
    },
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
  },
  social: {
    github: '',
    discord: '',
    twitter: 'https://x.com/nextvid_ai',
    youtube: 'https://www.youtube.com/@nextvid_ai',
  },
  auth: {
    enable: true,
    enableGoogleLogin: true,
    enableCredentialLogin: true,
    enableDeleteAccount: false,
  },
  blog: {
    enable: false,
    paginationSize: 6,
  },
  mail: {
    enable: true,
    provider: 'resend',
    fromEmail: 'NextVid <support@nextvid.ai>',
    supportEmail: 'NextVid <support@nextvid.ai>',
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
        // ── Free ──────────────────────────────────────────────────────────
        free: {
          id: 'free',
          prices: [],
          isFree: true,
          isLifetime: false,
          get name() {
            return m.pricing_plans_free_name();
          },
          get description() {
            return m.pricing_plans_free_description();
          },
          get features() {
            return [m.pricing_plans_free_features_0()];
          },
          get limits() {
            return [m.pricing_plans_free_limits_0()];
          },
        },

        // ── Hobby (subscription) ──────────────────────────────────────────
        hobby: {
          id: 'hobby',
          prices: [
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_HOBBY_MONTHLY ?? '',
              amount: SUBSCRIPTION_PRICES.hobby.monthly,
              currency: 'USD',
              interval: 'month',
            },
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_HOBBY_ANNUAL ?? '',
              amount: SUBSCRIPTION_PRICES.hobby.annual,
              currency: 'USD',
              interval: 'year',
            },
          ],
          isFree: false,
          isLifetime: false,
          get name() {
            return 'Hobby';
          },
          get description() {
            return 'Great for personal projects and casual creators';
          },
          get features() {
            return ['800 credits/month', '~16 videos per month'];
          },
          get limits() {
            return ['Lower monthly credit allowance than Pro'];
          },
        },

        // ── Pro (subscription) ────────────────────────────────────────────
        pro: {
          id: 'pro',
          prices: [
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_PRO_MONTHLY ?? '',
              amount: SUBSCRIPTION_PRICES.pro.monthly,
              currency: 'USD',
              interval: 'month',
            },
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_PRO_ANNUAL ?? '',
              amount: SUBSCRIPTION_PRICES.pro.annual,
              currency: 'USD',
              interval: 'year',
            },
          ],
          isFree: false,
          isLifetime: false,
          popular: true,
          get name() {
            return m.pricing_plans_pro_name();
          },
          get description() {
            return m.pricing_plans_pro_description();
          },
          get features() {
            return [m.pricing_plans_pro_features_0()];
          },
          get limits() {
            return [m.pricing_plans_pro_limits_0()];
          },
        },

        // ── Max (subscription) ────────────────────────────────────────────
        max: {
          id: 'max',
          prices: [
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_MAX_MONTHLY ?? '',
              amount: SUBSCRIPTION_PRICES.max.monthly,
              currency: 'USD',
              interval: 'month',
            },
            {
              type: 'subscription',
              priceId: clientEnv.VITE_STRIPE_PRICE_MAX_ANNUAL ?? '',
              amount: SUBSCRIPTION_PRICES.max.annual,
              currency: 'USD',
              interval: 'year',
            },
          ],
          isFree: false,
          isLifetime: false,
          get name() {
            return 'Max';
          },
          get description() {
            return 'For studios and power users at the best credit rate';
          },
          get features() {
            return ['7,000 credits/month', '~140 videos per month'];
          },
          get limits() {
            return ['Best for high-volume use only'];
          },
        },

        // ── Starter Pack (one-time credit pack) ───────────────────────────
        'starter-pack': {
          id: 'starter-pack',
          prices: [
            {
              type: 'one_time',
              priceId: clientEnv.VITE_STRIPE_PRICE_STARTER_PACK ?? '',
              amount: CREDIT_PACK_PRICES['starter-pack'],
              currency: 'USD',
            },
          ],
          isFree: false,
          isLifetime: false,
          get name() {
            return 'Starter Pack';
          },
          get description() {
            return 'One-time payment. No recurring billing.';
          },
          get features() {
            return ['500 one-time credits', '~10 videos'];
          },
          get limits() {
            return ['No monthly credit refresh'];
          },
        },

        // ── Creator Pack (one-time credit pack) ───────────────────────────
        'creator-pack': {
          id: 'creator-pack',
          prices: [
            {
              type: 'one_time',
              priceId: clientEnv.VITE_STRIPE_PRICE_CREATOR_PACK ?? '',
              amount: CREDIT_PACK_PRICES['creator-pack'],
              currency: 'USD',
            },
          ],
          isFree: false,
          isLifetime: false,
          popular: true,
          get name() {
            return 'Creator Pack';
          },
          get description() {
            return 'One-time payment. No recurring billing.';
          },
          get features() {
            return ['2,200 one-time credits', '~44 videos'];
          },
          get limits() {
            return ['No monthly credit refresh'];
          },
        },

        // ── Studio Pack (one-time credit pack) ────────────────────────────
        'studio-pack': {
          id: 'studio-pack',
          prices: [
            {
              type: 'one_time',
              priceId: clientEnv.VITE_STRIPE_PRICE_STUDIO_PACK ?? '',
              amount: CREDIT_PACK_PRICES['studio-pack'],
              currency: 'USD',
            },
          ],
          isFree: false,
          isLifetime: false,
          get name() {
            return 'Studio Pack';
          },
          get description() {
            return 'One-time payment. No recurring billing.';
          },
          get features() {
            return ['6,000 one-time credits', '~120 videos'];
          },
          get limits() {
            return ['No monthly credit refresh'];
          },
        },
      },
    },
  },
};
