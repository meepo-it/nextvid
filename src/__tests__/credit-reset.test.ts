/**
 * Daily credit reset cron tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── DB mock ──────────────────────────────────────────────────────────────────

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
vi.mock('@/db/app.schema', () => ({ payment: {}, userCredit: {} }));
vi.mock('@/db/auth.schema', () => ({ user: {} }));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val, op: 'eq' })),
  and: vi.fn((...args: unknown[]) => ({ args, op: 'and' })),
  or: vi.fn((...args: unknown[]) => ({ args, op: 'or' })),
  lt: vi.fn((col: unknown, val: unknown) => ({ col, val, op: 'lt' })),
}));

// ── Price plan mock ───────────────────────────────────────────────────────────

const HOBBY_ANNUAL_PRICE = 'price_1TUlN9AeGfpufJzSjPfGVxwv';
const PRO_ANNUAL_PRICE   = 'price_1TUlNHAeGfpufJzSkEIj38kK';
const MAX_ANNUAL_PRICE   = 'price_1TUlNRAeGfpufJzSOryK9yUN';

vi.mock('@/lib/price-plan', () => ({
  findPlanByPriceId: vi.fn((priceId: string) => {
    const map: Record<string, object> = {
      [HOBBY_ANNUAL_PRICE]: { id: 'hobby' },
      [PRO_ANNUAL_PRICE]:   { id: 'pro' },
      [MAX_ANNUAL_PRICE]:   { id: 'max' },
    };
    return map[priceId] ?? undefined;
  }),
}));

import { SUBSCRIPTION_CREDITS } from '@/config/plans-config';
import { runDailyCreditReset } from '@/cron/credit-reset';

// ── Helpers ───────────────────────────────────────────────────────────────────

const THIRTY_ONE_DAYS_MS  = 31 * 24 * 60 * 60 * 1000;
const TWENTY_NINE_DAYS_MS = 29 * 24 * 60 * 60 * 1000;

function makeAnnualPayment(userId: string, priceId: string) {
  return { userId, priceId };
}
function makeCreditRow(lastResetMsAgo: number) {
  return { id: 'uc_abc', lastCreditResetAt: new Date(Date.now() - lastResetMsAgo) };
}

/**
 * Build a thenable that behaves as both a resolved Promise AND a fluent chain.
 * Used for queries like `await db.select().from(payment).where(...)` where
 * there is no trailing `.limit()`.
 */
function thenable<T>(value: T) {
  return {
    ...mockDbChain,
    then(resolve: (v: T) => unknown, reject?: (e: unknown) => unknown) {
      return Promise.resolve(value).then(resolve, reject);
    },
  };
}

function resetChain() {
  mockDbChain.select.mockReturnValue(mockDbChain);
  mockDbChain.from.mockReturnValue(mockDbChain);
  // Default: where() returns a thenable that resolves to [].
  // This satisfies two patterns:
  //   • `await db.select().from().where()`        → []  (annual payments / pack expiry queries)
  //   • `db.select().from().where().limit(1)`     → thenable spreads mockDbChain, so .limit() works
  //   • `await db.update().set().where()`         → [] (result ignored)
  mockDbChain.where.mockReturnValue(thenable([]));
  mockDbChain.limit.mockResolvedValue([]);
  mockDbChain.update.mockReturnValue(mockDbChain);
  mockDbChain.set.mockReturnValue(mockDbChain);
  mockDbChain.returning.mockResolvedValue([]);
  mockDbChain.insert.mockReturnValue(mockDbChain);
  mockDbChain.values.mockResolvedValue(undefined);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('runDailyCreditReset — no annual subscribers', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('does nothing when there are no annual subscribers', async () => {
    // Annual payments query (select().from(payment).where()) resolves to []
    mockDbChain.where.mockReturnValueOnce(thenable([]));

    await runDailyCreditReset();

    expect(mockDbChain.update).not.toHaveBeenCalled();
    expect(mockDbChain.insert).not.toHaveBeenCalled();
  });
});

