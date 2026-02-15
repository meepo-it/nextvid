import { websiteConfig } from '@/config/website';
import { FormError } from '@/components/layout/form-error';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { messages } from '@/config/messages';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const m = messages.waitlist;

const schema = z.object({
  email: z.string().email(m.emailInvalid),
});

type FormValues = z.infer<typeof schema>;

export function WaitlistFormCard() {
  const [error, setError] = useState<string | undefined>();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const isPending = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setError(undefined);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (json.success) {
        form.reset();
        return;
      }
      setError(json.error ?? m.error);
    } catch (err) {
      console.error('Waitlist subscription error:', err);
      setError(m.error);
    }
  }

  if (!websiteConfig.newsletter?.enable) return null;

  return (
    <Card className="mx-auto max-w-lg overflow-hidden pt-6 pb-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{m.subtitle}</CardTitle>
        {/* <CardDescription>{m.description}</CardDescription> */}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.email}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={m.placeholderEmail}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
          </CardContent>
          <CardFooter className="mt-6 flex items-center justify-between rounded-none border-t bg-muted px-6 py-4">
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? m.subscribing : m.subscribe}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
