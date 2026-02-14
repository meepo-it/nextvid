import { createFileRoute } from '@tanstack/react-router';
import { getUsersFromDb } from '@/api/get-users.server';
import { requireSession, unauthorizedResponse } from '@/lib/require-session';

export const Route = createFileRoute('/api/admin/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await requireSession(request);
        if (!session?.user) {
          return unauthorizedResponse();
        }
        const url = new URL(request.url);
        const pageIndex = Math.max(
          0,
          Number(url.searchParams.get('pageIndex')) || 0
        );
        const pageSize = Math.min(
          100,
          Math.max(1, Number(url.searchParams.get('pageSize')) || 10)
        );
        const search = (url.searchParams.get('search') ?? '').trim();
        const sortId = url.searchParams.get('sortId') ?? 'createdAt';
        const sortDesc = url.searchParams.get('sortDesc') !== 'false';

        try {
          const { env } = await import('cloudflare:workers');
          const result = await getUsersFromDb(env.DB, {
            pageIndex,
            pageSize,
            search,
            sortId,
            sortDesc,
          });
          return Response.json({ success: true, data: result });
        } catch (error) {
          console.error('get users error:', error);
          return Response.json(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to fetch users',
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
