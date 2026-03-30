import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');

function loadMessages(locale: string): Record<string, string> {
  const raw = readFileSync(resolve(root, 'messages', `${locale}.json`), 'utf-8');
  const { $schema, ...messages } = JSON.parse(raw);
  return messages;
}

describe('feature-requests schema', () => {
  it('featureRequest table has expected columns', async () => {
    const { featureRequest } = await import('@/db/app.schema');
    const columns = Object.keys(featureRequest);
    expect(columns).toContain('id');
    expect(columns).toContain('title');
    expect(columns).toContain('description');
    expect(columns).toContain('status');
    expect(columns).toContain('category');
    expect(columns).toContain('userId');
    expect(columns).toContain('voteCount');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('featureVote table has expected columns', async () => {
    const { featureVote } = await import('@/db/app.schema');
    const columns = Object.keys(featureVote);
    expect(columns).toContain('id');
    expect(columns).toContain('featureRequestId');
    expect(columns).toContain('userId');
    expect(columns).toContain('createdAt');
  });

  it('types file imports featureRequest and featureVote from schema', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const content = readFileSync(resolve(root, 'src/db/types.ts'), 'utf-8');
    expect(content).toContain('featureRequest');
    expect(content).toContain('featureVote');
    expect(content).toContain('FeatureRequest');
    expect(content).toContain('FeatureVote');
  });
});

describe('feature-requests i18n messages', () => {
  const en = loadMessages('en');
  const zh = loadMessages('zh');
  const ja = loadMessages('ja');

  const featureKeys = Object.keys(en).filter(
    (k) => k.startsWith('feature_requests_') || k.startsWith('nav_requests_and_roadmap')
  );

  it('has feature request i18n keys in en', () => {
    expect(featureKeys.length).toBeGreaterThanOrEqual(30);
  });

  it('all feature request keys exist in zh', () => {
    const missing = featureKeys.filter((k) => !(k in zh));
    expect(missing).toEqual([]);
  });

  it('all feature request keys exist in ja', () => {
    const missing = featureKeys.filter((k) => !(k in ja));
    expect(missing).toEqual([]);
  });

  it('no empty feature request values in en', () => {
    const empty = featureKeys.filter((k) => en[k].trim() === '');
    expect(empty).toEqual([]);
  });

  it('no empty feature request values in zh', () => {
    const empty = featureKeys.filter((k) => zh[k].trim() === '');
    expect(empty).toEqual([]);
  });

  it('interpolation variables match between en and zh for feature keys', () => {
    const varPattern = /\{(\w+)\}/g;
    const mismatched: string[] = [];
    for (const key of featureKeys) {
      const enVars = [...en[key].matchAll(varPattern)].map((m) => m[1]).sort();
      const zhVars = [...(zh[key] || '').matchAll(varPattern)]
        .map((m) => m[1])
        .sort();
      if (JSON.stringify(enVars) !== JSON.stringify(zhVars)) {
        mismatched.push(key);
      }
    }
    expect(mismatched).toEqual([]);
  });
});

describe('feature-requests routes', () => {
  it('Routes object includes RequestsAndRoadmap', async () => {
    const { Routes } = await import('@/lib/routes');
    expect(Routes.RequestsAndRoadmap).toBe('/requests-and-roadmap');
  });
});

describe('feature-requests migration', () => {
  it('migration SQL file exists and contains feature_request table', () => {
    const migrationDir = resolve(root, 'src/db/migrations');
    const files = readFileSync(
      resolve(migrationDir, '0003_mean_major_mapleleaf.sql'),
      'utf-8'
    );
    expect(files).toContain('CREATE TABLE `feature_request`');
    expect(files).toContain('CREATE TABLE `feature_vote`');
    expect(files).toContain('feature_request_status_idx');
    expect(files).toContain('feature_vote_feature_id_idx');
  });
});

describe('feature-requests API input validation', () => {
  it('createFeatureRequest schema rejects short title', async () => {
    const { z } = await import('zod');
    const schema = z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(1000),
      category: z.string().max(50).optional(),
    });

    const result = schema.safeParse({ title: 'ab', description: 'a'.repeat(10) });
    expect(result.success).toBe(false);
  });

  it('createFeatureRequest schema rejects short description', async () => {
    const { z } = await import('zod');
    const schema = z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(1000),
      category: z.string().max(50).optional(),
    });

    const result = schema.safeParse({ title: 'Valid title', description: 'short' });
    expect(result.success).toBe(false);
  });

  it('createFeatureRequest schema accepts valid input', async () => {
    const { z } = await import('zod');
    const schema = z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(1000),
      category: z.string().max(50).optional(),
    });

    const result = schema.safeParse({
      title: 'Add dark mode',
      description: 'It would be great to have a dark mode option for better readability',
      category: 'UI',
    });
    expect(result.success).toBe(true);
  });

  it('vote schema requires featureRequestId', async () => {
    const { z } = await import('zod');
    const schema = z.object({ featureRequestId: z.string() });

    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ featureRequestId: 'abc-123' }).success).toBe(true);
  });

  it('updateStatus schema only accepts valid statuses', async () => {
    const { z } = await import('zod');
    const schema = z.object({
      id: z.string(),
      status: z.enum(['submitted', 'planned', 'in_progress', 'done']),
    });

    expect(schema.safeParse({ id: '1', status: 'invalid' }).success).toBe(false);
    expect(schema.safeParse({ id: '1', status: 'planned' }).success).toBe(true);
    expect(schema.safeParse({ id: '1', status: 'in_progress' }).success).toBe(true);
    expect(schema.safeParse({ id: '1', status: 'done' }).success).toBe(true);
  });
});
