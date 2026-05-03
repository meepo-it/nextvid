import { getDb } from '@/db';
import { payment } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { adminApiMiddleware } from '@/middlewares/admin-middleware';
import { createServerFn } from '@tanstack/react-start';
import { and, asc, count as countFn, desc, eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';

const listPaymentsSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  search: z.string(),
  sortDesc: z.boolean(),
  status: z.string().optional(),
  type: z.string().optional(),
});

export const listAllPayments = createServerFn({ method: 'GET' })
  .inputValidator(listPaymentsSchema)
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    const db = getDb();
    const { pageIndex, pageSize, search, sortDesc, status, type } = data;
    const offset = pageIndex * pageSize;

    const conditions = [eq(payment.paid, true)];

    if (search.trim()) {
      const escaped = search
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_');
      const pattern = `%${escaped}%`;
      conditions.push(
        or(
          sql`lower(${user.name}) like lower(${pattern})`,
          sql`lower(${user.email}) like lower(${pattern})`
        )!
      );
    }
    if (status?.trim()) conditions.push(eq(payment.status, status.trim()));
    if (type?.trim()) conditions.push(eq(payment.type, type.trim()));

    const where = and(...conditions);
    const order = sortDesc ? desc(payment.createdAt) : asc(payment.createdAt);

    const [items, [{ count }]] = await Promise.all([
      db
        .select({
          id: payment.id,
          userId: payment.userId,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
          priceId: payment.priceId,
          customerId: payment.customerId,
          type: payment.type,
          scene: payment.scene,
          interval: payment.interval,
          status: payment.status,
          periodStart: payment.periodStart,
          periodEnd: payment.periodEnd,
          createdAt: payment.createdAt,
        })
        .from(payment)
        .innerJoin(user, eq(payment.userId, user.id))
        .where(where)
        .orderBy(order)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: countFn() })
        .from(payment)
        .innerJoin(user, eq(payment.userId, user.id))
        .where(where),
    ]);

    return { items, total: Number(count) };
  });
