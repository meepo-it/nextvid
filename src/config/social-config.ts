import { getMailtoUrl } from '@/lib/urls';
import type { MenuItemConfig } from '@/types';
import { IconMailFilled } from '@tabler/icons-react';
import { websiteConfig } from './website';

/**
 * Social links as menu items (title, href, icon). Uses MenuItemConfig.
 */
export function getSocialLinks(): MenuItemConfig[] {
  const social: MenuItemConfig[] = [];

  const supportEmail = getMailtoUrl(websiteConfig.mail?.supportEmail);
  if (supportEmail) {
    social.push({
      title: 'Email',
      href: supportEmail,
      icon: IconMailFilled,
      external: true,
    });
  }
  return social;
}
