import { createFileRoute, redirect } from '@tanstack/react-router';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { websiteConfig } from '@/config/website';
import * as m from '@/paraglide/messages.js';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/auth/reset-password')({
  beforeLoad: () => {
    if (!websiteConfig.auth?.enable) {
      throw redirect({ to: Routes.Root });
    }
  },
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: m.auth_reset_password_title() }, { name: 'description', content: m.auth_reset_password_description() }],
  }),
});

function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
