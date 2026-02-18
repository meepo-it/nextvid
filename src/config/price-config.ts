import type { PlanConfig } from '../types';
import { websiteConfig } from './website';

/** Price plan details for pricing table */
export interface PricePlanDetails extends PlanConfig {
  name: string;
  description: string;
  features: string[];
  limits: string[];
}

/**
 * Price plans
 */
export function getPricePlans(): Record<string, PricePlanDetails> {
  const plans: Record<string, PricePlanDetails> = {};
  const config = websiteConfig.price?.plans;
  if (!config) return plans;

  if (config.free) {
    plans.free = {
      ...config.free,
      name: 'Free',
      description: 'Get started with basic features',
      features: [
        'Basic feature set',
        'Community support',
        'Limited usage',
        'Standard limits',
      ],
      limits: ['Limit 1', 'Limit 2', 'Limit 3'],
    };
  }
  if (config.pro) {
    plans.pro = {
      ...config.pro,
      name: 'Pro',
      description: 'For professionals and teams',
      features: [
        'All Free features',
        'Priority support',
        'Advanced features',
        'Higher limits',
        'API access',
      ],
      limits: ['Limit 1', 'Limit 2'],
    };
  }
  if (config.lifetime) {
    plans.lifetime = {
      ...config.lifetime,
      name: 'Lifetime',
      description: 'One-time payment, forever access',
      features: [
        'All Pro features',
        'Lifetime updates',
        'No recurring fees',
        'Premium support',
        'Early access',
        'Custom requests',
        'Unlimited usage',
      ],
      limits: [],
    };
  }
  return plans;
}
