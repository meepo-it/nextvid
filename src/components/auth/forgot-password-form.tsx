import { useEffect, useState } from 'react';
import { AuthCard } from '@/components/auth/auth-card';
import { FormError } from '@/components/layout/form-error';
import { FormSuccess } from '@/components/layout/form-success';
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
import { authClient } from '@/auth/auth-client';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { messages } from '@/config/messages';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const m = messages.auth.forgotPassword;

export function ForgotPasswordForm({ className }: { className?: string }) {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, setIsPending] = useState(false);

  const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: m.emailRequired }),
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
        onSuccess: () => setSuccess(m.checkEmail),
        onError: (ctx) => {
          setError(`${ctx.error.status}: ${ctx.error.message}`);
        },
      }
    );
  };

  return (
    <AuthCard
      headerLabel={m.title}
      bottomButtonLabel={m.backToLogin}
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
                  <FormLabel>{m.email}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={m.placeholderEmail}
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
            className="w-full cursor-pointer"
          >
            {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            <span>{m.send}</span>
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