describe('runDailyCreditReset — reset due (>30 days)', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('resets Hobby annual credits to 800 when 31 days have passed', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_hobby', HOBBY_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]);

    await runDailyCreditReset();

    expect(mockDbChain.update).toHaveBeenCalled();
    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: SUBSCRIPTION_CREDITS.hobby })
    );
  });

  it('resets Pro annual credits to 3200 when 31 days have passed', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_pro', PRO_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]);

    await runDailyCreditReset();

    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: SUBSCRIPTION_CREDITS.pro })
    );
  });

  it('resets Max annual credits to 7000 when 31 days have passed', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_max', MAX_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]);

    await runDailyCreditReset();

    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: SUBSCRIPTION_CREDITS.max })
    );
  });

  it('writes a fresh lastCreditResetAt timestamp on reset', async () => {
    const before = Date.now();
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_hobby', HOBBY_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]);

    await runDailyCreditReset();

    const setArg = mockDbChain.set.mock.calls[0][0];
    expect(setArg.lastCreditResetAt).toBeInstanceOf(Date);
    expect(setArg.lastCreditResetAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('creates a new credit row when the user has no existing row', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_new', HOBBY_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([]); // no credit row

    await runDailyCreditReset();

    expect(mockDbChain.insert).toHaveBeenCalled();
    expect(mockDbChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ subscriptionCredits: SUBSCRIPTION_CREDITS.hobby, packCredits: 0 })
    );
  });
});

describe('runDailyCreditReset — reset NOT due (<30 days)', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('skips reset when only 29 days have passed', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_hobby', HOBBY_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(TWENTY_NINE_DAYS_MS)]);

    await runDailyCreditReset();

    expect(mockDbChain.update).not.toHaveBeenCalled();
  });

  it('skips reset when lastCreditResetAt was just 1 second ago', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_hobby', HOBBY_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(1000)]);

    await runDailyCreditReset();

    expect(mockDbChain.update).not.toHaveBeenCalled();
  });
});

describe('runDailyCreditReset — multiple annual subscribers', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('resets only users whose 30-day window has elapsed', async () => {
    // user_a (due), user_b (not due), user_c (due)
    mockDbChain.where.mockReturnValueOnce(thenable([
      makeAnnualPayment('user_a', HOBBY_ANNUAL_PRICE),
      makeAnnualPayment('user_b', PRO_ANNUAL_PRICE),
      makeAnnualPayment('user_c', MAX_ANNUAL_PRICE),
    ]));
    mockDbChain.limit
      .mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)])  // user_a: due
      .mockResolvedValueOnce([makeCreditRow(TWENTY_NINE_DAYS_MS)]) // user_b: not due
      .mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]); // user_c: due

    await runDailyCreditReset();

    expect(mockDbChain.update).toHaveBeenCalledTimes(2);
  });

  it('handles a mix of due, no-row, and not-due users', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([
      makeAnnualPayment('user_due',   HOBBY_ANNUAL_PRICE),
      makeAnnualPayment('user_new',   PRO_ANNUAL_PRICE),
      makeAnnualPayment('user_fresh', MAX_ANNUAL_PRICE),
    ]));
    mockDbChain.limit
      .mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]) // due → update
      .mockResolvedValueOnce([])                                   // no row → insert
      .mockResolvedValueOnce([makeCreditRow(1000)]);               // fresh → skip

    await runDailyCreditReset();

    expect(mockDbChain.update).toHaveBeenCalledTimes(1); // user_due
    expect(mockDbChain.insert).toHaveBeenCalledTimes(1); // user_new
  });
});

describe('SUBSCRIPTION_CREDITS contract', () => {
  it('hobby = 800',  () => expect(SUBSCRIPTION_CREDITS.hobby).toBe(800));
  it('pro = 3200',   () => expect(SUBSCRIPTION_CREDITS.pro).toBe(3200));
  it('max = 7000',   () => expect(SUBSCRIPTION_CREDITS.max).toBe(7000));
});

