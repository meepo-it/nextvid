import {
  IconBulb,
  IconCreditCard,
  IconFileUpload,
  IconKey,
  IconLayoutDashboard,
  IconSettings2,
  IconShieldCheck,
  IconUserCircle,
  IconUsers,
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
      title: m.dashboard_sidebar_dashboard(),
      icon: IconLayoutDashboard,
      href: Routes.Dashboard,
      external: false,
    },
    {
      title: m.admin_title(),
      icon: IconShieldCheck,
      authorizeOnly: ['admin'],
      items: [
        {
          title: m.admin_users_title(),
          icon: IconUsers,
          href: Routes.AdminUsers,
          external: false,
        },
        {
          title: m.admin_feature_requests_title(),
          icon: IconBulb,
          href: Routes.AdminFeatureRequests,
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
        {
          title: m.dashboard_sidebar_files(),
          icon: IconFileUpload,
          href: Routes.SettingsFiles,
          external: false,
        },
        {
          title: m.dashboard_sidebar_api_keys(),
          icon: IconKey,
          href: Routes.SettingsApiKeys,
          external: false,
        },
      ],
    },
  ];
}
