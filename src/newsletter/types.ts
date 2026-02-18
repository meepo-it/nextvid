/**
 * Supported newsletter provider names
 * extend when adding new providers (e.g. 'cloudflare')
 **/
export type NewsletterProviderName = 'resend' | 'beehiiv';

export interface SubscribeNewsletterParams {
  email: string;
}

export interface UnsubscribeNewsletterParams {
  email: string;
}

export interface CheckSubscribeStatusParams {
  email: string;
}

export type SubscribeNewsletterHandler = (
  params: SubscribeNewsletterParams
) => Promise<boolean>;

export type UnsubscribeNewsletterHandler = (
  params: UnsubscribeNewsletterParams
) => Promise<boolean>;

export type CheckSubscribeStatusHandler = (
  params: CheckSubscribeStatusParams
) => Promise<boolean>;

export interface NewsletterProvider {
  subscribe: SubscribeNewsletterHandler;
  unsubscribe: UnsubscribeNewsletterHandler;
  checkSubscribeStatus: CheckSubscribeStatusHandler;
  getProviderName(): string;
}
