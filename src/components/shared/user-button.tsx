import { authClient } from '@/auth/client';
import { useCurrentPlan } from '@/hooks/use-payment';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from './user-avatar';
import * as m from '@/paraglide/messages.js';
import { useState } from 'react';
import { toast } from 'sonner';
import type { SessionUser } from '@/auth/types';
import { IconCoins, IconLogout, IconShieldCheck } from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';

interface UserButtonProps {
  user: SessionUser;
  credits?: number;
}

export function UserButton({ user, credits = 0 }: UserButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: planData } = useCurrentPlan();

  const planName = planData?.currentPlan?.name ?? 'FREE';

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: '/' });
        },
        onError: (err) => {
          toast.error(m.auth_common_logout_failed());
          console.error('sign out error:', err);
        },
      },
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger aria-label="User menu">
        <UserAvatar
          name={user.name ?? null}
          image={user.image ?? null}
          className="size-9 border"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* User info header */}
        <div className="flex items-center gap-3 p-3">
          <UserAvatar
            name={user.name ?? null}
            image={user.image ?? null}
            className="size-12 border shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <p className="font-semibold text-base truncate">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <span className="mt-1 inline-flex w-fit items-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {planName}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Credits */}
        <Link to={Routes.SettingsCredits} className="block">
          <DropdownMenuItem className="gap-3 py-2.5">
            <IconCoins className="size-4 shrink-0" />
            <span className="flex-1">Credits</span>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
              )}
            >
              {credits.toLocaleString()}
            </span>
          </DropdownMenuItem>
        </Link>

        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <Link to={Routes.AdminOverview} className="block">
              <DropdownMenuItem className="gap-3 py-2.5">
                <IconShieldCheck className="size-4 shrink-0" />
                <span>Admin</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Log out */}
        <DropdownMenuItem
          className="gap-3 py-2.5"
          onClick={async (event) => {
            event.preventDefault();
            setOpen(false);
            await handleSignOut();
          }}
        >
          <IconLogout className="size-4 shrink-0" />
          {m.auth_common_logout()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
