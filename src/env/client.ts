import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

/**
 * Client-side env (build-time from Vite, import.meta.env)
 */
export const clientEnv = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_BASE_URL: z.url().default('http://localhost:3000'),

    // Payment (Stripe) — subscription plans
    VITE_STRIPE_PRICE_HOBBY_MONTHLY: z.string().optional(),
    VITE_STRIPE_PRICE_HOBBY_ANNUAL: z.string().optional(),
    VITE_STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
    VITE_STRIPE_PRICE_PRO_ANNUAL: z.string().optional(),
    VITE_STRIPE_PRICE_MAX_MONTHLY: z.string().optional(),
    VITE_STRIPE_PRICE_MAX_ANNUAL: z.string().optional(),

    // Payment (Stripe) — one-time credit packs
    VITE_STRIPE_PRICE_STARTER_PACK: z.string().optional(),
    VITE_STRIPE_PRICE_CREATOR_PACK: z.string().optional(),
    VITE_STRIPE_PRICE_STUDIO_PACK: z.string().optional(),

    // Analytics
    VITE_GOOGLE_ANALYTICS_ID: z.string().optional(),
    VITE_CLARITY_PROJECT_ID: z.string().optional(),
    VITE_PLAUSIBLE_SCRIPT: z.string().optional(),
    VITE_UMAMI_WEBSITE_ID: z.string().optional(),
    VITE_UMAMI_SCRIPT: z.string().optional(),
    VITE_OPENPANEL_CLIENT_ID: z.string().optional(),
    VITE_OPENPANEL_API_URL: z.string().optional(),

    // Chatbot (Crisp Chat)
    VITE_CRISP_WEBSITE_ID: z.string().optional(),

    // Affiliate (Affonso / PromoteKit)
    VITE_AFFILIATE_AFFONSO_ID: z.string().optional(),
    VITE_AFFILIATE_PROMOTEKIT_ID: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
});
