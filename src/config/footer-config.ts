import { Routes } from '@/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';
import { messages } from './messages';

const m = messages.nav;

/**
 * Footer links, grouped by section
 */
export function getFooterLinks(): MenuItemConfig[] {
  const productItems: MenuItemConfig[] = [
    { title: m.features, href: Routes.Features, external: false },
    { title: m.pricing, href: Routes.Pricing, external: false },
  ];

  const resourcesItems: MenuItemConfig[] = [];
  if (websiteConfig.blog?.enable) {
    resourcesItems.push({ title: m.blog, href: Routes.Blog, external: false });
  }

  const companyItems: MenuItemConfig[] = [
    { title: m.about.title, href: Routes.About, external: false },
    { title: m.contact.title, href: Routes.Contact, external: false },
    { title: m.waitlist.title, href: Routes.Waitlist, external: false },
  ];

  const legalItems: MenuItemConfig[] = [
    { title: m.cookiePolicy.title, href: Routes.CookiePolicy, external: false },
    {
      title: m.privacyPolicy.title,
      href: Routes.PrivacyPolicy,
      external: false,
    },
    {
      title: m.termsOfService.title,
      href: Routes.TermsOfService,
      external: false,
    },
  ];

  return [
    { title: m.product, items: productItems },
    { title: m.resources, items: resourcesItems },
    { title: m.company, items: companyItems },
    { title: m.legal, items: legalItems },
  ];
}
