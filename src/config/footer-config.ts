import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';
import * as m from '@/paraglide/messages.js';

/**
 * Footer links, grouped by section
 */
const MODEL_FOOTER_ITEMS: MenuItemConfig[] = [
  { title: 'Seedance 2.0', href: '/?model=seedance-2.0', external: false },
  { title: 'Kling v3', href: '/?model=kling-v3', external: false },
  { title: 'HappyHorse 1.0', href: '/?model=happyhorse-1.0', external: false },
  { title: 'Wan 2.7', href: '/?model=wan2.7', external: false },
  { title: 'Hailuo 2.3', href: '/?model=hailuo-2.3', external: false },
  { title: 'Vidu Q3 Pro', href: '/?model=vidu-q3-pro', external: false },
  { title: 'Veo 3 Fast', href: '/?model=veo3-fast', external: false },
  { title: 'SkyReels v4', href: '/?model=skyreels-v4-fast', external: false },
];

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

  const companyItems: MenuItemConfig[] = [
    { title: m.nav_about_title(), href: Routes.About, external: false },
    { title: m.nav_contact_title(), href: Routes.Contact, external: false },
    {
      title: m.nav_cookie_policy_title(),
      href: Routes.CookiePolicy,
      external: false,
    },
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
    { title: 'Models', items: MODEL_FOOTER_ITEMS },
    { title: m.nav_company(), items: companyItems },
  ];
}
