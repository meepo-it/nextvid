import {
  IconBuilding,
  IconCookie,
  IconFileText,
  IconMail,
  IconMailbox,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';
import { messages } from './messages';

const m = messages.nav;

/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  const links: MenuItemConfig[] = [
    { title: m.features, href: Routes.Features, external: false },
    { title: m.pricing, href: Routes.Pricing, external: false },
  ];
  if (websiteConfig.blog?.enable) {
    links.push({ title: m.blog, href: Routes.Blog, external: false });
  }
  links.push({
    title: m.pages,
    items: [
      {
        title: m.about.title,
        description: m.about.description,
        href: Routes.About,
        icon: IconBuilding,
        external: false,
      },
      {
        title: m.contact.title,
        description: m.contact.description,
        href: Routes.Contact,
        icon: IconMail,
        external: false,
      },
      {
        title: m.waitlist.title,
        description: m.waitlist.description,
        href: Routes.Waitlist,
        icon: IconMailbox,
        external: false,
      },
      {
        title: m.cookiePolicy.title,
        description: m.cookiePolicy.description,
        href: Routes.CookiePolicy,
        icon: IconCookie,
        external: false,
      },
      {
        title: m.privacyPolicy.title,
        description: m.privacyPolicy.description,
        href: Routes.PrivacyPolicy,
        icon: IconShieldCheck,
        external: false,
      },
      {
        title: m.termsOfService.title,
        description: m.termsOfService.description,
        href: Routes.TermsOfService,
        icon: IconFileText,
        external: false,
      },
    ],
  });
  return links;
}
