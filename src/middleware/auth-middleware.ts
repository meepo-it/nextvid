import { auth } from '@/auth/auth';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { Routes } from '@/lib/routes';

/**
 * Auth middleware: requires authenticated user.
 * Use in route definitions via server: { middleware: [authMiddleware] }.
 * https://www.better-auth.com/docs/integrations/tanstack#middleware
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    throw redirect({ to: Routes.Login });
  }

  return await next();
});
