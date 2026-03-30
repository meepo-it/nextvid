import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Separator } from '@/components/ui/separator';
import { UpdateAvatarCard } from '@/components/settings/profile/update-avatar-card';
import { UpdateNameCard } from '@/components/settings/profile/update-name-card';
import { PasswordCardWrapper } from '@/components/settings/security/password-card-wrapper';
import { DeleteAccountCard } from '@/components/settings/security/delete-account-card';
import { websiteConfig } from '@/config/website';
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

  const credentialLoginEnabled =
    websiteConfig.auth?.enableCredentialLogin ?? false;
  const deleteAccountEnabled = websiteConfig.auth?.enableDeleteAccount ?? false;

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      title={m.settings_profile_title()}
      description={m.settings_profile_description()}
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UpdateNameCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UpdateAvatarCard />
        </div>

        {(credentialLoginEnabled || deleteAccountEnabled) && (
          <>
            <Separator />
            <h3 className="text-lg font-semibold">{m.settings_security_title()}</h3>
            {credentialLoginEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PasswordCardWrapper />
              </div>
            )}
            {deleteAccountEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DeleteAccountCard />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
