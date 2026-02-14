import { auth } from '@/auth/auth';

/**
 * Validates session for API routes using Better Auth.
 * @returns Session if valid, null otherwise
 */
export async function requireSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session?.user) return null;
  return session;
}

/**
 * 401 Unauthorized response for API routes
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}
