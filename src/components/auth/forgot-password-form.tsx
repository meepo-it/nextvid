import { useEffect, useState } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { FormError } from '@/components/shared/form-error';
import { FormSuccess } from '@/components/shared/form-success';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/auth/client';
import { cn } from '@/lib/utils';
import { Routes } from '@/lib/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import * as m from '@/paraglide/messages.js';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const authErrorCodes: Record<string, () => string> = {
  signup_disabled: m.auth_error_codes_signup_disabled,
  account_already_linked_to_different_user: m.auth_error_codes_account_already_linked_to_different_user,
  unable_to_link_account: m.auth_error_codes_unable_to_link_account,
  unable_to_get_user_info: m.auth_error_codes_unable_to_get_user_info,
  "email_doesn't_match": m.auth_error_codes_email_doesnt_match,
  email_not_found: m.auth_error_codes_email_not_found,
  oauth_provider_not_found: m.auth_error_codes_oauth_provider_not_found,
  no_callback_url: m.auth_error_codes_no_callback_url,
  no_code: m.auth_error_codes_no_code,
  state_mismatch: m.auth_error_codes_state_mismatch,
  state_not_found: m.auth_error_codes_state_not_found,
  invalid_callback_request: m.auth_error_codes_invalid_callback_request,
};

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, setIsPending] = useState(false);

  const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: m.auth_forgot_password_email_required() }),
  });

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const emailFromUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('email')
      : null;

  useEffect(() => {
    if (emailFromUrl) form.setValue('email', emailFromUrl);
  }, [emailFromUrl, form]);

  const onSubmit = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    await authClient.requestPasswordReset(
      {
        email: values.email,
        redirectTo: Routes.ResetPassword,
      },
      {
        onRequest: () => {
          setIsPending(true);
          setError('');
          setSuccess('');
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => setSuccess(m.auth_forgot_password_check_email()),
        onError: (ctx) => {
          const code = ctx.error.code;
          const friendlyMessage =
            code && authErrorCodes[code]
              ? authErrorCodes[code]()
              : ctx.error.message;
          setError(friendlyMessage);
        },
      }
    );
  };

  return (
    <AuthCard
      headerLabel={m.auth_forgot_password_title()}
      bottomButtonLabel={m.auth_forgot_password_back_to_login()}
      bottomButtonHref={Routes.Login}
      className={cn('', className)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.auth_forgot_password_email()}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={m.auth_forgot_password_placeholder_email()}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            size="lg"
            type="submit"
            className="w-full flex items-center justify-center gap-2"
          >
            {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            <span>{m.auth_forgot_password_send()}</span>
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
