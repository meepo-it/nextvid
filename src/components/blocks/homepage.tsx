import HeroInspire from '@/components/home/hero-inspire';
import ModelLogos from '@/components/home/model-logos';
import VideoShowcase from '@/components/home/video-showcase';
import FeaturesVideoV2 from '@/components/home/features-video-v2';
import HowItWorks from '@/components/home/how-it-works';
import UseCases from '@/components/home/use-cases';
import WhyChoose from '@/components/home/why-choose';
import Faq from '@/components/home/faq';
import PricingV2 from '@/components/blocks/pricing-v2';
import Cta from '@/components/home/cta';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroInspire />
      <ModelLogos />
      <VideoShowcase />
      <FeaturesVideoV2 />
      <HowItWorks />
      <UseCases />
      <WhyChoose />
      <PricingV2 />
      <Faq />
      <Cta />
    </div>
  );
}
