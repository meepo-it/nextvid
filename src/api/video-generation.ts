import { getDb } from '@/db';
import {
  userCredit,
  videoGeneration,
  videoModelConfig,
  videoProvider,
} from '@/db/app.schema';
import { computeCreditCost } from '@/lib/credit-utils';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { getTaskStatus } from '@/video/provider/apimart';
import { getAdapter } from '@/video/adapters/registry';
import { serverEnv } from '@/env/server';
import { createServerFn } from '@tanstack/react-start';
import { and, asc, count, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { env } from 'cloudflare:workers';

// ── Schemas ───────────────────────────────────────────────────────────────────

const submitSchema = z.object({
  type: z.enum([
    'text-to-video',
    'image-to-video',
    'reference-to-video',
    'video-edit',
  ]),
  modelId: z.string(),
  prompt: z.string().max(5000).optional(),
  negativePrompt: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).max(9).optional(),
  resolution: z.enum(['480p', '540p', '720p', '768p', '1080p', '4k']),
  duration: z.number().int().min(0).max(16),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3', '3:4']),
  withAudio: z.boolean().optional(),
  /** Veo 3 Remix: providerTaskId of the completed source video to extend */
  sourceTaskId: z.string().optional(),
});

const listSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(50),
});

const statusSchema = z.object({ id: z.string() });

const getModelsSchema = z.object({
  type: z
    .enum([
      'text-to-video',
      'image-to-video',
      'reference-to-video',
      'video-edit',
    ])
    .optional(),
});

// ── Credit helpers ────────────────────────────────────────────────────────────

async function getOrCreateUserCredit(userId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  if (row) return row;

  const now = new Date();
  await db.insert(userCredit).values({
    id: crypto.randomUUID(),
    userId,
    subscriptionCredits: 0,
    packCredits: 0,
    createdAt: now,
    updatedAt: now,
  });
  const [newRow] = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
  return newRow!;
}

export type DeductResult = { subscriptionDeducted: number; packDeducted: number };

/**
 * Deduct credits using subscription credits first, then pack credits.
 * Pack credits that have expired are treated as 0.
 * Returns the split deducted, or false if balance is insufficient.
 * Uses optimistic locking to guard against concurrent deductions.
 */
export async function deductCredits(
  userId: string,
  amount: number
): Promise<DeductResult | false> {
  const db = getDb();
  const row = await getOrCreateUserCredit(userId);
  const now = new Date();

  const packExpired =
    !row.packCreditsExpiresAt || row.packCreditsExpiresAt < now;
  const availablePack = packExpired ? 0 : row.packCredits;
  const total = row.subscriptionCredits + availablePack;

  if (total < amount) return false;

  // Use subscription credits first (they reset monthly, pack lasts 90 days)
  const subDeduct = Math.min(amount, row.subscriptionCredits);
  const packDeduct = amount - subDeduct;

  const updated = await db
    .update(userCredit)
    .set({
      subscriptionCredits: row.subscriptionCredits - subDeduct,
      packCredits: row.packCredits - packDeduct,
      updatedAt: now,
    })
    .where(
      and(
        eq(userCredit.userId, userId),
        eq(userCredit.subscriptionCredits, row.subscriptionCredits),
        eq(userCredit.packCredits, row.packCredits)
      )
    )
    .returning({ id: userCredit.id });

  if (updated.length === 0) return false;
  return { subscriptionDeducted: subDeduct, packDeducted: packDeduct };
}

function getCreditCost(
  model: typeof videoModelConfig.$inferSelect,
  resolution: string,
  duration: number
): number {
  return computeCreditCost(
    {
      creditCost480p: model.creditCost480p,
      creditCost720p: model.creditCost720p,
      creditCost1080p: model.creditCost1080p,
    },
    resolution,
    duration
  );
}

