import FaqSection from '@/components/blocks/faqs';
import PricingV2 from '@/components/blocks/pricing-v2';
import { websiteConfig } from '@/config/website';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/pricing')({
  beforeLoad: () => {
    if (websiteConfig.payment?.enable === false) {
      throw redirect({ to: Routes.Root });
    }
  },
  head: () =>
    seo('/pricing', {
      title: `${m.pricing_title()} | ${websiteConfig.metadata?.name}`,
      description: m.pricing_description(),
    }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div>
      <PricingV2 />
      <FaqSection />
    </div>
  );
}
