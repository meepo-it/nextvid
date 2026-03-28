import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { RegisterForm } from '@/components/auth/register-form';
import { websiteConfig } from '@/config/website';
import * as m from '@/paraglide/messages.js';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/auth/register')({
  beforeLoad: () => {
    if (!websiteConfig.auth?.enable) {
      throw redirect({ to: Routes.Root });
    }
  },
  component: RegisterPage,
  head: () => ({
    meta: [{ title: m.auth_register_title() }, { name: 'description', content: m.auth_register_description() }],
  }),
});

function RegisterPage() {
  return (
    <div className="flex flex-col gap-4">
      <RegisterForm />
      <div className="text-balance text-center text-xs text-muted-foreground">
        {m.auth_common_by_clicking_continue()}
        <Link
          to={Routes.TermsOfService}
          className="underline underline-offset-4 hover:text-primary"
        >
          {m.auth_common_terms_of_service()}
        </Link>
        {m.auth_common_and()}
        <Link
          to={Routes.PrivacyPolicy}
          className="underline underline-offset-4 hover:text-primary"
        >
          {m.auth_common_privacy_policy()}
        </Link>
      </div>
    </div>
  );
}
