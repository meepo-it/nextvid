import { getDb } from '@/db';
import { videoModelConfig, videoProvider } from '@/db/app.schema';
import { VIDEO_MODELS } from '@/config/video-models';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { createServerFn } from '@tanstack/react-start';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

// ── Providers ─────────────────────────────────────────────────────────────────

export const listVideoProviders = createServerFn({ method: 'GET' })
  .middleware([adminApiMiddleware])
  .handler(async () => {
    const db = getDb();
    return db
      .select()
      .from(videoProvider)
      .orderBy(asc(videoProvider.sortOrder));
  });

const upsertProviderSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1).max(64),
  displayName: z.string().min(1).max(128),
  enabled: z.boolean(),
  apiKeyEnvVar: z.string().min(1).max(128),
  baseUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0),
});

export const upsertVideoProvider = createServerFn({ method: 'POST' })
  .inputValidator(upsertProviderSchema)
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date();

    if (data.id) {
      await db
        .update(videoProvider)
        .set({
          key: data.key,
          displayName: data.displayName,
          enabled: data.enabled,
          apiKeyEnvVar: data.apiKeyEnvVar,
          baseUrl: data.baseUrl || null,
          notes: data.notes || null,
          sortOrder: data.sortOrder,
          updatedAt: now,
        })
        .where(eq(videoProvider.id, data.id));
      return { id: data.id };
    }

    const id = crypto.randomUUID();
    await db.insert(videoProvider).values({
      id,
      key: data.key,
      displayName: data.displayName,
      enabled: data.enabled,
      apiKeyEnvVar: data.apiKeyEnvVar,
      baseUrl: data.baseUrl || null,
      notes: data.notes || null,
      sortOrder: data.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  });

export const toggleVideoProvider = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string(), enabled: z.boolean() }))
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .update(videoProvider)
      .set({ enabled: data.enabled, updatedAt: new Date() })
      .where(eq(videoProvider.id, data.id));
    return { ok: true };
  });

export const deleteVideoProvider = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    await db.delete(videoProvider).where(eq(videoProvider.id, data.id));
    return { ok: true };
  });

// ── Models ────────────────────────────────────────────────────────────────────

export const listVideoModels = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ providerId: z.string().optional() }))
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(videoModelConfig)
      .where(
        data.providerId
          ? eq(videoModelConfig.providerId, data.providerId)
          : undefined
      )
      .orderBy(asc(videoModelConfig.sortOrder));

    return rows.map((r) => ({
      ...r,
      supportedTypes: JSON.parse(r.supportedTypes) as string[],
      supportedResolutions: JSON.parse(r.supportedResolutions) as string[],
      supportedAspectRatios: JSON.parse(r.supportedAspectRatios) as string[],
      supportedDurations: JSON.parse(r.supportedDurations) as number[],
    }));
  });

const upsertModelSchema = z.object({
  id: z.string().optional(),
  providerId: z.string(),
  modelKey: z.string().min(1).max(128),
  providerModelName: z.string().min(1).max(128),
  displayNameEn: z.string().min(1).max(128),
  displayNameZh: z.string().min(1).max(128),
  enabled: z.boolean(),
  supportedTypes: z.array(z.string()),
  supportedResolutions: z.array(z.string()),
  supportedAspectRatios: z.array(z.string()),
  supportedDurations: z.array(z.number()),
  defaultResolution: z.string(),
  defaultDuration: z.number().int(),
  defaultAspectRatio: z.string(),
  creditCost480p: z.number().int().min(0),
  creditCost720p: z.number().int().min(0),
  creditCost1080p: z.number().int().min(0),
  sortOrder: z.number().int().min(0),
});

export const upsertVideoModel = createServerFn({ method: 'POST' })
  .inputValidator(upsertModelSchema)
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date();

    const payload = {
      providerId: data.providerId,
      modelKey: data.modelKey,
      providerModelName: data.providerModelName,
      displayNameEn: data.displayNameEn,
      displayNameZh: data.displayNameZh,
      enabled: data.enabled,
      supportedTypes: JSON.stringify(data.supportedTypes),
      supportedResolutions: JSON.stringify(data.supportedResolutions),
      supportedAspectRatios: JSON.stringify(data.supportedAspectRatios),
      supportedDurations: JSON.stringify(data.supportedDurations),
      defaultResolution: data.defaultResolution,
      defaultDuration: data.defaultDuration,
      defaultAspectRatio: data.defaultAspectRatio,
      creditCost480p: data.creditCost480p,
      creditCost720p: data.creditCost720p,
      creditCost1080p: data.creditCost1080p,
      sortOrder: data.sortOrder,
      updatedAt: now,
    };

    if (data.id) {
      await db
        .update(videoModelConfig)
        .set(payload)
        .where(eq(videoModelConfig.id, data.id));
      return { id: data.id };
    }

    const id = crypto.randomUUID();
    await db
      .insert(videoModelConfig)
      .values({ id, ...payload, createdAt: now });
    return { id };
  });

