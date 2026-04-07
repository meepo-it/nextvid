import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { websiteConfig } from '@/config/website';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { seo } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: SettingsLayoutPage,
  server: {
    middleware: [authRouteMiddleware],
  },
  head: () =>
    seo('/settings', {
      title: `${m.settings_layout_title()} | ${websiteConfig.metadata?.name}`,
    }),
});

function SettingsLayoutPage() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
