import { createFileRoute } from '@tanstack/react-router';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { AdminFeatureRequestsContent } from '@/components/admin/feature-requests/admin-feature-requests-content';
import * as m from '@/paraglide/messages.js';

export const Route = createFileRoute('/admin/feature-requests')({
  component: AdminFeatureRequestsPage,
});

function AdminFeatureRequestsPage() {
  const breadcrumbs = [
    { label: m.admin_title(), isCurrentPage: false },
    { label: m.admin_feature_requests_title(), isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6">
            <div className="px-4 lg:px-6">
              <AdminFeatureRequestsContent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
