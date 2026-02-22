import { getDb } from '@/db';
import { payment } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import type { Payment } from '@/db/types';
import {
  PAYMENT_RECORD_RETRY_ATTEMPTS,
  PAYMENT_RECORD_RETRY_DELAY,
} from '@/lib/constants';
import { findPlanByPlanId, findPriceInPlan } from '@/lib/price-plan';
import { desc, eq } from 'drizzle-orm';
import { Stripe } from 'stripe';
import type {
  CheckoutResult,
  CreateCheckoutParams,
  CreatePortalParams,
  PaymentProvider,
  PaymentStatus,
  PlanInterval,
  PortalResult,
} from '../types';
import { PlanIntervals, PaymentScenes, PaymentTypes } from '../types';

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not set');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    this.stripe = new Stripe(apiKey);
    this.webhookSecret = webhookSecret;
  }

  getProviderName(): string {
    return 'stripe';
  }

  private async createOrGetCustomer(
    email: string,
    name?: string
  ): Promise<string> {
    const customers = await this.stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      const userId = await this.findUserIdByCustomerId(customerId);
      if (!userId) {
        await this.updateUserWithCustomerId(customerId, email);
      }
      return customerId;
    }
    const customer = await this.stripe.customers.create({
      email,
      name: name ?? undefined,
    });
    await this.updateUserWithCustomerId(customer.id, email);
    return customer.id;
  }

  private async updateUserWithCustomerId(
    customerId: string,
    email: string
  ): Promise<void> {
    const db = getDb();
    await db
      .update(user)
      .set({
        customerId,
        updatedAt: new Date(),
      })
      .where(eq(user.email, email));
  }

  private async findUserIdByCustomerId(
    customerId: string
  ): Promise<string | undefined> {
    const db = getDb();
    const rows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.customerId, customerId))
      .limit(1);
    return rows[0]?.id;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const {
      planId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    const plan = findPlanByPlanId(planId);
    if (!plan) throw new Error(`Plan ${planId} not found`);
    const price = findPriceInPlan(planId, priceId);
    if (!price) throw new Error(`Price ${priceId} not found in plan ${planId}`);

    const customerId = await this.createOrGetCustomer(
      customerEmail,
      metadata?.userName
    );
    const customMetadata = { ...metadata, planId, priceId };

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode:
        price.type === PaymentTypes.SUBSCRIPTION ? 'subscription' : 'payment',
      success_url: successUrl ?? '',
      cancel_url: cancelUrl ?? '',
      metadata: customMetadata,
      allow_promotion_codes: price.allowPromotionCode ?? false,
      customer: customerId,
    };

    if (locale) {
      checkoutParams.locale = this.mapLocaleToStripeLocale(
        locale
      ) as Stripe.Checkout.SessionCreateParams.Locale;
    }

    if (price.type === PaymentTypes.ONE_TIME) {
      checkoutParams.payment_intent_data = { metadata: customMetadata };
      checkoutParams.invoice_creation = { enabled: true };
    }

    if (price.type === PaymentTypes.SUBSCRIPTION) {
      checkoutParams.subscription_data = { metadata: customMetadata };
      if (price.trialPeriodDays && price.trialPeriodDays > 0) {
        checkoutParams.subscription_data.trial_period_days =
          price.trialPeriodDays;
      }
    }

    const session = await this.stripe.checkout.sessions.create(checkoutParams);
    return { url: session.url!, id: session.id };
  }

  async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId, returnUrl, locale } = params;
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl ?? '',
      locale: locale
        ? (this.mapLocaleToStripeLocale(
            locale
          ) as Stripe.BillingPortal.SessionCreateParams.Locale)
        : undefined,
    });
    return { url: session.url };
  }

  async handleWebhookEvent(payload: string, signature: string): Promise<void> {
    const event = await this.stripe.webhooks.constructEventAsync(
      payload,
      signature,
      this.webhookSecret
    );
    const eventType = event.type;

    if (eventType.startsWith('customer.subscription.')) {
      const stripeSub = event.data.object as Stripe.Subscription;
      switch (eventType) {
        case 'customer.subscription.created':
          break;
        case 'customer.subscription.updated':
          await this.onUpdateSubscription(stripeSub);
          break;
        case 'customer.subscription.deleted':
          await this.onDeleteSubscription(stripeSub);
          break;
      }
    } else if (eventType === 'invoice.paid') {
      await this.onInvoicePaid(event.data.object as Stripe.Invoice);
    } else if (eventType === 'checkout.session.completed') {
      await this.onCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
    }
  }

  private async findPaymentRecord(
    invoice: Stripe.Invoice
  ): Promise<Payment | null> {
    const db = getDb();
    if (invoice.id) {
      const byInvoice = await db
        .select()
        .from(payment)
        .where(eq(payment.invoiceId, invoice.id))
        .orderBy(desc(payment.createdAt))
        .limit(1);
      if (byInvoice.length > 0) return byInvoice[0];
    }
    const subId = this.extractSubscriptionId(invoice);
    if (subId) {
      const bySub = await db
        .select()
        .from(payment)
        .where(eq(payment.subscriptionId, subId))
        .orderBy(desc(payment.createdAt))
        .limit(1);
      if (bySub.length > 0) return bySub[0];
    }
    return null;
  }

  private async findPaymentRecordWithRetry(
    invoice: Stripe.Invoice
  ): Promise<Payment | null> {
    for (let attempt = 1; attempt <= PAYMENT_RECORD_RETRY_ATTEMPTS; attempt++) {
      const record = await this.findPaymentRecord(invoice);
      if (record) return record;
      if (attempt < PAYMENT_RECORD_RETRY_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, PAYMENT_RECORD_RETRY_DELAY));
      }
    }
    return null;
  }

  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const paymentRecord = await this.findPaymentRecordWithRetry(invoice);
    if (!paymentRecord) {
      throw new Error(`Payment record not found for invoice: ${invoice.id}`);
    }
    try {
      const isSubscription = paymentRecord.type === PaymentTypes.SUBSCRIPTION;
      if (isSubscription) {
        await this.updateSubscriptionPayment(invoice, paymentRecord);
      } else {
        await this.updateOneTimePayment(paymentRecord);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('unique constraint')) {
        return;
      }
      throw err;
    }
  }

  private async updateSubscriptionPayment(
    invoice: Stripe.Invoice,
    paymentRecord: Payment
  ): Promise<void> {
    const subscriptionId =
      (invoice.subscription as string) ?? paymentRecord.subscriptionId ?? null;
    if (!subscriptionId) return;

    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) return;

    const periodStart = this.getPeriodStart(subscription);
    const periodEnd = this.getPeriodEnd(subscription);
    const trialStart = subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null;
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;
    const db = getDb();
    await db
      .update(payment)
      .set({
        paid: true,
        interval: this.mapStripeIntervalToPlanInterval(subscription),
        status: this.mapSubscriptionStatusToPaymentStatus(subscription.status),
        periodStart,
        periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart,
        trialEnd,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, paymentRecord.id));
  }

  private async updateOneTimePayment(paymentRecord: Payment): Promise<void> {
    const db = getDb();
    await db
      .update(payment)
      .set({
        status: 'completed',
        paid: true,
        updatedAt: new Date(),
      })
      .where(eq(payment.id, paymentRecord.id));
  }

  private async onUpdateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) return;
    const db = getDb();
    await db
      .update(payment)
      .set({
        priceId,
        interval: this.mapStripeIntervalToPlanInterval(stripeSubscription),
        status: this.mapSubscriptionStatusToPaymentStatus(
          stripeSubscription.status
        ),
        periodStart: this.getPeriodStart(stripeSubscription),
        periodEnd: this.getPeriodEnd(stripeSubscription),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : undefined,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, stripeSubscription.id));
  }

  private async onDeleteSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const db = getDb();
    await db
      .update(payment)
      .set({
        status: this.mapSubscriptionStatusToPaymentStatus(
          stripeSubscription.status
        ),
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, stripeSubscription.id));
  }

  private async onCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    if (session.mode === 'subscription') {
      await this.createSubscriptionPaymentRecord(session);
    } else if (session.mode === 'payment') {
      await this.createOneTimePaymentRecord(session);
    }
  }

  private async createSubscriptionPaymentRecord(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const subscriptionId = session.subscription as string | null;
    if (!subscriptionId) return;

    const stripeSub = await this.stripe.subscriptions.retrieve(subscriptionId);
    const priceId = stripeSub.items.data[0]?.price.id;
    if (!priceId) return;

    const userId = session.metadata?.userId;
    if (!userId) return;
    const customerId = session.customer as string;
    const invoiceId = session.invoice as string | null;
    const now = new Date();

    const db = getDb();
    try {
      await db.insert(payment).values({
        id: crypto.randomUUID(),
        priceId,
        type: PaymentTypes.SUBSCRIPTION,
        scene: PaymentScenes.SUBSCRIPTION,
        userId,
        customerId,
        subscriptionId,
        sessionId: session.id,
        invoiceId,
        paid: false,
        interval: this.mapStripeIntervalToPlanInterval(stripeSub),
        status: this.mapSubscriptionStatusToPaymentStatus(stripeSub.status),
        periodStart: this.getPeriodStart(stripeSub),
        periodEnd: this.getPeriodEnd(stripeSub),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        trialStart: stripeSub.trial_start
          ? new Date(stripeSub.trial_start * 1000)
          : null,
        trialEnd: stripeSub.trial_end
          ? new Date(stripeSub.trial_end * 1000)
          : null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('unique constraint')) {
        return;
      }
      throw e;
    }
  }

  private async createOneTimePaymentRecord(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const priceId = session.metadata?.priceId;
    if (!priceId) return;
    const userId = session.metadata?.userId;
    if (!userId) return;
    const customerId = session.customer as string;
    const invoiceId = session.invoice as string | null;
    const now = new Date();

    const db = getDb();
    try {
      await db.insert(payment).values({
        id: crypto.randomUUID(),
        priceId,
        type: PaymentTypes.ONE_TIME,
        scene: PaymentScenes.LIFETIME,
        userId,
        customerId,
        sessionId: session.id,
        invoiceId,
        paid: false,
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('unique constraint')) {
        return;
      }
      throw e;
    }
  }

  private mapStripeIntervalToPlanInterval(
    sub: Stripe.Subscription
  ): PlanInterval {
    const interval = sub.items.data[0]?.plan.interval;
    return interval === 'year' ? PlanIntervals.YEAR : PlanIntervals.MONTH;
  }

  private mapSubscriptionStatusToPaymentStatus(
    status: Stripe.Subscription.Status
  ): PaymentStatus {
    const map: Record<string, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      past_due: 'past_due',
      trialing: 'trialing',
      unpaid: 'unpaid',
      paused: 'paused',
    };
    return map[status] ?? 'failed';
  }

  private mapLocaleToStripeLocale(locale: string): string {
    const supported = [
      'bg',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'es',
      'et',
      'fi',
      'fil',
      'fr',
      'hr',
      'hu',
      'id',
      'it',
      'ja',
      'ko',
      'lt',
      'lv',
      'ms',
      'mt',
      'nb',
      'nl',
      'pl',
      'pt',
      'ro',
      'ru',
      'sk',
      'sl',
      'sv',
      'th',
      'tr',
      'vi',
      'zh',
    ];
    if (supported.includes(locale)) return locale;
    const base = locale.split('-')[0];
    return supported.includes(base) ? base : 'auto';
  }

  private extractSubscriptionId(invoice: Stripe.Invoice): string | null {
    const sub = invoice.subscription;
    if (typeof sub === 'string') return sub;
    if (sub && typeof sub === 'object' && 'id' in sub) return sub.id;
    for (const line of invoice.lines?.data ?? []) {
      const s = line.subscription;
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && 'id' in s) return s.id;
    }
    return null;
  }

  private getPeriodStart(sub: Stripe.Subscription): Date | undefined {
    const unix =
      (sub as { current_period_start?: number }).current_period_start ??
      sub.items?.data?.[0]?.current_period_start;
    return typeof unix === 'number' ? new Date(unix * 1000) : undefined;
  }

  private getPeriodEnd(sub: Stripe.Subscription): Date | undefined {
    const unix =
      (sub as { current_period_end?: number }).current_period_end ??
      sub.items?.data?.[0]?.current_period_end;
    return typeof unix === 'number' ? new Date(unix * 1000) : undefined;
  }
}
