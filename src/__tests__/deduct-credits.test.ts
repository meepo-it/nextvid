/**
 * Unit tests for deductCredits — dual-balance credit deduction logic.
 *
 * Rules under test:
 *   1. subscriptionCredits consumed first; packCredits used only for the remainder.
 *   2. Pack credits whose packCreditsExpiresAt < now (or null) are treated as 0.
 *   3. If total available < amount, return false (never partial deduction).
 *   4. Optimistic lock: if the UPDATE affects 0 rows, return false.
 *   5. DeductResult splits must sum to the exact amount requested.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Module mocks (hoisted before imports) ─────────────────────────────────────

const mockDbChain = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  returning: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
};

vi.mock('@/db', () => ({ getDb: vi.fn(() => mockDbChain) }));
vi.mock('@/db/app.schema', () => ({
  userCredit: {},
  videoGeneration: {},
  videoModelConfig: {},
  videoProvider: {},
}));
vi.mock('@/db/auth.schema', () => ({ user: {} }));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args: unknown[]) => ({ args, op: 'and' })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values, op: 'sql' })),
  asc: vi.fn((col: unknown) => ({ col, dir: 'asc' })),
  desc: vi.fn((col: unknown) => ({ col, dir: 'desc' })),
  count: vi.fn(() => ({ op: 'count' })),
}));

// Heavy dependencies not needed for deductCredits tests
vi.mock('cloudflare:workers', () => ({ env: {} }));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => {
    const stub = { middleware: vi.fn(), inputValidator: vi.fn(), handler: vi.fn() };
    stub.middleware.mockReturnValue(stub);
    stub.inputValidator.mockReturnValue(stub);
    stub.handler.mockReturnValue(stub);
    return stub;
  }),
}));
vi.mock('@/env/server', () => ({ serverEnv: {} }));
vi.mock('@/lib/credit-utils', () => ({ computeCreditCost: vi.fn() }));
vi.mock('@/video/provider/apimart', () => ({
  getTaskStatus: vi.fn(),
  submitVideoJob: vi.fn(),
  submitVideoRemix: vi.fn(),
}));
vi.mock('@/video/adapters/registry', () => ({ getAdapter: vi.fn() }));
vi.mock('@/middlewares/auth-middleware', () => ({ authApiMiddleware: {} }));

import { deductCredits } from '@/api/video-generation';

// ── Helpers ───────────────────────────────────────────────────────────────────

function resetChain() {
  mockDbChain.select.mockReturnValue(mockDbChain);
  mockDbChain.from.mockReturnValue(mockDbChain);
  mockDbChain.where.mockReturnValue(mockDbChain);
  mockDbChain.limit.mockResolvedValue([]);
  mockDbChain.update.mockReturnValue(mockDbChain);
  mockDbChain.set.mockReturnValue(mockDbChain);
  mockDbChain.returning.mockResolvedValue([{ id: 'uc_1' }]); // optimistic lock success by default
  mockDbChain.insert.mockReturnValue(mockDbChain);
  mockDbChain.values.mockResolvedValue(undefined);
}

/**
 * Make getOrCreateUserCredit return an existing row (1 limit call).
 * deductCredits then does 1 update + returning call.
 */
function setupCreditRow(row: {
  subscriptionCredits: number;
  packCredits: number;
  packCreditsExpiresAt: Date | null;
}) {
  mockDbChain.limit.mockResolvedValueOnce([
    { id: 'uc_1', userId: 'user_test', ...row },
  ]);
}

const FUTURE = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
const PAST   = new Date(Date.now() - 1);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('deductCredits — subscription credits only', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('deducts entirely from subscriptionCredits when sufficient', async () => {
    setupCreditRow({ subscriptionCredits: 500, packCredits: 200, packCreditsExpiresAt: FUTURE });

    const result = await deductCredits('user_test', 100);

    expect(result).toEqual({ subscriptionDeducted: 100, packDeducted: 0 });
  });

  it('set() uses correct remaining subscriptionCredits and leaves packCredits unchanged', async () => {
    setupCreditRow({ subscriptionCredits: 500, packCredits: 200, packCreditsExpiresAt: FUTURE });

    await deductCredits('user_test', 100);

    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: 400, packCredits: 200 })
    );
  });

  it('deducts all subscriptionCredits to zero when amount equals the balance', async () => {
    setupCreditRow({ subscriptionCredits: 300, packCredits: 0, packCreditsExpiresAt: null });

    const result = await deductCredits('user_test', 300);

    expect(result).toEqual({ subscriptionDeducted: 300, packDeducted: 0 });
    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: 0, packCredits: 0 })
    );
  });
});

