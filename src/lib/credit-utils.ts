// Resolution → credit tier mapping. 540p aliases to the 480p tier;
// 768p aliases to the 720p tier; 4k aliases to the 1080p tier.
// These align with the DB columns creditCost480p / creditCost720p / creditCost1080p.
export const RESOLUTION_CREDIT_TIER: Record<string, 'low' | 'mid' | 'high'> = {
  '480p': 'low',
  '540p': 'low',
  '720p': 'mid',
  '768p': 'mid',
  '1080p': 'high',
  '4k': 'high',
};

export interface ModelCreditCosts {
  /** Credits per second for the 480p/540p tier (0 = tier not supported) */
  creditCost480p: number;
  /** Credits per second for the 720p/768p tier */
  creditCost720p: number;
  /** Credits per second for the 1080p/4k tier */
  creditCost1080p: number;
}

/**
 * Compute the credits required for a video generation.
 * duration=0 (video-edit keep-original) is estimated as 5 s.
 * Returns 0 if the model has no credit cost configured for the given resolution tier.
 */
export function computeCreditCost(
  costs: ModelCreditCosts,
  resolution: string,
  duration: number
): number {
  const tier = RESOLUTION_CREDIT_TIER[resolution] ?? 'mid';
  const perSec =
    tier === 'low'
      ? costs.creditCost480p
      : tier === 'high'
        ? costs.creditCost1080p
        : costs.creditCost720p;
  return perSec * (duration === 0 ? 5 : duration);
}
