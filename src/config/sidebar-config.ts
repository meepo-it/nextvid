import {
  IconChartBar,
  IconCreditCard,
  IconMovie,
  IconReceipt,
  IconSettings2,
  IconShieldCheck,
  IconUserCircle,
  IconUsers,
  IconVideo,
} from '@tabler/icons-react';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
import * as m from '@/paraglide/messages.js';
import { websiteConfig } from './website';

/**
 * Sidebar links
 */
export function getSidebarLinks(): MenuItemConfig[] {
  return [
    {
      title: m.admin_title(),
      icon: IconShieldCheck,
      authorizeOnly: ['admin'],
      items: [
        {
          title: 'Overview',
          icon: IconChartBar,
          href: Routes.AdminOverview,
          external: false,
        },
        {
          title: 'Generations',
          icon: IconMovie,
          href: Routes.AdminGenerations,
          external: false,
        },
        {
          title: m.admin_users_title(),
          icon: IconUsers,
          href: Routes.AdminUsers,
          external: false,
        },
        {
          title: 'Payments',
          icon: IconReceipt,
          href: Routes.AdminPayments,
          external: false,
        },
        {
          title: 'Video Models',
          icon: IconVideo,
          href: Routes.AdminVideoModels,
          external: false,
        },
      ],
    },
    {
      title: m.dashboard_sidebar_settings(),
      icon: IconSettings2,
      items: [
        {
          title: m.dashboard_sidebar_profile(),
          icon: IconUserCircle,
          href: Routes.SettingsProfile,
          external: false,
        },
        ...(websiteConfig.payment?.enable
          ? [
              {
                title: m.dashboard_sidebar_billing(),
                icon: IconCreditCard,
                href: Routes.SettingsBilling,
                external: false,
              },
            ]
          : []),
      ],
    },
  ];
}
