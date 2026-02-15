import { messages } from '@/config/messages';
import { FormError } from '@/components/layout/form-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/auth-client';
import { MAX_FILE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { uploadFileFromBrowser } from '@/storage/client';
import { IconUserCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UpdateAvatarCardProps {
  className?: string;
}

const m = messages.dashboard.settings.profile.avatar;

/**
 * Renders when storage and enableUpdateAvatar are enabled. Supports avatar upload via S3-compatible storage.
 */
export function UpdateAvatarCard({ className }: UpdateAvatarCardProps) {
  if (
    !websiteConfig.storage?.enable ||
    !websiteConfig.features?.enableUpdateAvatar
  ) {
    return null;
  }

  const [error, setError] = useState<string | undefined>('');
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const { data: session, refetch } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.image) setAvatarUrl(session.user.image);
  }, [session]);

  const user = session?.user;
  if (!user) return null;

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileUpload(file);
    };
    input.click();
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError('');
    let tempUrl = '';

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds the server limit');
      }

      tempUrl = URL.createObjectURL(file);
      setAvatarUrl(tempUrl);

      const { url } = await uploadFileFromBrowser(file, 'avatars');

      await authClient.updateUser(
        { image: url },
        {
          onSuccess: () => {
            setAvatarUrl(url);
            toast.success(m.success);
            refetch();
          },
          onError: (ctx) => {
            setError(`${ctx.error.status}: ${ctx.error.message}`);
            if (session?.user?.image) setAvatarUrl(session.user.image);
            toast.error(m.fail);
          },
        }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : m.fail;
      setError(msg);
      if (session?.user?.image) setAvatarUrl(session.user.image);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    }
  };

  return (
    <Card
      className={cn(
        'w-full overflow-hidden py-0 pt-6 flex flex-col',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{m.title}</CardTitle>
        <CardDescription>{m.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-8">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={avatarUrl ?? ''} alt={user.name ?? ''} />
            <AvatarFallback>
              <IconUserCircle className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="cursor-pointer"
          >
            {isUploading ? m.uploading : m.uploadAvatar}
          </Button>
        </div>
        <FormError message={error} />
      </CardContent>
      <CardFooter className="mt-auto px-6 py-4 flex justify-between items-center bg-muted rounded-none">
        <p className="text-sm text-muted-foreground">{m.hint}</p>
      </CardFooter>
    </Card>
  );
}
