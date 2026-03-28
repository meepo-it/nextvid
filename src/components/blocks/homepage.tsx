import HeroSection from '@/components/blocks/hero';
import PricingSection from '@/components/blocks/pricing';
import TestimonialsSection from '@/components/blocks/testimonials';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <PricingSection />
      <TestimonialsSection />
    </div>
  );
}
