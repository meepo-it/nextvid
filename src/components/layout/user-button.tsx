import { getAvatarLinks } from '@/config/avatar-config';
import { authClient } from '@/auth/auth-client';
import type { User } from 'better-auth';
import { IconLogout } from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from './user-avatar';

interface UserButtonProps {
  user: User;
}

export function UserButton({ user }: UserButtonProps) {
  const router = useRouter();
  const avatarLinks = getAvatarLinks();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.navigate({ to: '/' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          name={user.name ?? null}
          image={user.image ?? null}
          className="size-8 border cursor-pointer"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {avatarLinks.map((item) =>
          item.href ? (
            <DropdownMenuItem key={item.title}>
              <Link to={item.href} className="flex items-center">
                {item.icon ? <item.icon className="mr-2 size-4" /> : null}
                {item.title}
              </Link>
            </DropdownMenuItem>
          ) : null
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <IconLogout className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
