import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';
import { featureRequest, featureVote } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { sendEmail } from '@/mail';
import { getLocale } from '@/paraglide/runtime.js';
import * as m from '@/paraglide/messages.js';
import { withLocale } from '@/lib/i18n';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Resolve a status code to its localized label using the active runtime
 * locale. Wrap calls in `withLocale(...)` to render under a specific
 * recipient's language (used by background email jobs).
 */
function statusLabel(status: string): string {
  switch (status) {
    case 'submitted':
      return m.feature_requests_status_submitted();
    case 'planned':
      return m.feature_requests_status_planned();
    case 'in_progress':
      return m.feature_requests_status_in_progress();
    case 'done':
      return m.feature_requests_status_done();
    default:
      return status;
  }
}

/** Status order for forward-only notification */
const STATUS_ORDER: Record<string, number> = {
  submitted: 0,
  planned: 1,
  in_progress: 2,
  done: 3,
};

type Recipient = { email: string; locale: string | null };

/**
 * Get emails (with the recipient's preferred locale) of the creator and all
 * voters for a feature request. The locale lets background email jobs render
 * each message in the *recipient's* language rather than the admin's.
 */
async function getStakeholderRecipients(
  featureRequestId: string
): Promise<Recipient[]> {
  const db = getDb();

  // Get creator email + locale
  const [creator] = await db
    .select({ email: user.email, locale: user.locale })
    .from(featureRequest)
    .innerJoin(user, eq(featureRequest.userId, user.id))
    .where(eq(featureRequest.id, featureRequestId))
    .limit(1);

  // Get voter emails + locales
  const voters = await db
    .select({ email: user.email, locale: user.locale })
    .from(featureVote)
    .innerJoin(user, eq(featureVote.userId, user.id))
    .where(eq(featureVote.featureRequestId, featureRequestId));

  const seen = new Set<string>();
  const out: Recipient[] = [];
  const push = (r: { email: string | null; locale: string | null }) => {
    if (!r.email || seen.has(r.email)) return;
    seen.add(r.email);
    out.push({ email: r.email, locale: r.locale });
  };
  if (creator) push(creator);
  for (const v of voters) push(v);
  return out;
}

/**
 * Get the creator (email + locale) only.
 */
async function getCreatorRecipient(
  featureRequestId: string
): Promise<Recipient | null> {
  const db = getDb();
  const [creator] = await db
    .select({ email: user.email, locale: user.locale })
    .from(featureRequest)
    .innerJoin(user, eq(featureRequest.userId, user.id))
    .where(eq(featureRequest.id, featureRequestId))
    .limit(1);
  if (!creator?.email) return null;
  return { email: creator.email, locale: creator.locale };
}

/**
 * List feature requests — public, no auth required
 */
export const listFeatureRequests = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z
        .enum(['all', 'submitted', 'planned', 'in_progress', 'done'])
        .default('all'),
      sort: z.enum(['votes', 'newest']).default('votes'),
      userId: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const db = getDb();
    const conditions = [];

    if (data.status !== 'all') {
      conditions.push(eq(featureRequest.status, data.status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy =
      data.sort === 'votes'
        ? desc(featureRequest.voteCount)
        : desc(featureRequest.createdAt);

    const items = await db
      .select({
        id: featureRequest.id,
        title: featureRequest.title,
        description: featureRequest.description,
        status: featureRequest.status,
        category: featureRequest.category,
        voteCount: featureRequest.voteCount,
        createdAt: featureRequest.createdAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(featureRequest)
      .leftJoin(user, eq(featureRequest.userId, user.id))
      .where(where)
      .orderBy(orderBy);

    // If userId provided, fetch their votes to show which items they voted for
    let votedIds: string[] = [];
    if (data.userId) {
      const votes = await db
        .select({ featureRequestId: featureVote.featureRequestId })
        .from(featureVote)
        .where(eq(featureVote.userId, data.userId));
      votedIds = votes.map((v) => v.featureRequestId);
    }

    return { items, votedIds };
  });

/**
 * Create a feature request — requires auth
 */
export const createFeatureRequest = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(1000),
      category: z.string().max(50).optional(),
    })
  )
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(featureRequest).values({
      id,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category?.trim() || null,
      userId: context.userId,
      // Capture the language the request was written in so admins can group
      // by locale and so reply emails go out in the same language.
      locale: getLocale(),
      status: 'submitted',
      voteCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { id };
  });