/**
 * Resolve an image URL so that external providers can download it.
 *
 * When the URL points to our same-origin storage proxy (e.g. during local dev
 * where the URL is http://localhost:xxxx/api/storage/file?key=…), we extract
 * the R2 key, fetch the object directly from the bucket, and return a base64
 * data URI.  This avoids sending a localhost URL to remote AI services.
 *
 * In production the URL already uses the real domain and is publicly reachable,
 * so it is returned unchanged.
 */
async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl.includes('/api/storage/file?key=')) return imageUrl;

  try {
    const parsed = new URL(imageUrl);
    const key = parsed.searchParams.get('key');
    if (!key) return imageUrl;

    const bucket = (env as unknown as Record<string, unknown>).BUCKET as
      | R2Bucket
      | undefined;
    if (!bucket) return imageUrl;

    const object = await bucket.get(key);
    if (!object) return imageUrl;

    const arrayBuffer = await object.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const contentType = object.httpMetadata?.contentType ?? 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch {
    return imageUrl;
  }
}

// ── Server Functions ──────────────────────────────────────────────────────────

/** Get current user's credit balance */
export const getUserCredit = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context;
    const row = await getOrCreateUserCredit(userId);
    const now = new Date();
    const packExpired =
      !row.packCreditsExpiresAt || row.packCreditsExpiresAt < now;
    const activePack = packExpired ? 0 : row.packCredits;
    return {
      credits: row.subscriptionCredits + activePack,
      subscriptionCredits: row.subscriptionCredits,
      packCredits: activePack,
      packCreditsExpiresAt: packExpired ? null : row.packCreditsExpiresAt,
    };
  });

/** List enabled models from DB (optionally filtered by type) */
export const getEnabledModels = createServerFn({ method: 'GET' })
  .inputValidator(getModelsSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();

    const rows = await db
      .select({
        id: videoModelConfig.id,
        modelKey: videoModelConfig.modelKey,
        providerKey: videoProvider.key,
        displayNameEn: videoModelConfig.displayNameEn,
        displayNameZh: videoModelConfig.displayNameZh,
        supportedTypes: videoModelConfig.supportedTypes,
        supportedResolutions: videoModelConfig.supportedResolutions,
        supportedAspectRatios: videoModelConfig.supportedAspectRatios,
        supportedDurations: videoModelConfig.supportedDurations,
        defaultResolution: videoModelConfig.defaultResolution,
        defaultDuration: videoModelConfig.defaultDuration,
        defaultAspectRatio: videoModelConfig.defaultAspectRatio,
        creditCost480p: videoModelConfig.creditCost480p,
        creditCost720p: videoModelConfig.creditCost720p,
        creditCost1080p: videoModelConfig.creditCost1080p,
      })
      .from(videoModelConfig)
      .innerJoin(
        videoProvider,
        eq(videoModelConfig.providerId, videoProvider.id)
      )
      .where(
        and(eq(videoModelConfig.enabled, true), eq(videoProvider.enabled, true))
      )
      .orderBy(asc(videoModelConfig.sortOrder));

    const parsed = rows.map((r) => ({
      ...r,
      supportedTypes: JSON.parse(r.supportedTypes) as string[],
      supportedResolutions: JSON.parse(r.supportedResolutions) as string[],
      supportedAspectRatios: JSON.parse(r.supportedAspectRatios) as string[],
      supportedDurations: JSON.parse(r.supportedDurations) as number[],
    }));

    if (data?.type) {
      return parsed.filter((m) => m.supportedTypes.includes(data.type!));
    }
    return parsed;
  });

