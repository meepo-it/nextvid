import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ApiKeysPageClient } from '@/components/settings/apikeys/apikeys-page-client';
import { messages } from '@/messages';
import { createFileRoute } from '@tanstack/react-router';

const m = messages.settings.apiKeys;

export const Route = createFileRoute('/settings/apikeys')({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const breadcrumbs = [
    { label: messages.common.settings, isCurrentPage: false },
    { label: m.title, isCurrentPage: true },
  ];

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      title={m.title}
      description={m.description}
    >
      <ApiKeysPageClient />
    </DashboardLayout>
  );
}
