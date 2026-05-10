'use client';

import { cn } from '@/lib/utils';
import { computeCreditCost, type ModelCreditCosts } from '@/lib/credit-utils';
import type { VideoResolution } from '@/config/video-models';
import * as m from '@/paraglide/messages.js';
import { Link } from '@tanstack/react-router';
import { IconBolt } from '@tabler/icons-react';

interface CreditsDisplayProps {
  resolution: VideoResolution;
  duration: number;
  balance: number | undefined;
  isLoadingBalance: boolean;
  /** Per-model credit costs; required for accurate cost display */
  creditCosts: ModelCreditCosts | undefined;
}

export function CreditsDisplay({
  resolution,
  duration,
  balance,
  isLoadingBalance,
  creditCosts,
}: CreditsDisplayProps) {
  const cost = creditCosts
    ? computeCreditCost(creditCosts, resolution, duration)
    : null;
  const insufficient = balance !== undefined && cost !== null && balance < cost;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">
          {m.video_credits_balance()}:
        </span>
        {isLoadingBalance ? (
          <span className="text-muted-foreground">--</span>
        ) : (
          <span
            className={cn(
              'font-semibold tabular-nums',
              insufficient && 'text-destructive'
            )}
          >
            {balance ?? 0}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{m.video_credits_cost()}:</span>
        <span className="font-semibold tabular-nums">
          {cost !== null ? cost : '--'}
        </span>
        <IconBolt className="size-3.5 text-amber-500" />
      </div>

      <Link
        to="/settings"
        className={cn(
          'text-sm font-medium hover:underline',
          insufficient ? 'text-destructive' : 'text-primary'
        )}
      >
        {insufficient
          ? m.video_credits_insufficient()
          : m.video_credits_recharge()}
      </Link>
    </div>
  );
}
