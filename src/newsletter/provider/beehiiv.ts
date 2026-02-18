import type {
  CheckSubscribeStatusParams,
  NewsletterProvider,
  SubscribeNewsletterParams,
  UnsubscribeNewsletterParams,
} from '@/newsletter/types';
import { BeehiivClient } from '@beehiiv/sdk';

/**
 * Beehiiv newsletter provider
 * https://developers.beehiiv.com/
 */
export class BeehiivNewsletterProvider implements NewsletterProvider {
  private client: BeehiivClient;
  private publicationId: string;

  constructor(apiKey: string, publicationId: string) {
    if (!apiKey) throw new Error('BEEHIIV_API_KEY is required.');
    if (!publicationId) throw new Error('BEEHIIV_PUBLICATION_ID is required.');
    this.client = new BeehiivClient({ token: apiKey });
    this.publicationId = publicationId;
  }

  getProviderName(): string {
    return 'Beehiiv';
  }

  async subscribe({ email }: SubscribeNewsletterParams): Promise<boolean> {
    try {
      const existing = await this.getSubscription(email);
      if (existing) {
        if (existing.status !== 'active') {
          await this.client.bulkSubscriptionUpdates.patchStatus(
            this.publicationId,
            {
              subscription_ids: [existing.id],
              new_status: 'active',
            }
          );
        }
        return true;
      }
      const result = await this.client.subscriptions.create(
        this.publicationId,
        {
          email,
          reactivate_existing: true,
          send_welcome_email: false,
        }
      );
      return !!result.data;
    } catch (error) {
      console.error('Error subscribing to newsletter', error);
      return false;
    }
  }

  async unsubscribe({ email }: UnsubscribeNewsletterParams): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(email);
      if (!subscription) return true;
      await this.client.bulkSubscriptionUpdates.patch(this.publicationId, {
        subscriptions: [
          { subscription_id: subscription.id, unsubscribe: true },
        ],
      });
      return true;
    } catch (error) {
      console.error('Error unsubscribing from newsletter', error);
      return false;
    }
  }

  async checkSubscribeStatus({
    email,
  }: CheckSubscribeStatusParams): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(email);
      return subscription?.status === 'active';
    } catch (error) {
      console.error('Error checking subscribe status', error);
      return false;
    }
  }

  private async getSubscription(email: string) {
    try {
      const result = await this.client.subscriptions.getByEmail(
        this.publicationId,
        email
      );
      return result.data ?? null;
    } catch {
      return null;
    }
  }
}
