import { getDb } from '@/db';
import { payment, userCredit, videoGeneration } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count, desc, eq, gte, lt, sql, sum } from 'drizzle-orm';

export const getAdminOverview = createServerFn({ method: 'GET' })
  .middleware([adminApiMiddleware])
  .handler(async () => {
    const db = getDb();
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const dayMs = 24 * 60 * 60 * 1000;
    const thisWeekStart = new Date(now - weekMs);
    const lastWeekStart = new Date(now - 2 * weekMs);
    const thirtyDaysAgo = new Date(now - 30 * dayMs);

    const dateExpr = sql<string>`strftime('%Y-%m-%d', datetime(${videoGeneration.createdAt} / 1000, 'unixepoch'))`;

    const [
      [{ totalUsers }],
      [{ newThisWeek }],
      [{ newLastWeek }],
      [{ activeSubscriptions }],
      [{ totalVideos }],
      [{ videosThisWeek }],
      [{ videosLastWeek }],
      [{ totalCreditsConsumed }],
      [{ creditsThisWeek }],
      [{ completedVideos }],
      [{ failedVideos }],
      [{ totalCreditsBalance }],
      topModels,
      videosByDay,
      recentUsers,
      recentPayments,
      recentFailedJobs,
    ] = await Promise.all([
      db.select({ totalUsers: count() }).from(user),

      db
        .select({ newThisWeek: count() })
        .from(user)
        .where(gte(user.createdAt, thisWeekStart)),

      db
        .select({ newLastWeek: count() })
        .from(user)
        .where(
          and(
            gte(user.createdAt, lastWeekStart),
            lt(user.createdAt, thisWeekStart)
          )
        ),

      db
        .select({ activeSubscriptions: count() })
        .from(payment)
        .where(
          and(eq(payment.type, 'subscription'), eq(payment.status, 'active'))
        ),

      db.select({ totalVideos: count() }).from(videoGeneration),

      db
        .select({ videosThisWeek: count() })
        .from(videoGeneration)
        .where(gte(videoGeneration.createdAt, thisWeekStart)),

      db
        .select({ videosLastWeek: count() })
        .from(videoGeneration)
        .where(
          and(
            gte(videoGeneration.createdAt, lastWeekStart),
            lt(videoGeneration.createdAt, thisWeekStart)
          )
        ),

      db
        .select({ totalCreditsConsumed: sum(videoGeneration.creditsUsed) })
        .from(videoGeneration),

      db
        .select({ creditsThisWeek: sum(videoGeneration.creditsUsed) })
        .from(videoGeneration)
        .where(gte(videoGeneration.createdAt, thisWeekStart)),

      db
        .select({ completedVideos: count() })
        .from(videoGeneration)
        .where(eq(videoGeneration.status, 'completed')),

      db
        .select({ failedVideos: count() })
        .from(videoGeneration)
        .where(eq(videoGeneration.status, 'failed')),

      db
        .select({
          totalCreditsBalance: sql<number>`coalesce(sum(${userCredit.subscriptionCredits}), 0) + coalesce(sum(${userCredit.packCredits}), 0)`,
        })
        .from(userCredit),

      db
        .select({ model: videoGeneration.model, count: count() })
        .from(videoGeneration)
        .groupBy(videoGeneration.model)
        .orderBy(desc(count()))
        .limit(6),

      db
        .select({ date: dateExpr, count: count() })
        .from(videoGeneration)
        .where(gte(videoGeneration.createdAt, thirtyDaysAgo))
        .groupBy(dateExpr)
        .orderBy(dateExpr),

      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(6),

      db
        .select({
          id: payment.id,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
          type: payment.type,
          interval: payment.interval,
          status: payment.status,
          createdAt: payment.createdAt,
        })
        .from(payment)
        .innerJoin(user, eq(payment.userId, user.id))
        .where(eq(payment.paid, true))
        .orderBy(desc(payment.createdAt))
        .limit(6),

      db
        .select({
          id: videoGeneration.id,
          userName: user.name,
          model: videoGeneration.model,
          errorMessage: videoGeneration.errorMessage,
          createdAt: videoGeneration.createdAt,
        })
        .from(videoGeneration)
        .innerJoin(user, eq(videoGeneration.userId, user.id))
        .where(eq(videoGeneration.status, 'failed'))
        .orderBy(desc(videoGeneration.createdAt))
        .limit(5),
    ]);

    const total = Number(totalVideos);
    const completed = Number(completedVideos);
    const failed = Number(failedVideos);
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      kpi: {
        totalUsers: Number(totalUsers),
        newThisWeek: Number(newThisWeek),
        newLastWeek: Number(newLastWeek),
        activeSubscriptions: Number(activeSubscriptions),
        totalVideos: total,
        videosThisWeek: Number(videosThisWeek),
        videosLastWeek: Number(videosLastWeek),
        totalCreditsConsumed: Number(totalCreditsConsumed ?? 0),
        creditsThisWeek: Number(creditsThisWeek ?? 0),
        completedVideos: completed,
        failedVideos: failed,
        successRate,
        totalCreditsBalance: Number(totalCreditsBalance ?? 0),
      },
      topModels: topModels.map((r) => ({
        model: r.model,
        count: Number(r.count),
      })),
      videosByDay: videosByDay.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
      recentUsers,
      recentPayments,
      recentFailedJobs,
    };
  });
