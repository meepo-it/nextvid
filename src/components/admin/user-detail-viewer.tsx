import type { User } from '@/auth/auth-types';
import { UserAvatar } from '@/components/layout/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useBanUser, useUnbanUser } from '@/hooks/use-users';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { messages } from '@/messages';
import {
  IconCalendar,
  IconLoader2,
  IconMailCheck,
  IconMailQuestion,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

const m = messages.admin.users;

interface UserDetailViewerProps {
  user: User;
}

export function UserDetailViewer({ user }: UserDetailViewerProps) {
  const isMobile = useIsMobile();
  const [error, setError] = useState<string | undefined>();
  const [banReason, setBanReason] = useState<string>(m.ban.defaultReason);
  const [banExpiresAt, setBanExpiresAt] = useState<Date | undefined>();

  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const toDate = (v: Date | string | number | null | undefined): Date | null =>
    v ? new Date(v) : null;

  const handleBan = async () => {
    if (!banReason?.trim()) {
      setError(m.ban.error);
      return;
    }
    if (!user.id) {
      setError('User ID is required');
      return;
    }
    setError(undefined);
    try {
      await banUserMutation.mutateAsync({
        userId: user.id,
        banReason: banReason.trim(),
        banExpiresIn: banExpiresAt
          ? Math.floor((banExpiresAt.getTime() - Date.now()) / 1000)
          : undefined,
      });
      toast.success(m.ban.success);
      setBanReason(m.ban.defaultReason);
      setBanExpiresAt(undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : m.ban.error;
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUnban = async () => {
    if (!user.id) {
      setError('User ID is required');
      return;
    }
    setError(undefined);
    try {
      await unbanUserMutation.mutateAsync({ userId: user.id });
      toast.success(m.unban.success);
    } catch (err) {
      const msg = err instanceof Error ? err.message : m.unban.error;
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <div className="flex items-center gap-2">
        <UserAvatar
          name={user.name ?? null}
          image={user.image ?? null}
          className="size-8 shrink-0 border"
        />
        <DrawerTrigger asChild>
          <Button
            variant="link"
            className="w-fit cursor-pointer px-0 text-left text-foreground"
          >
            <span className="font-medium hover:underline hover:underline-offset-4">
              {user.name}
            </span>
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.name ?? null}
              image={user.image ?? null}
              className="size-12 border"
            />
            <DrawerTitle>{user.name}</DrawerTitle>
          </div>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={user.role === 'admin' ? 'default' : 'outline'}
                className="px-1.5"
              >
                {user.role === 'admin' ? m.admin : m.user}
              </Badge>
              <Badge variant="outline" className="px-1.5">
                {user.banned ? (
                  <>
                    <IconUserX className="stroke-red-500 dark:stroke-red-400" />
                    {m.banned}
                  </>
                ) : (
                  <>
                    <IconUserCheck className="stroke-green-500 dark:stroke-green-400" />
                    {m.active}
                  </>
                )}
              </Badge>
            </div>
            {user.email && (
              <div className="grid gap-3">
                <span className="text-xs text-muted-foreground">
                  {m.columns.email}:
                </span>
                <Badge
                  variant="outline"
                  className="w-fit cursor-pointer px-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    navigator.clipboard.writeText(user.email);
                    toast.success(m.emailCopied);
                  }}
                >
                  {user.emailVerified ? (
                    <IconMailCheck className="stroke-green-500 dark:stroke-green-400" />
                  ) : (
                    <IconMailQuestion className="stroke-red-500 dark:stroke-red-400" />
                  )}
                  {user.email}
                </Badge>
              </div>
            )}
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{m.joined}:</span>
              <span>
                {toDate(user.createdAt)
                  ? formatDate(toDate(user.createdAt)!)
                  : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{m.updated}:</span>
              <span>
                {toDate(user.updatedAt)
                  ? formatDate(toDate(user.updatedAt)!)
                  : '-'}
              </span>
            </div>
          </div>
          <Separator />
          {error && <div className="text-sm text-destructive">{error}</div>}
          {user.banned ? (
            <div className="grid gap-4">
              {user.banReason && (
                <div>
                  {m.ban.reason}: {user.banReason}
                </div>
              )}
              <div>
                {m.ban.expires}:{' '}
                {user.banExpires && toDate(user.banExpires)
                  ? formatDate(toDate(user.banExpires)!)
                  : m.ban.never}
              </div>
              <Button
                variant="destructive"
                onClick={handleUnban}
                disabled={unbanUserMutation.isPending}
                className="mt-4 cursor-pointer"
              >
                {unbanUserMutation.isPending && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {m.unban.button}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleBan();
              }}
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="ban-reason">{m.ban.reason}</Label>
                <Textarea
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder={m.ban.reasonPlaceholder}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>{m.ban.expires}</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      'flex h-9 w-full cursor-pointer items-center justify-start gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-normal outline-none hover:bg-muted hover:text-foreground',
                      !banExpiresAt && 'text-muted-foreground'
                    )}
                  >
                    <IconCalendar className='size-4' />
                    {banExpiresAt ? (
                      formatDate(banExpiresAt)
                    ) : (
                      <span>{m.ban.selectDate}</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={banExpiresAt}
                      onSelect={setBanExpiresAt}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="submit"
                variant="destructive"
                disabled={banUserMutation.isPending || !banReason?.trim()}
                className="mt-4 cursor-pointer"
              >
                {banUserMutation.isPending && (
                  <IconLoader2 className="mr-2 size-4 animate-spin" />
                )}
                {m.ban.button}
              </Button>
            </form>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{m.close}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
