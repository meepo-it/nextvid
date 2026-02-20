import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { authMiddleware } from '@/middleware/auth-middleware';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  ssr: false,
  component: SettingsLayoutPage,
  server: {
    middleware: [authMiddleware],
  },
});

function SettingsLayoutPage() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
