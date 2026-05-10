import { getDb } from '@/db';
import { payment, userCredit } from '@/db/app.schema';
import { SUBSCRIPTION_CREDITS } from '@/config/plans-config';
import { findPlanByPriceId } from '@/lib/price-plan';
import { and, eq, lt, or } from 'drizzle-orm';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Daily cron entry point — runs two independent jobs:
 * 1. Reset subscription credits for annual subscribers whose 30-day window has elapsed.
 * 2. Expire pack credits whose 90-day validity has passed.
 *
 * Monthly subscribers get their credits reset via Stripe invoice.paid (no cron needed).
 * Annual subscribers only get invoice.paid once per year, so we check daily.
 */
export async function runDailyCreditReset(): Promise<void> {
  console.log('>> [cron] daily credit reset start');
  await Promise.all([resetAnnualSubscriptionCredits(), expirePackCredits()]);
  console.log('<< [cron] daily credit reset done');
}

// ── Job 1: Annual subscription monthly reset ──────────────────────────────────

async function resetAnnualSubscriptionCredits(): Promise<void> {
  console.log('>> [cron] annual subscription credit reset');
  const db = getDb();
  const now = new Date();

  const annualPayments = await db
    .select({ userId: payment.userId, priceId: payment.priceId })
    .from(payment)
    .where(
      and(
        eq(payment.paid, true),
        eq(payment.interval, 'year'),
        or(eq(payment.status, 'active'), eq(payment.status, 'trialing'))
      )
    );

  if (annualPayments.length === 0) {
    console.log('<< [cron] no annual subscribers');
    return;
  }

  let resetCount = 0;

  for (const rec of annualPayments) {
    const plan = findPlanByPriceId(rec.priceId);
    if (!plan) continue;

    const planCredits =
      SUBSCRIPTION_CREDITS[plan.id as keyof typeof SUBSCRIPTION_CREDITS];
    if (!planCredits) continue;

    const [creditRow] = await db
      .select({ id: userCredit.id, lastCreditResetAt: userCredit.lastCreditResetAt })
      .from(userCredit)
      .where(eq(userCredit.userId, rec.userId))
      .limit(1);

    if (!creditRow) {
      await db.insert(userCredit).values({
        id: crypto.randomUUID(),
        userId: rec.userId,
        subscriptionCredits: planCredits,
        packCredits: 0,
        lastCreditResetAt: now,
        createdAt: now,
        updatedAt: now,
      });
      resetCount++;
      continue;
    }

    if (
      creditRow.lastCreditResetAt &&
      now.getTime() - creditRow.lastCreditResetAt.getTime() < THIRTY_DAYS_MS
    ) {
      continue;
    }

    // Only reset subscriptionCredits — packCredits are independent
    await db
      .update(userCredit)
      .set({ subscriptionCredits: planCredits, lastCreditResetAt: now, updatedAt: now })
      .where(eq(userCredit.userId, rec.userId));

    console.log(`[cron] reset ${planCredits} subscription credits for user ${rec.userId} (plan: ${plan.id})`);
    resetCount++;
  }

  console.log(`<< [cron] annual reset done, ${resetCount} users reset`);
}

// ── Job 2: Expire pack credits ────────────────────────────────────────────────

async function expirePackCredits(): Promise<void> {
  console.log('>> [cron] pack credit expiry check');
  const db = getDb();
  const now = new Date();

  // Find all users whose pack has expired and still has credits remaining
  const expired = await db
    .select({ userId: userCredit.userId, packCredits: userCredit.packCredits })
    .from(userCredit)
    .where(
      and(
        lt(userCredit.packCreditsExpiresAt, now),
        // packCredits > 0 — Drizzle SQLite doesn't have a gt helper that takes 0 easily,
        // so we rely on the application-level check below after fetching
      )
    );

  const toExpire = expired.filter((r) => r.packCredits > 0);

  if (toExpire.length === 0) {
    console.log('<< [cron] no expired pack credits to clear');
    return;
  }

  for (const row of toExpire) {
    await db
      .update(userCredit)
      .set({ packCredits: 0, packCreditsExpiresAt: null, updatedAt: now })
      .where(eq(userCredit.userId, row.userId));

    console.log(`[cron] expired ${row.packCredits} pack credits for user ${row.userId}`);
  }

  console.log(`<< [cron] expired pack credits cleared for ${toExpire.length} users`);
}
