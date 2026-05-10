/**
 * Adapter registry — maps provider key → adapter function.
 *
 * When a new vendor is integrated:
 *   1. Create src/video/adapters/<vendor>-adapter.ts
 *   2. Add an entry here
 *   3. Add the provider row in Admin → Video Models
 */

import { apimartAdapter } from './apimart-adapter';
import type { VideoAdapterFn } from './types';

const REGISTRY: Record<string, VideoAdapterFn> = {
  apimart: apimartAdapter,
  // future: sora: soraAdapter,
  // future: runway: runwayAdapter,
};

export function getAdapter(providerKey: string): VideoAdapterFn {
  const adapter = REGISTRY[providerKey];
  if (!adapter)
    throw new Error(`No adapter registered for provider: "${providerKey}"`);
  return adapter;
}
