import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

/**
 * Create Drizzle instance for Cloudflare D1.
 * https://orm.drizzle.team/docs/connect-cloudflare-d1
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

/** Better Auth tables */
export * from './auth.schema';
/** Application tables */
export * from './app.schema';
export { schema } from './schema';