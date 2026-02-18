import { SidebarLayout } from '@/components/dashboard/sidebar-layout';
import { adminMiddleware } from '@/middleware/admin-middleware';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/admin')({
  ssr: false,
  component: AdminLayoutPage,
  server: {
    middleware: [adminMiddleware],
  },
});

function AdminLayoutPage() {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
}
