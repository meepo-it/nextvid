import { DashboardHeader } from '@/components/layout/dashboard-header';
import * as m from '@/paraglide/messages.js';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const breadcrumbs = [
    {
      label: m.dashboard_title(),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col" />
    </>
  );
}