describe('deductCredits — subscription + pack split', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('uses packCredits for the remainder after subscriptionCredits are exhausted', async () => {
    setupCreditRow({ subscriptionCredits: 50, packCredits: 200, packCreditsExpiresAt: FUTURE });

    const result = await deductCredits('user_test', 100);

    expect(result).toEqual({ subscriptionDeducted: 50, packDeducted: 50 });
  });

  it('set() reflects the correct remaining split', async () => {
    setupCreditRow({ subscriptionCredits: 50, packCredits: 200, packCreditsExpiresAt: FUTURE });

    await deductCredits('user_test', 100);

    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: 0, packCredits: 150 })
    );
  });

  it('subscriptionDeducted + packDeducted always equals the requested amount', async () => {
    setupCreditRow({ subscriptionCredits: 120, packCredits: 300, packCreditsExpiresAt: FUTURE });

    const result = await deductCredits('user_test', 250);

    expect(result).not.toBe(false);
    if (result !== false) {
      expect(result.subscriptionDeducted + result.packDeducted).toBe(250);
    }
  });

  it('deducts entirely from packCredits when subscriptionCredits is 0', async () => {
    setupCreditRow({ subscriptionCredits: 0, packCredits: 500, packCreditsExpiresAt: FUTURE });

    const result = await deductCredits('user_test', 200);

    expect(result).toEqual({ subscriptionDeducted: 0, packDeducted: 200 });
  });
});

describe('deductCredits — expired pack credits', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('treats packCredits as 0 when packCreditsExpiresAt is in the past', async () => {
    setupCreditRow({ subscriptionCredits: 200, packCredits: 1000, packCreditsExpiresAt: PAST });

    // Available = 200 (sub) + 0 (pack expired) = 200; request 200 → OK
    const result = await deductCredits('user_test', 200);

    expect(result).toEqual({ subscriptionDeducted: 200, packDeducted: 0 });
  });

  it('treats packCredits as 0 when packCreditsExpiresAt is null', async () => {
    setupCreditRow({ subscriptionCredits: 100, packCredits: 999, packCreditsExpiresAt: null });

    const result = await deductCredits('user_test', 100);

    expect(result).toEqual({ subscriptionDeducted: 100, packDeducted: 0 });
  });

  it('returns false when sub insufficient and pack is expired', async () => {
    setupCreditRow({ subscriptionCredits: 50, packCredits: 1000, packCreditsExpiresAt: PAST });

    // Available = 50; requesting 200 → false
    const result = await deductCredits('user_test', 200);

    expect(result).toBe(false);
  });

  it('does not deduct from expired packCredits even when combined with subscriptionCredits', async () => {
    setupCreditRow({ subscriptionCredits: 100, packCredits: 500, packCreditsExpiresAt: PAST });

    await deductCredits('user_test', 100);

    // packCredits column must stay at 500 (expired pack is not touched in the deduction)
    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ packCredits: 500 })
    );
  });
});

describe('deductCredits — insufficient balance', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('returns false when both balances are 0', async () => {
    setupCreditRow({ subscriptionCredits: 0, packCredits: 0, packCreditsExpiresAt: null });

    expect(await deductCredits('user_test', 1)).toBe(false);
  });

  it('returns false when total < amount (no partial deduction)', async () => {
    setupCreditRow({ subscriptionCredits: 30, packCredits: 50, packCreditsExpiresAt: FUTURE });

    // total = 80, requesting 100
    const result = await deductCredits('user_test', 100);

    expect(result).toBe(false);
    // update must never be called — no partial deductions
    expect(mockDbChain.update).not.toHaveBeenCalled();
  });
});

describe('deductCredits — optimistic locking', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('returns false when UPDATE affects 0 rows (concurrent deduction race)', async () => {
    setupCreditRow({ subscriptionCredits: 500, packCredits: 0, packCreditsExpiresAt: null });

    // Simulate another request winning the race — our WHERE condition no longer matches
    mockDbChain.returning.mockResolvedValueOnce([]);

    const result = await deductCredits('user_test', 100);

    expect(result).toBe(false);
  });

  it('returns DeductResult when UPDATE affects 1 row (lock acquired)', async () => {
    setupCreditRow({ subscriptionCredits: 500, packCredits: 0, packCreditsExpiresAt: null });

    // Default resetChain sets returning → [{id: 'uc_1'}]
    const result = await deductCredits('user_test', 100);

    expect(result).not.toBe(false);
    expect(result).toHaveProperty('subscriptionDeducted');
    expect(result).toHaveProperty('packDeducted');
  });

  it('calls returning() to detect whether the optimistic lock succeeded', async () => {
    setupCreditRow({ subscriptionCredits: 200, packCredits: 0, packCreditsExpiresAt: null });

    await deductCredits('user_test', 50);

    expect(mockDbChain.returning).toHaveBeenCalled();
  });
});
