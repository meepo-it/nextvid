import { getDb } from '@/db';
import { videoGeneration } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, count as countFn, desc, eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';

const listGenerationsSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  search: z.string(),
  status: z.string().optional(),
  model: z.string().optional(),
});

export const listAllGenerations = createServerFn({ method: 'GET' })
  .inputValidator(listGenerationsSchema)
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    const { pageIndex, pageSize, search, status, model } = data;
    const offset = pageIndex * pageSize;

    const conditions = [];

    if (search.trim()) {
      const escaped = search
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
      const pattern = `%${escaped}%`;
      conditions.push(
        or(
          sql`lower(${user.email}) like lower(${pattern})`,
          sql`lower(${user.name}) like lower(${pattern})`
        )!
      );
    }
    if (status?.trim()) conditions.push(eq(videoGeneration.status, status.trim()));
    if (model?.trim()) conditions.push(eq(videoGeneration.model, model.trim()));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [{ count }]] = await Promise.all([
      db
        .select({
          id: videoGeneration.id,
          userId: videoGeneration.userId,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
          type: videoGeneration.type,
          provider: videoGeneration.provider,
          model: videoGeneration.model,
          providerModel: videoGeneration.providerModel,
          prompt: videoGeneration.prompt,
          negativePrompt: videoGeneration.negativePrompt,
          imageUrl: videoGeneration.imageUrl,
          videoUrl: videoGeneration.videoUrl,
          mediaUrls: videoGeneration.mediaUrls,
          resolution: videoGeneration.resolution,
          duration: videoGeneration.duration,
          aspectRatio: videoGeneration.aspectRatio,
          status: videoGeneration.status,
          outputVideoUrl: videoGeneration.outputVideoUrl,
          outputDuration: videoGeneration.outputDuration,
          creditsUsed: videoGeneration.creditsUsed,
          errorMessage: videoGeneration.errorMessage,
          createdAt: videoGeneration.createdAt,
          updatedAt: videoGeneration.updatedAt,
        })
        .from(videoGeneration)
        .leftJoin(user, eq(videoGeneration.userId, user.id))
        .where(where)
        .orderBy(desc(videoGeneration.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: countFn() })
        .from(videoGeneration)
        .leftJoin(user, eq(videoGeneration.userId, user.id))
        .where(where),
    ]);

    return { items, total: count };
  });

export const listGenerationModels = createServerFn({ method: 'GET' })
  .middleware([adminApiMiddleware])
  .handler(async () => {
    const db = getDb();
    const rows = await db
      .selectDistinct({ model: videoGeneration.model })
      .from(videoGeneration)
      .orderBy(videoGeneration.model);
    return rows.map((r) => r.model);
  });
