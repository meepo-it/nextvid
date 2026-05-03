import { Routes } from '@/lib/routes';
import * as m from '@/paraglide/messages.js';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  const links: MenuItemConfig[] = [];
  if (websiteConfig.payment?.enable) {
    links.push({
      title: m.nav_pricing(),
      href: Routes.Pricing,
      external: false,
    });
  }
  return links;
}
