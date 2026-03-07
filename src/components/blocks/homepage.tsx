import HeroSection from '@/components/blocks/hero';
import LogoCloudSection from '@/components/blocks/logo-cloud';
import StatsSection from '@/components/blocks/stats';
import { lazy, Suspense } from 'react';

const Features3Section = lazy(
  () => import('@/components/blocks/features3')
);
const FeaturesSection = lazy(
  () => import('@/components/blocks/features')
);
const CallToActionSection = lazy(
  () => import('@/components/blocks/calltoaction')
);
const Features2Section = lazy(
  () => import('@/components/blocks/features2')
);
const IntegrationSection = lazy(
  () => import('@/components/blocks/integration')
);
const Integration2Section = lazy(
  () => import('@/components/blocks/integration2')
);
const PricingSection = lazy(
  () => import('@/components/blocks/pricing')
);
const FaqSection = lazy(() => import('@/components/blocks/faqs'));
const TestimonialsSection = lazy(
  () => import('@/components/blocks/testimonials')
);
const NewsletterCard = lazy(
  () => import('@/components/blocks/newsletter-card')
);

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <LogoCloudSection />
      <StatsSection />
      <Suspense>
        <Features3Section />
        <FeaturesSection />
        <CallToActionSection />
        <Features2Section />
        <IntegrationSection />
        <Integration2Section />
        <PricingSection />
        <FaqSection />
        <TestimonialsSection />
        <NewsletterCard />
      </Suspense>
    </div>
  );
}
