import { describe, it, expect } from 'vitest';
import {
  computeCreditCost,
  RESOLUTION_CREDIT_TIER,
  type ModelCreditCosts,
} from '@/lib/credit-utils';

// Representative model cost fixtures matching DB seed values in docs/pricing-strategy.md
const WAN27: ModelCreditCosts = {
  creditCost480p: 7,
  creditCost720p: 10,
  creditCost1080p: 15,
};
const HAPPYHORSE: ModelCreditCosts = {
  creditCost480p: 0,
  creditCost720p: 35,
  creditCost1080p: 52,
};
const HAILUO: ModelCreditCosts = {
  creditCost480p: 0,
  creditCost720p: 8,
  creditCost1080p: 12,
};
const VEO3_FAST: ModelCreditCosts = {
  creditCost480p: 0,
  creditCost720p: 2,
  creditCost1080p: 3,
};
const VEO3_QUALITY: ModelCreditCosts = {
  creditCost480p: 0,
  creditCost720p: 4,
  creditCost1080p: 6,
};
const SEEDANCE_FAST: ModelCreditCosts = {
  creditCost480p: 5,
  creditCost720p: 7,
  creditCost1080p: 11,
};
const VIDU_Q3_PRO: ModelCreditCosts = {
  creditCost480p: 10,
  creditCost720p: 14,
  creditCost1080p: 22,
};

describe('RESOLUTION_CREDIT_TIER', () => {
  it('maps 480p and 540p to low tier', () => {
    expect(RESOLUTION_CREDIT_TIER['480p']).toBe('low');
    expect(RESOLUTION_CREDIT_TIER['540p']).toBe('low');
  });

  it('maps 720p and 768p to mid tier', () => {
    expect(RESOLUTION_CREDIT_TIER['720p']).toBe('mid');
    expect(RESOLUTION_CREDIT_TIER['768p']).toBe('mid');
  });

  it('maps 1080p and 4k to high tier', () => {
    expect(RESOLUTION_CREDIT_TIER['1080p']).toBe('high');
    expect(RESOLUTION_CREDIT_TIER['4k']).toBe('high');
  });
});

describe('computeCreditCost — resolution tiers', () => {
  it('480p uses creditCost480p', () => {
    expect(computeCreditCost(WAN27, '480p', 5)).toBe(7 * 5); // 35
  });

  it('540p aliases to 480p tier', () => {
    expect(computeCreditCost(WAN27, '540p', 5)).toBe(7 * 5); // 35
    expect(computeCreditCost(WAN27, '540p', 5)).toBe(
      computeCreditCost(WAN27, '480p', 5)
    );
  });

  it('720p uses creditCost720p', () => {
    expect(computeCreditCost(WAN27, '720p', 5)).toBe(10 * 5); // 50
  });

  it('768p aliases to 720p tier (fixes old 768p inconsistency)', () => {
    expect(computeCreditCost(HAILUO, '768p', 6)).toBe(8 * 6); // 48
    expect(computeCreditCost(HAILUO, '768p', 6)).toBe(
      computeCreditCost(HAILUO, '720p', 6)
    );
  });

  it('1080p uses creditCost1080p', () => {
    expect(computeCreditCost(WAN27, '1080p', 5)).toBe(15 * 5); // 75
  });

  it('4k aliases to 1080p tier', () => {
    expect(computeCreditCost(VEO3_FAST, '4k', 8)).toBe(3 * 8); // 24
    expect(computeCreditCost(VEO3_FAST, '4k', 8)).toBe(
      computeCreditCost(VEO3_FAST, '1080p', 8)
    );
  });

  it('unknown resolution falls back to mid tier', () => {
    expect(computeCreditCost(WAN27, 'unknown' as string, 5)).toBe(10 * 5);
  });
});

describe('computeCreditCost — duration', () => {
  it('duration=0 (video-edit keep-original) estimates 5 seconds', () => {
    expect(computeCreditCost(WAN27, '720p', 0)).toBe(10 * 5); // 50
  });

  it('standard durations multiply correctly', () => {
    expect(computeCreditCost(WAN27, '720p', 2)).toBe(10 * 2); // 20
    expect(computeCreditCost(WAN27, '720p', 10)).toBe(10 * 10); // 100
    expect(computeCreditCost(WAN27, '720p', 15)).toBe(10 * 15); // 150
  });
});

describe('computeCreditCost — specific model scenarios', () => {
  it('Veo 3 Fast at 720p / 8s = 16 credits', () => {
    expect(computeCreditCost(VEO3_FAST, '720p', 8)).toBe(16);
  });

  it('Veo 3 Quality at 720p / 8s = 32 credits', () => {
    expect(computeCreditCost(VEO3_QUALITY, '720p', 8)).toBe(32);
  });

  it('Veo 3 Fast at 1080p / 8s = 24 credits', () => {
    expect(computeCreditCost(VEO3_FAST, '1080p', 8)).toBe(24);
  });

  it('HappyHorse at 720p / 5s = 175 credits', () => {
    expect(computeCreditCost(HAPPYHORSE, '720p', 5)).toBe(175);
  });

  it('HappyHorse at 1080p / 5s = 260 credits (matches pricing doc)', () => {
    expect(computeCreditCost(HAPPYHORSE, '1080p', 5)).toBe(260);
  });

  it('Hailuo 2.3 at 768p / 6s = 48 credits', () => {
    expect(computeCreditCost(HAILUO, '768p', 6)).toBe(48);
  });

  it('Seedance 2.0 Fast at 480p / 5s = 25 credits', () => {
    expect(computeCreditCost(SEEDANCE_FAST, '480p', 5)).toBe(25);
  });

  it('Vidu Q3 Pro at 540p / 5s uses low tier (same as 480p)', () => {
    expect(computeCreditCost(VIDU_Q3_PRO, '540p', 5)).toBe(10 * 5); // 50
  });

  it('Wan 2.7 at 720p / 5s = 50 credits (matches pricing doc)', () => {
    expect(computeCreditCost(WAN27, '720p', 5)).toBe(50);
  });

  it('Wan 2.7 at 720p / 2s = 20 credits (minimum)', () => {
    expect(computeCreditCost(WAN27, '720p', 2)).toBe(20);
  });
});

describe('computeCreditCost — misconfiguration guard', () => {
  it('returns 0 when creditCost is 0 for the given tier (server must guard this)', () => {
    // HappyHorse has no 480p support; creditCost480p=0
    expect(computeCreditCost(HAPPYHORSE, '480p', 5)).toBe(0);
  });

  it('zero-cost result indicates a model misconfiguration needing server rejection', () => {
    const misconfigured: ModelCreditCosts = {
      creditCost480p: 0,
      creditCost720p: 0,
      creditCost1080p: 0,
    };
    expect(computeCreditCost(misconfigured, '720p', 5)).toBe(0);
  });
});
