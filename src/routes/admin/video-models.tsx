import { createFileRoute } from '@tanstack/react-router';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { AdminVideoModelsContent } from '@/components/admin/video-models/admin-video-models-content';

export const Route = createFileRoute('/admin/video-models')({
  component: AdminVideoModelsPage,
});

function AdminVideoModelsPage() {
  const breadcrumbs = [
    { label: 'Admin', isCurrentPage: false },
    { label: 'Video Models', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 lg:gap-6 lg:py-6">
            <div className="px-4 lg:px-6">
              <AdminVideoModelsContent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
