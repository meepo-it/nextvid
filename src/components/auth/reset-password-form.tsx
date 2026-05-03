import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
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
import { Routes } from '@/lib/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import * as m from '@/paraglide/messages.js';
import * as z from 'zod';

const authErrorCodes: Record<string, () => string> = {
  signup_disabled: m.auth_error_codes_signup_disabled,
  account_already_linked_to_different_user:
    m.auth_error_codes_account_already_linked_to_different_user,
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

const ResetPasswordSchema = z.object({
  password: z.string().min(8, { message: m.auth_reset_password_min_length() }),
});

export function ResetPasswordForm() {
  const router = useRouter();
  const token =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('token')
      : null;
  const errorParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('error')
      : null;

  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '' },
  });

  if (!token || errorParam === 'invalid_token') {
    return (
      <AuthCard
        headerLabel={m.auth_reset_password_title()}
        bottomButtonLabel={m.auth_reset_password_back_to_login()}
        bottomButtonHref={Routes.Login}
      >
        <p className="text-sm text-destructive py-4">
          {m.auth_reset_password_invalid_token()}
        </p>
      </AuthCard>
    );
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    await authClient.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onRequest: () => {
          setIsPending(true);
          setError('');
          setSuccess('');
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => {
          router.navigate({ to: Routes.Login });
        },
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
      headerLabel={m.auth_reset_password_title()}
      bottomButtonLabel={m.auth_reset_password_back_to_login()}
      bottomButtonHref={Routes.Login}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.auth_reset_password_password()}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={m.auth_reset_password_placeholder_password()}
                        type={showPassword ? 'text' : 'password'}
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 border-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <IconEyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <IconEye className="size-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword
                          ? m.auth_reset_password_hide_password()
                          : m.auth_reset_password_show_password()}
                      </span>
                    </Button>
                  </div>
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
            <span>{m.auth_reset_password_reset()}</span>
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
