import { createServerFn } from '@tanstack/react-start';
import { getDb } from '@/db';
import { featureRequest, featureVote } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { sendEmail } from '@/mail';
import { and, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
};

/** Status order for forward-only notification */
const STATUS_ORDER: Record<string, number> = {
  submitted: 0,
  planned: 1,
  in_progress: 2,
  done: 3,
};

/**
 * Get emails of the creator and all voters for a feature request
 */
async function getStakeholderEmails(featureRequestId: string): Promise<string[]> {
  const db = getDb();

  // Get creator email
  const [creator] = await db
    .select({ email: user.email })
    .from(featureRequest)
    .innerJoin(user, eq(featureRequest.userId, user.id))
    .where(eq(featureRequest.id, featureRequestId))
    .limit(1);

  // Get voter emails
  const voters = await db
    .select({ email: user.email })
    .from(featureVote)
    .innerJoin(user, eq(featureVote.userId, user.id))
    .where(eq(featureVote.featureRequestId, featureRequestId));

  const emails = new Set<string>();
  if (creator?.email) emails.add(creator.email);
  for (const v of voters) {
    if (v.email) emails.add(v.email);
  }
  return [...emails];
}

/**
 * Get creator email only
 */
async function getCreatorEmail(featureRequestId: string): Promise<string | null> {
  const db = getDb();
  const [creator] = await db
    .select({ email: user.email })
    .from(featureRequest)
    .innerJoin(user, eq(featureRequest.userId, user.id))
    .where(eq(featureRequest.id, featureRequestId))
    .limit(1);
  return creator?.email ?? null;
}

/**
 * List feature requests — public, no auth required
 */
export const listFeatureRequests = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z.enum(['all', 'submitted', 'planned', 'in_progress', 'done']).default('all'),
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
      // Remove vote
      await db.delete(featureVote).where(eq(featureVote.id, existing[0].id));
      await db
        .update(featureRequest)
        .set({ voteCount: sql`${featureRequest.voteCount} - 1` })
        .where(eq(featureRequest.id, data.featureRequestId));
      return { voted: false };
    }

    // Add vote
    await db.insert(featureVote).values({
      id: crypto.randomUUID(),
      featureRequestId: data.featureRequestId,
      userId: context.userId,
      createdAt: new Date(),
    });
    await db
      .update(featureRequest)
      .set({ voteCount: sql`${featureRequest.voteCount} + 1` })
      .where(eq(featureRequest.id, data.featureRequestId));
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
    if (current.status === data.status) return { success: true, notified: false, notifiedCount: 0 };

    const isForward = (STATUS_ORDER[data.status] ?? 0) > (STATUS_ORDER[current.status] ?? 0);

    // Update status
    await db
      .update(featureRequest)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(featureRequest.id, data.id));

    // Only send notification emails on forward transitions
    let notifiedCount = 0;
    if (data.notify && isForward) {
      const emails = await getStakeholderEmails(data.id);
      const oldLabel = STATUS_LABELS[current.status] ?? current.status;
      const newLabel = STATUS_LABELS[data.status] ?? data.status;

      await Promise.allSettled(
        emails.map((email) =>
          sendEmail({
            to: email,
            template: 'featureRequestStatusUpdate',
            context: {
              title: current.title,
              oldStatus: oldLabel,
              newStatus: newLabel,
            },
          })
        )
      );
      notifiedCount = emails.length;
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

      const creatorEmail = await getCreatorEmail(data.id);

      if (current && creatorEmail) {
        await sendEmail({
          to: creatorEmail,
          template: 'featureRequestRejected',
          context: {
            title: current.title,
            reason: data.reason,
          },
        });
      }
    }

    await db.delete(featureRequest).where(eq(featureRequest.id, data.id));
    return { success: true };
  });
