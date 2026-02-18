import {
  IconBell,
  IconLayoutDashboard,
  IconLock,
  IconSettings2,
  IconShieldCheck,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { messages } from './messages';

const m = messages.dashboard.sidebar;
const am = messages.dashboard.admin;

/**
 * Dashboard sidebar links
 */
export function getSidebarLinks(): MenuItemConfig[] {
  return [
    {
      title: m.dashboard,
      icon: IconLayoutDashboard,
      href: Routes.Dashboard,
      external: false,
    },
    {
      title: am.title,
      icon: IconShieldCheck,
      items: [
        {
          title: am.users.title,
          icon: IconUsers,
          href: Routes.AdminUsers,
          external: false,
        },
      ],
    },
    {
      title: m.settings,
      icon: IconSettings2,
      items: [
        {
          title: m.profile,
          icon: IconUserCircle,
          href: Routes.SettingsProfile,
          external: false,
        },
        {
          title: m.security,
          icon: IconLock,
          href: Routes.SettingsSecurity,
          external: false,
        },
        {
          title: m.notifications,
          icon: IconBell,
          href: Routes.SettingsNotifications,
          external: false,
        },
      ],
    },
  ];
}
