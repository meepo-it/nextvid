import {
  IconCreditCard,
  IconLayoutDashboard,
  IconSettings2,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { messages } from './messages';

const m = messages.dashboard.avatar;

/**
 * Avatar dropdown links
 */
export function getAvatarLinks(): MenuItemConfig[] {
  return [
    { title: m.dashboard, href: Routes.Dashboard, icon: IconLayoutDashboard },
    { title: m.billing, href: Routes.SettingsBilling, icon: IconCreditCard },
    { title: m.settings, href: Routes.SettingsProfile, icon: IconSettings2 },
  ];
}
