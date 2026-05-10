import { websiteConfig } from '@/config/website';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seoNoindex } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/creations')({
  head: () =>
    seoNoindex('/creations', {
      title: `${m.video_creations_title()} | ${websiteConfig.metadata?.name}`,
    }),
  server: {
    middleware: [authRouteMiddleware],
  },
  component: () => <Outlet />,
});
