import { messages } from '@/config/messages';
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
import { authClient } from '@/auth/auth-client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const m = messages.dashboard.settings.security.updatePassword;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: m.currentRequired }),
  newPassword: z.string().min(8, { message: m.newMinLength }),
});

interface UpdatePasswordCardProps {
  className?: string;
}

export function UpdatePasswordCard({ className }: UpdatePasswordCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | undefined>('');
  const { data: session } = authClient.useSession();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const user = session?.user;
  if (!user) return null;

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    await authClient.changePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      },
      {
        onRequest: () => {
          setIsSaving(true);
          setError('');
        },
        onResponse: () => {
          setIsSaving(false);
        },
        onSuccess: () => {
          toast.success(m.success);
          form.reset();
        },
        onError: (ctx) => {
          setError(`${ctx.error.status}: ${ctx.error.message}`);
          toast.error(m.fail);
        },
      }
    );
  };

  return (
    <Card
      className={cn(
        'w-full overflow-hidden pt-6 pb-0 flex flex-col',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{m.title}</CardTitle>
        <CardDescription>{m.description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1"
        >
          <CardContent className="space-y-4 flex-1">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.currentPassword}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder={m.placeholderCurrent}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrent(!showCurrent)}
                      >
                        {showCurrent ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showCurrent ? m.hidePassword : m.showPassword}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.newPassword}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        placeholder={m.placeholderNew}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? (
                          <IconEyeOff className="size-4" />
                        ) : (
                          <IconEye className="size-4" />
                        )}
                        <span className="sr-only">
                          {showNew ? m.hidePassword : m.showPassword}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
          </CardContent>
          <CardFooter className="mt-6 px-6 py-4 flex justify-between items-center bg-muted rounded-none">
            <p className="text-sm text-muted-foreground">{m.hint}</p>
            <Button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer"
            >
              {isSaving ? m.saving : m.save}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