/** Submit a video generation job */
export const submitVideoGeneration = createServerFn({ method: 'POST' })
  .inputValidator(submitSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    // Load model + provider from DB
    const [modelRow] = await db
      .select()
      .from(videoModelConfig)
      .innerJoin(
        videoProvider,
        eq(videoModelConfig.providerId, videoProvider.id)
      )
      .where(
        and(
          eq(videoModelConfig.modelKey, data.modelId),
          eq(videoModelConfig.enabled, true),
          eq(videoProvider.enabled, true)
        )
      )
      .limit(1);

    if (!modelRow) throw new Error(`Model "${data.modelId}" is not available`);

    const model = modelRow.video_model_config;
    const provider = modelRow.video_provider;

    // ── Logic-level parameter validation ─────────────────────────────────────
    // The UI hides unsupported options via model.supportedResolutions etc., but
    // we also block here so direct API callers cannot bypass the constraints.
    const supportedResolutions = JSON.parse(
      model.supportedResolutions
    ) as string[];
    const supportedDurations = JSON.parse(model.supportedDurations) as number[];
    const supportedAspectRatios = JSON.parse(
      model.supportedAspectRatios
    ) as string[];
    const supportedTypes = JSON.parse(model.supportedTypes) as string[];

    if (!supportedResolutions.includes(data.resolution)) {
      throw new Error(
        `Resolution "${data.resolution}" is not supported by model "${data.modelId}"`
      );
    }
    if (!supportedDurations.includes(data.duration)) {
      throw new Error(
        `Duration "${data.duration}s" is not supported by model "${data.modelId}"`
      );
    }
    if (!supportedAspectRatios.includes(data.aspectRatio)) {
      throw new Error(
        `Aspect ratio "${data.aspectRatio}" is not supported by model "${data.modelId}"`
      );
    }
    if (!supportedTypes.includes(data.type)) {
      throw new Error(
        `Generation type "${data.type}" is not supported by model "${data.modelId}"`
      );
    }

    // Get API key from env
    const apiKey = (serverEnv as Record<string, string | undefined>)[
      provider.apiKeyEnvVar
    ];
    if (!apiKey)
      throw new Error(`API key env var "${provider.apiKeyEnvVar}" is not set`);

    const creditsRequired = getCreditCost(
      model,
      data.resolution,
      data.duration
    );
    if (creditsRequired === 0) {
      throw new Error(
        `Model "${data.modelId}" has no credit cost configured for resolution "${data.resolution}" — contact support`
      );
    }
    const deductResult = await deductCredits(userId, creditsRequired);
    if (!deductResult) throw new Error('insufficient_credits');

    // Resolve same-origin proxy URLs to base64 data URIs so external providers
    // (ApiMart, etc.) can download the image even in local dev environments.
    const resolvedImageUrl = data.imageUrl
      ? await resolveImageUrl(data.imageUrl)
      : undefined;
    const resolvedVideoUrl = data.videoUrl
      ? await resolveImageUrl(data.videoUrl)
      : undefined;
    const resolvedMediaUrls = data.mediaUrls
      ? await Promise.all(data.mediaUrls.map(resolveImageUrl))
      : undefined;

    // Build provider-specific request via adapter
    const adapter = getAdapter(provider.key);
    const providerRequest = adapter(model.providerModelName, {
      prompt: data.prompt,
      negativePrompt: data.negativePrompt,
      imageUrl: resolvedImageUrl,
      videoUrl: resolvedVideoUrl,
      mediaUrls: resolvedMediaUrls,
      resolution: data.resolution,
      duration: data.duration,
      aspectRatio: data.aspectRatio,
      withAudio: data.withAudio,
      sourceTaskId: data.sourceTaskId,
    });

    let taskId: string;
    try {
      const { submitVideoJob, submitVideoRemix } = await import(
        '@/video/provider/apimart'
      );

      // Veo 3 Remix uses a different endpoint. We detect it by the "-remix" suffix
      // in providerModelName (e.g. "veo3.1-fast-remix") and require sourceTaskId.
      if (model.providerModelName.endsWith('-remix')) {
        if (!data.sourceTaskId) {
          throw new Error(
            `Model "${data.modelId}" requires sourceTaskId (the providerTaskId of the source video)`
          );
        }
        taskId = await submitVideoRemix(
          apiKey,
          data.sourceTaskId,
          providerRequest as Parameters<typeof submitVideoRemix>[2]
        );
      } else {
        taskId = await submitVideoJob(
          apiKey,
          providerRequest as Parameters<typeof submitVideoJob>[1]
        );
      }
    } catch (err) {
      // Atomic refund: restore each bucket exactly what was deducted
      await db
        .update(userCredit)
        .set({
          subscriptionCredits: sql`${userCredit.subscriptionCredits} + ${deductResult.subscriptionDeducted}`,
          packCredits: sql`${userCredit.packCredits} + ${deductResult.packDeducted}`,
          updatedAt: new Date(),
        })
        .where(eq(userCredit.userId, userId));
      throw err;
    }

    const videoId = crypto.randomUUID();
    const now = new Date();

    await db.insert(videoGeneration).values({
      id: videoId,
      userId,
      type: data.type,
      provider: provider.key,
      model: model.modelKey,
      providerModel: model.providerModelName,
      prompt: data.prompt ?? null,
      negativePrompt: data.negativePrompt ?? null,
      imageUrl: data.imageUrl ?? null,
      videoUrl: data.videoUrl ?? null,
      mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
      resolution: data.resolution,
      duration: data.duration,
      aspectRatio: data.aspectRatio,
      status: 'submitted',
      providerTaskId: taskId,
      creditsUsed: creditsRequired,
      createdAt: now,
      updatedAt: now,
    });

    return { videoId, taskId, creditsUsed: creditsRequired };
  });

