import { SidebarLayout } from '@/components/dashboard/sidebar-layout';
import { authMiddleware } from '@/middleware/auth-middleware';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardLayoutPage,
  server: {
    middleware: [authMiddleware],
  },
});

function DashboardLayoutPage() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
