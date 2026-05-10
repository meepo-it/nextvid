import { SidebarLayoutPage } from '@/components/layout/sidebar-layout';
import { websiteConfig } from '@/config/website';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seoNoindex } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: SidebarLayoutPage,
  server: {
    middleware: [authRouteMiddleware],
  },
  head: () =>
    seoNoindex('/settings', {
      title: `${m.settings_layout_title()} | ${websiteConfig.metadata?.name}`,
    }),
});
