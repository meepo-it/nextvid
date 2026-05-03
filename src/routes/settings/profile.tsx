import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProfileSettingsCard } from '@/components/settings/profile/profile-settings-card';
import * as m from '@/paraglide/messages.js';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const breadcrumbs = [
    { label: m.common_settings(), isCurrentPage: false },
    { label: m.settings_profile_title(), isCurrentPage: true },
  ];

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      title={m.settings_profile_title()}
      description={m.settings_profile_description()}
    >
      <div className="max-w-2xl">
        <ProfileSettingsCard />
      </div>
    </DashboardLayout>
  );
}
