import { getPricePlans } from '@/lib/price-plan';
import { cn } from '@/lib/utils';
import * as m from '@/paraglide/messages.js';
import type { PricePlan } from '@/payment/types';
import { PaymentTypes, PlanIntervals } from '@/payment/types';
import { ANNUAL_DISCOUNT_PERCENT } from '@/config/plans-config';
import { useState } from 'react';
import { PricingCard } from './pricing-card';

type PricingMode = 'annual' | 'monthly' | 'credits';

interface PricingTableProps {
  metadata?: Record<string, string>;
  currentPlan?: PricePlan | null;
  className?: string;
}

export function PricingTable({
  metadata,
  currentPlan,
  className,
}: PricingTableProps) {
  const [mode, setMode] = useState<PricingMode>('monthly');
  const plans = Object.values(getPricePlans());
  const currentPlanId = currentPlan?.id ?? null;

  const freePlans = plans.filter((p) => p.isFree && !p.disabled);
  const subscriptionPlans = plans.filter(
    (p) =>
      !p.isFree &&
      !p.disabled &&
      p.prices.some(
        (pr) => !pr.disabled && pr.type === PaymentTypes.SUBSCRIPTION
      )
  );
  const creditPackPlans = plans.filter(
    (p) =>
      !p.isFree &&
      !p.disabled &&
      p.prices.length > 0 &&
      p.prices.every((pr) => pr.type === PaymentTypes.ONE_TIME)
  );

  const hasAnnual = subscriptionPlans.some((p) =>
    p.prices.some(
      (pr) =>
        pr.type === PaymentTypes.SUBSCRIPTION &&
        pr.interval === PlanIntervals.YEAR
    )
  );
  const hasMonthly = subscriptionPlans.some((p) =>
    p.prices.some(
      (pr) =>
        pr.type === PaymentTypes.SUBSCRIPTION &&
        pr.interval === PlanIntervals.MONTH
    )
  );
  const hasCreditPacks = creditPackPlans.length > 0;

  const interval = mode === 'annual' ? PlanIntervals.YEAR : PlanIntervals.MONTH;

  const shownSubscription = [...freePlans, ...subscriptionPlans];
  const total =
    mode === 'credits' ? creditPackPlans.length : shownSubscription.length;

  const gridCols = cn(
    'grid gap-6',
    total === 1 && 'mx-auto w-full max-w-md grid-cols-1',
    total === 2 && 'mx-auto w-full max-w-2xl grid-cols-1 md:grid-cols-2',
    total === 3 && 'grid-cols-1 md:grid-cols-3',
    total >= 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  );

  const showTabs = (hasMonthly || hasAnnual) && hasCreditPacks;

  return (
    <div className={cn('flex flex-col gap-10', className)}>
      {/* Tab selector */}
      {showTabs && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border bg-background p-1 shadow-sm">
            {hasAnnual && (
              <button
                type="button"
                onClick={() => setMode('annual')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  mode === 'annual'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m.pricing_yearly()}
                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                  Save {ANNUAL_DISCOUNT_PERCENT}%
                </span>
              </button>
            )}
            {hasMonthly && (
              <button
                type="button"
                onClick={() => setMode('monthly')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  mode === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m.pricing_monthly()}
              </button>
            )}
            {hasCreditPacks && (
              <button
                type="button"
                onClick={() => setMode('credits')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  mode === 'credits'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                One-Time Credit Pack
                <span
                  className={cn(
                    'text-xs transition-colors',
                    mode === 'credits'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  (no subscription)
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode description */}
      <p className="text-center text-sm text-muted-foreground -mt-4">
        {mode === 'credits'
          ? 'One-time payment. No recurring billing. Credits never expire.'
          : 'Flexible subscription, cancel anytime. No contracts — manage or cancel in account settings.'}
      </p>

      {/* Plan cards */}
      <div className={gridCols}>
        {mode === 'credits'
          ? creditPackPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                paymentType={PaymentTypes.ONE_TIME}
                metadata={metadata}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))
          : shownSubscription.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                interval={plan.isFree ? undefined : interval}
                paymentType={
                  plan.isFree ? undefined : PaymentTypes.SUBSCRIPTION
                }
                metadata={metadata}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))}
      </div>
    </div>
  );
}
