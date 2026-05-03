import { createFileRoute } from '@tanstack/react-router';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { AdminPaymentsContent } from '@/components/admin/payments/admin-payments-content';

export const Route = createFileRoute('/admin/payments')({
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const breadcrumbs = [
    { label: 'Admin', isCurrentPage: false },
    { label: 'Payments', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6">
            <div className="px-4 lg:px-6">
              <AdminPaymentsContent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
