import * as authSchema from './auth.schema';
import * as appSchema from './app.schema';

/**
 * Single schema for Drizzle (getDb + drizzle-kit).
 * Auth tables from auth.schema; app tables from app.schema.
 */
export const schema = {
  ...authSchema,
  ...appSchema,
} as const;