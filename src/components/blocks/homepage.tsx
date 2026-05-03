import HeroSection from '@/components/blocks/hero';
import PricingSection from '@/components/blocks/pricing';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <PricingSection />
    </div>
  );
}
