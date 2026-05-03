import * as m from '@/paraglide/messages.js';
import { FormError } from '@/components/shared/form-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/client';
import { useUploadUserAvatar } from '@/hooks/use-user-files';
import { cn } from '@/lib/utils';
import { DEFAULT_MAX_FILE_SIZE } from '@/storage/types';
import { IconUser } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const nameSchema = z.object({
  name: z
    .string()
    .min(3, { message: m.settings_profile_name_min_length() })
    .max(30, { message: m.settings_profile_name_max_length() }),
});

export function ProfileSettingsCard() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  // --- Name form ---
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  useEffect(() => {
    if (user?.name) form.setValue('name', user.name);
  }, [user, form]);

  const onSubmitName = async (values: z.infer<typeof nameSchema>) => {
    if (values.name === user?.name) return;
    await authClient.updateUser(
      { name: values.name },
      {
        onRequest: () => {
          setIsSaving(true);
          setNameError('');
        },
        onResponse: () => {
          setIsSaving(false);
        },
        onSuccess: () => {
          toast.success(m.settings_profile_name_success());
          refetch();
          form.reset({ name: values.name });
        },
        onError: (ctx) => {
          setNameError(`${ctx.error.status}: ${ctx.error.message}`);
          toast.error(m.settings_profile_name_fail());
        },
      }
    );
  };

  // --- Avatar ---
  const [avatarUrl, setAvatarUrl] = useState(user?.image ?? '');
  const [avatarError, setAvatarError] = useState<string | undefined>();
  const uploadMutation = useUploadUserAvatar();
  const storageEnabled = websiteConfig.storage?.enable;

  useEffect(() => {
    if (session?.user?.image) setAvatarUrl(session.user.image);
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleFileUpload = (file: File) => {
    const maxSize = websiteConfig.storage?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
    if (file.size > maxSize) {
      setAvatarError('File size exceeds the server limit');
      toast.error('File size exceeds the server limit');
      return;
    }
    setAvatarError('');
    const tempUrl = URL.createObjectURL(file);
    setAvatarUrl(tempUrl);

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        authClient.updateUser(
          { image: result.url },
          {
            onSuccess: () => {
              setAvatarUrl(result.url);
              URL.revokeObjectURL(tempUrl);
              toast.success(m.settings_profile_avatar_success());
              refetch();
            },
            onError: (ctx) => {
              setAvatarError(`${ctx.error.status}: ${ctx.error.message}`);
              if (session?.user?.image) setAvatarUrl(session.user.image);
              URL.revokeObjectURL(tempUrl);
              toast.error(m.settings_profile_avatar_fail());
            },
          }
        );
      },
      onError: (err) => {
        const msg = err.message || m.settings_profile_avatar_fail();
        setAvatarError(msg);
        if (session?.user?.image) setAvatarUrl(session.user.image);
        URL.revokeObjectURL(tempUrl);
        toast.error(msg);
      },
    });
  };

  if (!user) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          {m.settings_profile_title()}
        </CardTitle>
        <CardDescription>{m.settings_profile_description()}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 divide-y divide-border">
        {/* Avatar row */}
        {storageEnabled && (
          <div className="flex items-center justify-between gap-6 py-4 first:pt-0">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {m.settings_profile_avatar_title()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {m.settings_profile_avatar_hint()}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Avatar className="size-9 border">
                <AvatarImage src={avatarUrl} alt={user.name ?? ''} />
                <AvatarFallback className="absolute inset-0">
                  <IconUser className="size-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <label
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'cursor-pointer',
                  uploadMutation.isPending && 'pointer-events-none opacity-50'
                )}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                  disabled={uploadMutation.isPending}
                />
                {uploadMutation.isPending
                  ? m.settings_profile_avatar_uploading()
                  : m.settings_profile_avatar_upload_avatar()}
              </label>
            </div>
            {avatarError && (
              <div className="col-span-full">
                <FormError message={avatarError} />
              </div>
            )}
          </div>
        )}

        {/* Name row */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitName)}
            className="flex items-start justify-between gap-6 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {m.settings_profile_name_title()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {m.settings_profile_name_hint()}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0 w-64">
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1 space-y-0">
                      <FormControl>
                        <Input
                          placeholder={m.settings_profile_name_placeholder()}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="mt-1 text-xs" />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" disabled={isSaving}>
                  {isSaving
                    ? m.settings_profile_name_saving()
                    : m.settings_profile_name_save()}
                </Button>
              </div>
              {nameError && <FormError message={nameError} />}
            </div>
          </form>
        </Form>

        {/* Email row (read-only) */}
        <div className="flex items-center justify-between gap-6 py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Email</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {m.settings_profile_description()}
            </p>
          </div>
          <div className="shrink-0 w-64">
            <Input value={user.email ?? ''} disabled className="bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
