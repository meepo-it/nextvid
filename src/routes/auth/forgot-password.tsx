import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { messages } from '@/config/messages';

const m = messages.auth.forgotPassword;

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [{ title: m.title }, { name: 'description', content: m.description }],
  }),
});

function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