/** Poll video generation status */
export const pollVideoStatus = createServerFn({ method: 'GET' })
  .inputValidator(statusSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();

    const [record] = await db
      .select()
      .from(videoGeneration)
      .where(
        and(eq(videoGeneration.id, data.id), eq(videoGeneration.userId, userId))
      )
      .limit(1);

    if (!record) throw new Error('Video not found');
    if (record.status === 'completed' || record.status === 'failed')
      return record;

    const apiKey = serverEnv.APIMART_API_KEY;
    if (!apiKey || !record.providerTaskId) return record;

    try {
      const result = await getTaskStatus(apiKey, record.providerTaskId);

      if (result.status === 'completed' || result.status === 'failed') {
        await db
          .update(videoGeneration)
          .set({
            status: result.status,
            outputVideoUrl: result.video_url ?? null,
            outputDuration: result.duration ?? null,
            providerPrompt: result.prompt ?? null,
            errorMessage: result.error ?? null,
            updatedAt: new Date(),
          })
          .where(eq(videoGeneration.id, data.id));
        return {
          ...record,
          status: result.status,
          outputVideoUrl: result.video_url ?? null,
        };
      }

      if (result.status === 'running' && record.status !== 'running') {
        await db
          .update(videoGeneration)
          .set({ status: 'running', updatedAt: new Date() })
          .where(eq(videoGeneration.id, data.id));
        return { ...record, status: 'running' };
      }
    } catch {
      // Swallow polling errors
    }

    return record;
  });

/** Get a single generation by id — only the owner can access it */
export const getGenerationById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [record] = await db
      .select()
      .from(videoGeneration)
      .where(
        and(eq(videoGeneration.id, data.id), eq(videoGeneration.userId, userId))
      )
      .limit(1);
    if (!record) throw new Error('Not found');
    return record;
  });

/** List user's video generations (paginated) */
export const listVideoGenerations = createServerFn({ method: 'GET' })
  .inputValidator(listSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const where = eq(videoGeneration.userId, userId);

    const [totalRow] = await db
      .select({ count: count() })
      .from(videoGeneration)
      .where(where);
    const total = totalRow?.count ?? 0;

    const items = await db
      .select()
      .from(videoGeneration)
      .where(where)
      .orderBy(desc(videoGeneration.createdAt))
      .limit(data.pageSize)
      .offset(data.pageIndex * data.pageSize);

    return { items, total };
  });