/**
 * Toggle vote on a feature request — requires auth
 */
export const voteFeatureRequest = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ featureRequestId: z.string() }))
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb();
    const existing = await db
      .select({ id: featureVote.id })
      .from(featureVote)
      .where(
        and(
          eq(featureVote.featureRequestId, data.featureRequestId),
          eq(featureVote.userId, context.userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db.batch([
        db.delete(featureVote).where(eq(featureVote.id, existing[0].id)),
        db
          .update(featureRequest)
          .set({ voteCount: sql`${featureRequest.voteCount} - 1` })
          .where(eq(featureRequest.id, data.featureRequestId)),
      ]);
      return { voted: false };
    }

    await db.batch([
      db.insert(featureVote).values({
        id: crypto.randomUUID(),
        featureRequestId: data.featureRequestId,
        userId: context.userId,
        createdAt: new Date(),
      }),
      db
        .update(featureRequest)
        .set({ voteCount: sql`${featureRequest.voteCount} + 1` })
        .where(eq(featureRequest.id, data.featureRequestId)),
    ]);
    return { voted: true };
  });

/**
 * Update feature request status — admin only
 * Notifies creator + all voters via email
 */
export const updateFeatureRequestStatus = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(['submitted', 'planned', 'in_progress', 'done']),
      notify: z.boolean().default(true),
    })
  )
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();

    // Get current status before update
    const [current] = await db
      .select({ title: featureRequest.title, status: featureRequest.status })
      .from(featureRequest)
      .where(eq(featureRequest.id, data.id))
      .limit(1);

    if (!current) throw new Error('Feature request not found');
    if (current.status === data.status)
      return { success: true, notified: false, notifiedCount: 0 };

    const isForward =
      (STATUS_ORDER[data.status] ?? 0) > (STATUS_ORDER[current.status] ?? 0);

    // Update status
    await db
      .update(featureRequest)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(featureRequest.id, data.id));

    // Only send notification emails on forward transitions
    let notifiedCount = 0;
    if (data.notify && isForward) {
      const recipients = await getStakeholderRecipients(data.id);

      // Render each email under the *recipient's* preferred locale rather
      // than the admin's request locale, so subjects/labels/copy are in the
      // language the recipient signed up with. STATUS_LABELS is resolved
      // inside the closure so it picks up the swapped locale too.
      await Promise.allSettled(
        recipients.map((r) =>
          withLocale(r.locale ?? getLocale(), async () => {
            const oldLabel = statusLabel(current.status);
            const newLabel = statusLabel(data.status);
            return sendEmail({
              to: r.email,
              template: 'featureRequestStatusUpdate',
              context: {
                title: current.title,
                oldStatus: oldLabel,
                newStatus: newLabel,
              },
            });
          })
        )
      );
      notifiedCount = recipients.length;
    }

    return { success: true, notified: isForward, notifiedCount };
  });

/**
 * Delete (reject) feature request — admin only
 * Optionally sends rejection reason to creator
 */
export const deleteFeatureRequest = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      reason: z.string().max(500).optional(),
      notifyCreator: z.boolean().default(false),
    })
  )
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();

    // If notifying, get info before deletion
    if (data.notifyCreator && data.reason) {
      const [current] = await db
        .select({ title: featureRequest.title })
        .from(featureRequest)
        .where(eq(featureRequest.id, data.id))
        .limit(1);

      const creator = await getCreatorRecipient(data.id);

      if (current && creator) {
        // Render under the creator's preferred locale, not the admin's.
        await withLocale(creator.locale ?? getLocale(), () =>
          sendEmail({
            to: creator.email,
            template: 'featureRequestRejected',
            context: {
              title: current.title,
              reason: data.reason,
            },
          })
        );
      }
    }

    await db.delete(featureRequest).where(eq(featureRequest.id, data.id));
    return { success: true };
  });
