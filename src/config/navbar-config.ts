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
    links.push({ title: m.nav_pricing(), href: Routes.Pricing, external: false });
  }
  if (websiteConfig.blog?.enable) {
    links.push({ title: m.nav_blog(), href: Routes.Blog, external: false });
  }
  links.push({ title: m.nav_requests_and_roadmap_title(), href: Routes.RequestsAndRoadmap, external: false });
  return links;
}
