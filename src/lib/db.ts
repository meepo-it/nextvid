import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

/**
 * Create Drizzle instance for Cloudflare D1.
 * Use in server code (e.g. createServerFn) via: 
 * import { env } from "cloudflare:workers"; 
 * const db = getDb(env.DB);
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
