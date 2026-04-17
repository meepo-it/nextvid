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
 * Feature requests — user-submitted ideas with voting
 */
export const featureRequest = sqliteTable(
  'feature_request',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: text('status').notNull().default('submitted'), // submitted | planned | in_progress | done
    category: text('category'),
    // BCP-47 locale code recorded at submission time. Lets us:
    //   1. group/filter requests by language in the admin UI
    //   2. notify the author back in their original language
    //   3. eventually offer translations of the body if/when we add them
    locale: text('locale').notNull().default('en'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    voteCount: integer('vote_count').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('feature_request_user_id_idx').on(table.userId),
    index('feature_request_status_idx').on(table.status),
    index('feature_request_vote_count_idx').on(table.voteCount),
  ]
);

export const featureRequestRelations = relations(featureRequest, ({ one, many }) => ({
  user: one(user, { fields: [featureRequest.userId], references: [user.id] }),
  votes: many(featureVote),
}));

/**
 * Feature votes — one vote per user per feature request
 */
export const featureVote = sqliteTable(
  'feature_vote',
  {
    id: text('id').primaryKey(),
    featureRequestId: text('feature_request_id')
      .notNull()
      .references(() => featureRequest.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('feature_vote_unique_idx').on(table.featureRequestId, table.userId),
    index('feature_vote_feature_id_idx').on(table.featureRequestId),
    index('feature_vote_user_id_idx').on(table.userId),
  ]
);

export const featureVoteRelations = relations(featureVote, ({ one }) => ({
  featureRequest: one(featureRequest, {
    fields: [featureVote.featureRequestId],
    references: [featureRequest.id],
  }),
  user: one(user, { fields: [featureVote.userId], references: [user.id] }),
}));