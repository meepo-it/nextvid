import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { websiteConfig } from '@/config/website';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seo } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardLayoutPage,
  server: {
    middleware: [authRouteMiddleware],
  },
  // Layout-level fallback metadata. Child routes can override via their own
  // `head()`. Protected pages are not crawled, but the browser tab title and
  // OG metadata still need to be sensible (and localized).
  head: () =>
    seo('/dashboard', {
      title: `${m.dashboard_layout_title()} | ${websiteConfig.metadata?.name}`,
    }),
});

function DashboardLayoutPage() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
