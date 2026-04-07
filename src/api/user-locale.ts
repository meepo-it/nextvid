import { getDb } from '@/db';
import { user } from '@/db/auth.schema';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { normalizeLocale } from '@/lib/i18n';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Persist the authenticated user's preferred locale on the `user` row.
 *
 * Called from the locale switcher whenever a logged-in user picks a language,
 * so background email jobs (which run outside any request context) can render
 * templates in the recipient's language. Anonymous switches are still tracked
 * via the `PARAGLIDE_LOCALE` cookie.
 */
export const setUserLocale = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ locale: z.string().min(2).max(10) }))
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb();
    await db
      .update(user)
      .set({ locale: normalizeLocale(data.locale), updatedAt: new Date() })
      .where(eq(user.id, context.userId));
    return { success: true };
  });
