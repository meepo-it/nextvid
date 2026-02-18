import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DeleteAccountCard } from '@/components/settings/security/delete-account-card';
import { PasswordCardWrapper } from '@/components/settings/security/password-card-wrapper';
import { messages } from '@/config/messages';
import { websiteConfig } from '@/config/website';
import { createFileRoute } from '@tanstack/react-router';

const m = messages.settings.security;

export const Route = createFileRoute('/settings/security')({
  component: SecurityPage,
});

function SecurityPage() {
  const breadcrumbs = [
    { label: messages.common.settings, isCurrentPage: false },
    { label: m.title, isCurrentPage: true },
  ];
  const credentialLoginEnabled =
    websiteConfig.auth?.enableCredentialLogin ?? true;

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      title={m.title}
      description={m.description}
    >
      <div className="flex flex-col gap-8">
        {credentialLoginEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PasswordCardWrapper />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DeleteAccountCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
