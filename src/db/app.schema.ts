/**
 * Application database schema (non-auth tables).
 * Add your app tables here; keep Better Auth tables in auth.schema.ts.
 */

import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';
import type { PaymentScene, PaymentStatus, PaymentType, PlanInterval } from '@/payment/types';

/** 
 * Payment: subscription and one-time 
 */
export const payment = sqliteTable(
  'payment',
  {
    id: text('id').primaryKey(),
    priceId: text('price_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').notNull(),
    subscriptionId: text('subscription_id'),
    sessionId: text('session_id'),
    invoiceId: text('invoice_id').unique(),
    type: text('type').notNull().$type<PaymentType>(), // 'subscription' | 'one_time'
    scene: text('scene').$type<PaymentScene>(), // 'subscription' | 'lifetime'
    interval: text('interval').$type<PlanInterval>(), // 'month' | 'year'
    status: text('status').notNull().$type<PaymentStatus>(),
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    periodStart: integer('period_start', { mode: 'timestamp_ms' }),
    periodEnd: integer('period_end', { mode: 'timestamp_ms' }),
    cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }),
    trialStart: integer('trial_start', { mode: 'timestamp_ms' }),
    trialEnd: integer('trial_end', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('payment_user_id_idx').on(table.userId),
    index('payment_customer_id_idx').on(table.customerId),
    index('payment_subscription_id_idx').on(table.subscriptionId),
    index('payment_session_id_idx').on(table.sessionId),
    index('payment_invoice_id_idx').on(table.invoiceId),
    index('payment_paid_idx').on(table.paid),
    index('payment_user_paid_idx').on(table.userId, table.paid),
  ]
);

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, { fields: [payment.userId], references: [user.id] }),
}));

/**
 * User files
 * metadata for files uploaded to R2 (path userfiles/{userId}/xxx);
 * filename = stored name on R2 (e.g. uuid.ext);
 * originalName = user's file name.
 */
export const userFiles = sqliteTable(
  'user_files',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    contentType: text('content_type').notNull(),
    size: integer('size').notNull(),
    r2Key: text('r2_key').notNull(),
    isPublic: integer('is_public', { mode: 'boolean' }),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('user_files_user_id_idx').on(table.userId),
    index('user_files_r2_key_idx').on(table.r2Key),
  ]
);

export const userFilesRelations = relations(userFiles, ({ one }) => ({
  user: one(user, {
    fields: [userFiles.userId],
    references: [user.id],
  }),
}));

/**
 * User credits — current balance per user
 */
export const userCredit = sqliteTable(
  'user_credit',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Monthly allowance from active subscription — reset each billing cycle */
    subscriptionCredits: integer('subscription_credits').notNull().default(0),
    /** Accumulated one-time pack credits — independent of subscription */
    packCredits: integer('pack_credits').notNull().default(0),
    /** Pack credits expire 90 days after the most recent pack purchase */
    packCreditsExpiresAt: integer('pack_credits_expires_at', { mode: 'timestamp_ms' }),
    /** Last time subscription credits were reset — used by annual renewal cron */
    lastCreditResetAt: integer('last_credit_reset_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('user_credit_user_id_idx').on(table.userId),
  ]
);

export const userCreditRelations = relations(userCredit, ({ one }) => ({
  user: one(user, { fields: [userCredit.userId], references: [user.id] }),
}));

/**
 * Video generation jobs
 */
export const videoGeneration = sqliteTable(
  'video_generation',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // Generation params
    type: text('type').notNull(),        // text-to-video | image-to-video | reference-to-video | video-edit
    provider: text('provider').notNull(), // apimart | wan | kie
    model: text('model').notNull(),       // e.g. wan2.7, kling-v3
    providerModel: text('provider_model').notNull(), // actual model name sent to provider
    prompt: text('prompt'),
    negativePrompt: text('negative_prompt'),
    imageUrl: text('image_url'),
    videoUrl: text('video_url'),
    mediaUrls: text('media_urls'),        // JSON array of additional media
    resolution: text('resolution').notNull(),
    duration: integer('duration').notNull(),
    aspectRatio: text('aspect_ratio').notNull(),
    // Job tracking
    status: text('status').notNull().default('pending'), // pending | submitted | running | completed | failed
    providerTaskId: text('provider_task_id'),
    outputVideoUrl: text('output_video_url'),
    outputDuration: integer('output_duration'),
    providerPrompt: text('provider_prompt'), // final prompt used by provider
    creditsUsed: integer('credits_used').notNull().default(0),
    errorMessage: text('error_message'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('video_gen_user_id_idx').on(table.userId),
    index('video_gen_status_idx').on(table.status),
    index('video_gen_type_idx').on(table.type),
    index('video_gen_created_at_idx').on(table.createdAt),
  ]
);

export const videoGenerationRelations = relations(videoGeneration, ({ one }) => ({
  user: one(user, { fields: [videoGeneration.userId], references: [user.id] }),
}));

/**
 * Video provider — one row per vendor (ApiMart, etc.)
 */
export const videoProvider = sqliteTable('video_provider', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),             // 'apimart' — used in adapter registry
  displayName: text('display_name').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  apiKeyEnvVar: text('api_key_env_var').notNull(), // env var name, e.g. 'APIMART_API_KEY'
  baseUrl: text('base_url'),
  notes: text('notes'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

/**
 * Video model config — one row per model within a provider
 */
export const videoModelConfig = sqliteTable(
  'video_model_config',
  {
    id: text('id').primaryKey(),
    providerId: text('provider_id')
      .notNull()
      .references(() => videoProvider.id, { onDelete: 'cascade' }),
    modelKey: text('model_key').notNull(),               // our internal key, e.g. 'wan2.7'
    providerModelName: text('provider_model_name').notNull(), // sent to API, e.g. 'wan2.7'
    displayNameEn: text('display_name_en').notNull(),
    displayNameZh: text('display_name_zh').notNull(),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    supportedTypes: text('supported_types').notNull(),         // JSON: string[]
    supportedResolutions: text('supported_resolutions').notNull(), // JSON: string[]
    supportedAspectRatios: text('supported_aspect_ratios').notNull(), // JSON: string[]
    supportedDurations: text('supported_durations').notNull(),   // JSON: number[]
    defaultResolution: text('default_resolution').notNull(),
    defaultDuration: integer('default_duration').notNull(),
    defaultAspectRatio: text('default_aspect_ratio').notNull(),
    creditCost480p: integer('credit_cost_480p').notNull().default(2),
    creditCost720p: integer('credit_cost_720p').notNull().default(3),
    creditCost1080p: integer('credit_cost_1080p').notNull().default(5),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('video_model_provider_idx').on(table.providerId),
    uniqueIndex('video_model_key_provider_idx').on(table.modelKey, table.providerId),
  ]
);

export const videoProviderRelations = relations(videoProvider, ({ many }) => ({
  models: many(videoModelConfig),
}));

export const videoModelConfigRelations = relations(videoModelConfig, ({ one }) => ({
  provider: one(videoProvider, { fields: [videoModelConfig.providerId], references: [videoProvider.id] }),
}));