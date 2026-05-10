import { HomePage } from '@/components/blocks/homepage';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { getCanonicalUrl } from '@/lib/urls';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const homeSearchSchema = z.object({
  model: z.string().optional(),
  runid: z.string().optional(),
});

const FAQ_ITEMS = [
  {
    q: 'What is NextVid?',
    a: 'NextVid is an AI video generation platform that brings together top models — Seedance 2.0, Kling v3, Wan 2.7, Veo 3, HappyHorse, and more — in one unified workspace. It supports text, image, and reference video as inputs across four creation modes.',
  },
  {
    q: 'Which AI video models are available?',
    a: 'Currently supported: Seedance 2.0, Kling v3, Wan 2.7, Veo 3, HappyHorse 1.0, Hailuo 2.3, Vidu Q3, and SkyReels v4. New models are added on an ongoing basis.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. You get generation credits upon sign-up to explore the platform — no credit card required.',
  },
  {
    q: 'What resolution and duration are supported?',
    a: 'Output resolution goes up to 4K depending on the model. Duration ranges from 3 to 16 seconds per generation. Aspect ratio, duration, and resolution can all be configured before you generate.',
  },
  {
    q: 'Do I own the videos I generate?',
    a: 'Yes. All generated videos are yours to use for personal or commercial projects. NextVid does not claim any rights over your output.',
  },
];

export const Route = createFileRoute('/')({
  validateSearch: homeSearchSchema,
  head: () => {
    const name = websiteConfig.metadata?.name ?? '';
    const title = websiteConfig.metadata?.title ?? '';
    const description = websiteConfig.metadata?.description ?? '';
    const url = getCanonicalUrl('/');

    const webSiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name,
      description,
      url,
    };

    const softwareJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name,
      description,
      url,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        offerCount: '4',
      },
    };

    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };

    const metadata = seo('/', {
      title,
      description,
      keywords:
        'AI video generator, text to video AI, image to video, Seedance 2.0, Kling v3, Veo 3, Wan 2.7, HappyHorse, AI video models, video generation platform',
    });

    return {
      ...metadata,
      scripts: [
        { type: 'application/ld+json', children: JSON.stringify(webSiteJsonLd) },
        { type: 'application/ld+json', children: JSON.stringify(softwareJsonLd) },
        { type: 'application/ld+json', children: JSON.stringify(faqJsonLd) },
      ],
    };
  },
  component: HomePage,
});
