import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { websiteConfig } from '@/config/website';
import { adminRouteMiddleware } from '@/middlewares/admin-middleware';
import { seo } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  ssr: false,
  component: AdminLayoutPage,
  server: {
    middleware: [adminRouteMiddleware],
  },
  head: () =>
    seo('/admin', {
      title: `${m.admin_layout_title()} | ${websiteConfig.metadata?.name}`,
    }),
});

function AdminLayoutPage() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