// ── expirePackCredits ─────────────────────────────────────────────────────────
// Both jobs run in parallel inside runDailyCreditReset. In each suite below:
//   • 1st where() call  → annual payments query  (thenable)
//   • 2nd where() call  → pack expiry query       (thenable)
//   • subsequent where() calls → update WHERE clauses (use default mockReturnValue)

describe('expirePackCredits — clears expired packs', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('clears packCredits and packCreditsExpiresAt for a user whose pack has expired', async () => {
    // No annual subscribers → only pack expiry job does work
    mockDbChain.where.mockReturnValueOnce(thenable([]));
    mockDbChain.where.mockReturnValueOnce(thenable([
      { userId: 'user_expired', packCredits: 500 },
    ]));

    await runDailyCreditReset();

    expect(mockDbChain.update).toHaveBeenCalledTimes(1);
    expect(mockDbChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ packCredits: 0, packCreditsExpiresAt: null })
    );
  });

  it('skips users whose packCredits is already 0 (even if expiresAt is in the past)', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([]));
    // DB returns a row with packCredits = 0 (filtered out in JS)
    mockDbChain.where.mockReturnValueOnce(thenable([
      { userId: 'user_zero', packCredits: 0 },
    ]));

    await runDailyCreditReset();

    expect(mockDbChain.update).not.toHaveBeenCalled();
  });

  it('processes multiple expired users, skips zero-credit rows', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([]));
    mockDbChain.where.mockReturnValueOnce(thenable([
      { userId: 'user_a', packCredits: 500 },   // should clear
      { userId: 'user_b', packCredits: 0 },     // skip
      { userId: 'user_c', packCredits: 2200 },  // should clear
    ]));

    await runDailyCreditReset();

    expect(mockDbChain.update).toHaveBeenCalledTimes(2);
  });

  it('writes updatedAt timestamp when clearing expired pack', async () => {
    const before = Date.now();
    mockDbChain.where.mockReturnValueOnce(thenable([]));
    mockDbChain.where.mockReturnValueOnce(thenable([
      { userId: 'user_expired2', packCredits: 100 },
    ]));

    await runDailyCreditReset();

    const setArg = mockDbChain.set.mock.calls[0][0];
    expect(setArg.updatedAt).toBeInstanceOf(Date);
    expect(setArg.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe('expirePackCredits — subscriptionCredits isolation', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('never includes subscriptionCredits in the set() call during pack expiry', async () => {
    mockDbChain.where.mockReturnValueOnce(thenable([]));
    mockDbChain.where.mockReturnValueOnce(thenable([
      { userId: 'user_check', packCredits: 300 },
    ]));

    await runDailyCreditReset();

    const setArg = mockDbChain.set.mock.calls[0][0];
    expect(setArg).not.toHaveProperty('subscriptionCredits');
    expect(setArg).not.toHaveProperty('lastCreditResetAt');
  });
});

describe('runDailyCreditReset — both jobs run concurrently', () => {
  beforeEach(() => { vi.clearAllMocks(); resetChain(); });

  it('runs annual reset and pack expiry in the same call', async () => {
    // Annual: 1 subscriber due for reset
    mockDbChain.where.mockReturnValueOnce(thenable([makeAnnualPayment('user_annual', HOBBY_ANNUAL_PRICE)]));
    mockDbChain.limit.mockResolvedValueOnce([makeCreditRow(THIRTY_ONE_DAYS_MS)]);

    // Pack expiry: 1 user with expired pack
    mockDbChain.where.mockReturnValueOnce(thenable([
      { userId: 'user_pack', packCredits: 1000 },
    ]));

    await runDailyCreditReset();

    // update called twice: once for annual reset, once for pack expiry
    expect(mockDbChain.update).toHaveBeenCalledTimes(2);
  });
});
