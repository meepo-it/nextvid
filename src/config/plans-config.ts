/** Annual discount percentage shown in the pricing tab badge */
export const ANNUAL_DISCOUNT_PERCENT = 30;

/** Monthly credits per subscription plan */
export const SUBSCRIPTION_CREDITS = {
  free: 50,
  hobby: 800,
  pro: 3200,
  max: 7000,
} as const;

/** One-time credits per credit pack */
export const CREDIT_PACK_CREDITS = {
  'starter-pack': 500,
  'creator-pack': 2200,
  'studio-pack': 6000,
} as const;

/** Subscription prices in cents */
export const SUBSCRIPTION_PRICES = {
  hobby: { monthly: 990, annual: 6900 },
  pro: { monthly: 3990, annual: 27900 },
  max: { monthly: 7990, annual: 55900 },
} as const;

/** One-time credit pack prices in cents */
export const CREDIT_PACK_PRICES = {
  'starter-pack': 690,
  'creator-pack': 2990,
  'studio-pack': 6990,
} as const;
