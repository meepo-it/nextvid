import { SidebarLayoutPage } from '@/components/layout/sidebar-layout';
import { websiteConfig } from '@/config/website';
import { adminRouteMiddleware } from '@/middlewares/admin-middleware';
import { seo } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  ssr: false,
  component: SidebarLayoutPage,
  server: {
    middleware: [adminRouteMiddleware],
  },
  head: () =>
    seo('/admin', {
      title: `${m.admin_layout_title()} | ${websiteConfig.metadata?.name}`,
    }),
});