export const toggleVideoModel = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string(), enabled: z.boolean() }))
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .update(videoModelConfig)
      .set({ enabled: data.enabled, updatedAt: new Date() })
      .where(eq(videoModelConfig.id, data.id));
    return { ok: true };
  });

export const updateModelCredits = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      creditCost480p: z.number().int().min(0),
      creditCost720p: z.number().int().min(0),
      creditCost1080p: z.number().int().min(0),
    })
  )
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    await db
      .update(videoModelConfig)
      .set({
        creditCost480p: data.creditCost480p,
        creditCost720p: data.creditCost720p,
        creditCost1080p: data.creditCost1080p,
        updatedAt: new Date(),
      })
      .where(eq(videoModelConfig.id, data.id));
    return { ok: true };
  });

export const deleteVideoModel = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    await db.delete(videoModelConfig).where(eq(videoModelConfig.id, data.id));
    return { ok: true };
  });

// ── Sync models from static config ────────────────────────────────────────────

export const syncModelsFromConfig = createServerFn({ method: 'POST' })
  .middleware([adminApiMiddleware])
  .handler(async () => {
    const db = getDb();
    const now = new Date();

    const [provider] = await db
      .select()
      .from(videoProvider)
      .where(eq(videoProvider.key, 'apimart'))
      .limit(1);

    if (!provider) {
      throw new Error(
        'ApiMart provider not found in DB. Create it first via "Add Provider".'
      );
    }

    const existingModels = await db
      .select()
      .from(videoModelConfig)
      .where(eq(videoModelConfig.providerId, provider.id));

    const existingByModelKey = new Map(
      existingModels.map((m) => [m.modelKey, m])
    );

    let created = 0;
    let updated = 0;

    for (const [index, m] of VIDEO_MODELS.entries()) {
      if (!m.providers.includes('apimart')) continue;
      const providerModelName = m.providerModelNames.apimart;
      if (!providerModelName) continue;

      const payload = {
        modelKey: m.id,
        providerModelName,
        displayNameEn: m.name.en,
        displayNameZh: m.name.zh,
        enabled: m.enabled,
        supportedTypes: JSON.stringify(m.supportedTypes),
        supportedResolutions: JSON.stringify(m.supportedResolutions),
        supportedAspectRatios: JSON.stringify(m.supportedAspectRatios),
        supportedDurations: JSON.stringify(m.supportedDurations),
        defaultResolution: m.defaultResolution,
        defaultDuration: m.defaultDuration,
        defaultAspectRatio: m.defaultAspectRatio,
        sortOrder: index,
        updatedAt: now,
      };

      const existing = existingByModelKey.get(m.id);
      if (existing) {
        await db
          .update(videoModelConfig)
          .set(payload)
          .where(eq(videoModelConfig.id, existing.id));
        updated++;
      } else {
        await db.insert(videoModelConfig).values({
          id: crypto.randomUUID(),
          providerId: provider.id,
          creditCost480p: 0,
          creditCost720p: 0,
          creditCost1080p: 0,
          createdAt: now,
          ...payload,
        });
        created++;
      }
    }

    return { created, updated };
  });

// ── List providers with models (combined view) ────────────────────────────────

export const listProvidersWithModels = createServerFn({ method: 'GET' })
  .middleware([adminApiMiddleware])
  .handler(async () => {
    const db = getDb();

    const providers = await db
      .select()
      .from(videoProvider)
      .orderBy(asc(videoProvider.sortOrder));

    const models = await db
      .select()
      .from(videoModelConfig)
      .orderBy(asc(videoModelConfig.sortOrder));

    const parsedModels = models.map((m) => ({
      ...m,
      supportedTypes: JSON.parse(m.supportedTypes) as string[],
      supportedResolutions: JSON.parse(m.supportedResolutions) as string[],
      supportedAspectRatios: JSON.parse(m.supportedAspectRatios) as string[],
      supportedDurations: JSON.parse(m.supportedDurations) as number[],
    }));

    return providers.map((p) => ({
      ...p,
      models: parsedModels.filter((m) => m.providerId === p.id),
    }));
  });
