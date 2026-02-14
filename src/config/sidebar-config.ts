import {
  IconBell,
  IconLayoutDashboard,
  IconLock,
  IconSettings,
  IconSettings2,
  IconUserCircle,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';

/**
 * Dashboard sidebar links (English only). Icons are Tabler icon components.
 */
export function getSidebarLinks(): MenuItemConfig[] {
  return [
    {
      title: 'Dashboard',
      icon: IconLayoutDashboard,
      href: Routes.Dashboard,
      external: false,
    },
    {
      title: 'Admin',
      icon: IconSettings,
      authorizeOnly: ['admin'],
      items: [
        {
          title: 'Users',
          icon: IconUsersGroup,
          href: Routes.AdminUsers,
          external: false,
        },
      ],
    },
    {
      title: 'Settings',
      icon: IconSettings2,
      items: [
        {
          title: 'Profile',
          icon: IconUserCircle,
          href: Routes.SettingsProfile,
          external: false,
        },
        {
          title: 'Security',
          icon: IconLock,
          href: Routes.SettingsSecurity,
          external: false,
        },
        {
          title: 'Notifications',
          icon: IconBell,
          href: Routes.SettingsNotifications,
          external: false,
        },
      ],
    },
  ];
}
