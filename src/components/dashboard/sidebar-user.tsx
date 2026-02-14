import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { websiteConfig } from '@/config/website';
import type { User } from 'better-auth';
import {
  IconLogout,
  IconMoon,
  IconSelector,
  IconSun,
} from '@tabler/icons-react';
import { useTheme } from '@/components/layout/theme-provider';
import { useRouter } from '@tanstack/react-router';
import { UserAvatar } from '@/components/layout/user-avatar';

interface SidebarUserProps {
  user: User;
  className?: string;
}

export function SidebarUser({ user }: SidebarUserProps) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const showModeSwitch = websiteConfig.ui?.mode?.enableSwitch ?? false;

  const handleSignOut = async () => {
    try {
      const { authClient } = await import('@/lib/auth-client');
      await authClient.signOut();
      router.navigate({ to: '/' });
    } catch (error) {
      console.error('sign out error:', error);
    }
  };

  return (
    <SidebarMenu className="border-t pt-4">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar
                  name={user.name ?? null}
                  image={user.image ?? null}
                  className="size-8 border"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <IconSelector className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar
                    name={user.name ?? null}
                    image={user.image ?? null}
                    className="size-8 border"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              {showModeSwitch && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setTheme('light')}
                  >
                    <IconSun className="mr-2 size-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => setTheme('dark')}
                  >
                    <IconMoon className="mr-2 size-4" />
                    Dark
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
              >
                <IconLogout className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
