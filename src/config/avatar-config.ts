import { IconCreditCard, IconSettings2, IconVideo } from '@tabler/icons-react';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
import * as m from '@/paraglide/messages.js';

/**
 * Avatar dropdown links
 */
export function getAvatarLinks(): MenuItemConfig[] {
  return [
    {
      title: 'My Creations',
      href: Routes.Creations,
      icon: IconVideo,
    },
    {
      title: m.dashboard_avatar_billing(),
      href: Routes.SettingsBilling,
      icon: IconCreditCard,
    },
    {
      title: m.dashboard_avatar_settings(),
      href: Routes.SettingsProfile,
      icon: IconSettings2,
    },
  ];
}
