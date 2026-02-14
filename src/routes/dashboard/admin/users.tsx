import { createFileRoute } from '@tanstack/react-router';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { UsersPageClient } from '@/components/admin/users-page-client';
import { messages } from '@/config/messages';

const m = messages.admin.users;

export const Route = createFileRoute('/dashboard/admin/users')({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const breadcrumbs = [{ label: m.title, isCurrentPage: true }];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
            <UsersPageClient />
          </div>
        </div>
      </div>
    </>
  );
}
