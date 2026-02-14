import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { messages } from '@/config/messages';

const m = messages.auth.resetPassword;

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: m.title }, { name: 'description', content: m.description }],
  }),
});

function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
