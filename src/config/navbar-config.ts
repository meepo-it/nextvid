import { Routes } from '@/lib/routes';
import * as m from '@/paraglide/messages.js';
import {
  IconBuilding,
  IconCookie,
  IconFileText,
  IconListCheck,
  IconMail,
  IconMailbox,
  IconRoute,
  IconShieldCheck,
} from '@tabler/icons-react';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  const links: MenuItemConfig[] = [
    { title: m.nav_features(), href: Routes.Features, external: false },
  ];
  if (websiteConfig.payment?.enable) {
    links.push({ title: m.nav_pricing(), href: Routes.Pricing, external: false });
  }
  if (websiteConfig.blog?.enable) {
    links.push({ title: m.nav_blog(), href: Routes.Blog, external: false });
  }
  links.push({
    title: m.nav_pages(),
    items: [
      {
        title: m.nav_about_title(),
        description: m.nav_about_description(),
        href: Routes.About,
        icon: IconBuilding,
        external: false,
      },
      {
        title: m.nav_contact_title(),
        description: m.nav_contact_description(),
        href: Routes.Contact,
        icon: IconMail,
        external: false,
      },
      {
        title: m.nav_waitlist_title(),
        description: m.nav_waitlist_description(),
        href: Routes.Waitlist,
        icon: IconMailbox,
        external: false,
      },
      {
        title: m.nav_changelog_title(),
        description: m.nav_changelog_description(),
        href: Routes.Changelog,
        icon: IconListCheck,
        external: false,
      },
      {
        title: m.nav_roadmap_title(),
        description: m.nav_roadmap_description(),
        href: Routes.Roadmap,
        icon: IconRoute,
        external: false,
      },
      {
        title: m.nav_cookie_policy_title(),
        description: m.nav_cookie_policy_description(),
        href: Routes.CookiePolicy,
        icon: IconCookie,
        external: false,
      },
      {
        title: m.nav_privacy_policy_title(),
        description: m.nav_privacy_policy_description(),
        href: Routes.PrivacyPolicy,
        icon: IconShieldCheck,
        external: false,
      },
      {
        title: m.nav_terms_of_service_title(),
        description: m.nav_terms_of_service_description(),
        href: Routes.TermsOfService,
        icon: IconFileText,
        external: false,
      },
    ],
  });
  return links;
}
