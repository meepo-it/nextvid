import { getDb } from '@/db';
import { user } from '@/db/auth.schema';
import { and, asc, count as countFn, desc, ilike, or } from 'drizzle-orm';

export interface GetUsersParams {
  pageIndex: number;
  pageSize: number;
  search: string;
  sortId: string;
  sortDesc: boolean;
}

const sortFieldMap: Record<
  string,
  typeof user.name | typeof user.email | typeof user.createdAt
> = {
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
};

/**
 * Server-only: list users with search, sort, pagination. Requires Cloudflare env.
 */
export async function getUsersFromDb(
  d1: D1Database,
  params: GetUsersParams
): Promise<{ items: Array<Record<string, unknown>>; total: number }> {
  const db = getDb(d1);
  const { pageIndex, pageSize, search, sortId, sortDesc } = params;
  const offset = pageIndex * pageSize;

  const conditions = [];
  if (search) {
    conditions.push(
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))!
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortField = sortFieldMap[sortId] ?? user.createdAt;
  const sortDirection = sortDesc ? desc : asc;

  const [items, [{ count }]] = await Promise.all([
    db
      .select()
      .from(user)
      .where(where)
      .orderBy(sortDirection(sortField))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: countFn() }).from(user).where(where),
  ]);

  return {
    items: items.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: row.emailVerified,
      image: row.image,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    total: Number(count),
  };
}
