import { createFileRoute, Link } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/login-form';
import { messages } from '@/config/messages';
import { Routes } from '@/routes';

const m = messages.auth.login;
const am = messages.auth.common;

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  head: () => ({
    meta: [{ title: m.title }, { name: 'description', content: m.description }],
  }),
});

function LoginPage() {
  return (
    <div className="flex flex-col gap-4">
      <LoginForm />
      <div className="text-balance text-center text-xs text-muted-foreground">
        {am.byClickingContinue}
        <Link
          to={Routes.TermsOfService}
          className="underline underline-offset-4 hover:text-primary"
        >
          {am.termsOfService}
        </Link>
        {am.and}
        <Link
          to={Routes.PrivacyPolicy}
          className="underline underline-offset-4 hover:text-primary"
        >
          {am.privacyPolicy}
        </Link>
      </div>
    </div>
  );
}
