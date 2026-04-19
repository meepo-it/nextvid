import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';
import * as m from '@/paraglide/messages.js';

/**
 * Footer links, grouped by section
 */
export function getFooterLinks(): MenuItemConfig[] {
  const productItems: MenuItemConfig[] = [];
  if (websiteConfig.payment?.enable) {
    productItems.push({
      title: m.nav_pricing(),
      href: Routes.Pricing,
      external: false,
    });
  }
  productItems.push({
    title: m.nav_faq(),
    href: Routes.Faqs,
    external: false,
  });

  const resourcesItems: MenuItemConfig[] = [];
  if (websiteConfig.blog?.enable) {
    resourcesItems.push({ title: m.nav_blog(), href: Routes.Blog, external: false });
  }
  resourcesItems.push({ title: m.nav_requests_and_roadmap_title(), href: Routes.RequestsAndRoadmap, external: false });
  resourcesItems.push({ title: m.promote_title(), href: Routes.PromoteAndEarn, external: false });

  const companyItems: MenuItemConfig[] = [
    { title: m.nav_about_title(), href: Routes.About, external: false },
    { title: m.nav_contact_title(), href: Routes.Contact, external: false },
  ];

  const legalItems: MenuItemConfig[] = [
    { title: m.nav_cookie_policy_title(), href: Routes.CookiePolicy, external: false },
    {
      title: m.nav_privacy_policy_title(),
      href: Routes.PrivacyPolicy,
      external: false,
    },
    {
      title: m.nav_terms_of_service_title(),
      href: Routes.TermsOfService,
      external: false,
    },
  ];

  return [
    { title: m.nav_product(), items: productItems },
    { title: m.nav_resources(), items: resourcesItems },
    { title: m.nav_company(), items: companyItems },
    { title: m.nav_legal(), items: legalItems },
  ];
}
