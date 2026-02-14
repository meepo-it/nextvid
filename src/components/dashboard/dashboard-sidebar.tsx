import { Logo } from '@/components/layout/logo';
import { SidebarMain } from '@/components/dashboard/sidebar-main';
import { SidebarUser } from '@/components/dashboard/sidebar-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { messages } from '@/config/messages';
import { authClient } from '@/auth/auth-client';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/routes';
import type * as React from 'react';
import { useEffect, useState } from 'react';

const siteName = messages.site.name;

/**
 * Dashboard sidebar
 */
export function DashboardSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link to={Routes.Root} onClick={closeMobileSidebar}>
                  <Logo className="size-5" />
                  <span className="truncate font-semibold text-base">
                    {siteName}
                  </span>
                </Link>
              }
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {!isPending && mounted && <SidebarMain />}
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-4">
        {!isPending && mounted && currentUser && (
          <SidebarUser user={currentUser} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
