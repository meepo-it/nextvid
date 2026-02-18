import { serverEnv } from '@/env/server';
import { websiteConfig } from '@/config/website';
import { BeehiivNewsletterProvider } from './provider/beehiiv';
import { ResendNewsletterProvider } from './provider/resend';
import type { NewsletterProvider, NewsletterProviderName } from './types';

export type { NewsletterProviderName } from './types';

type ProviderFactory = () => NewsletterProvider;

/**
 * Registry of newsletter provider factories
 **/
const providerRegistry: Record<NewsletterProviderName, ProviderFactory> = {
  resend: () => {
    const apiKey = serverEnv.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is required for newsletter.');
    return new ResendNewsletterProvider(apiKey);
  },
  beehiiv: () => {
    const apiKey = serverEnv.BEEHIIV_API_KEY;
    const publicationId = serverEnv.BEEHIIV_PUBLICATION_ID;
    if (!apiKey || !publicationId) {
      throw new Error(
        'BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are required for newsletter.'
      );
    }
    return new BeehiivNewsletterProvider(apiKey, publicationId);
  },
};

function createProvider(): NewsletterProvider {
  const config = websiteConfig.newsletter;
  if (!config?.enable || !config?.provider) {
    throw new Error('Newsletter is not enabled or provider not set.');
  }
  const name = config.provider;
  const factory = providerRegistry[name as NewsletterProviderName];
  if (!factory) {
    throw new Error(`Unsupported newsletter provider: ${name}.`);
  }
  return factory();
}

export function getNewsletterProvider(): NewsletterProvider {
  return createProvider();
}

export async function subscribe(email: string): Promise<boolean> {
  const provider = getNewsletterProvider();
  return provider.subscribe({ email });
}

export async function unsubscribe(email: string): Promise<boolean> {
  const provider = getNewsletterProvider();
  return provider.unsubscribe({ email });
}

export async function isSubscribed(email: string): Promise<boolean> {
  const provider = getNewsletterProvider();
  return provider.checkSubscribeStatus({ email });
}
