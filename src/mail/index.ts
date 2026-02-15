import { env } from 'cloudflare:workers';
import { websiteConfig } from '@/config/website';
import type {
  MailProvider,
  SendRawEmailParams,
  SendTemplateParams,
} from './types';
import { ResendProvider } from './provider/resend';
import { getTemplate } from './render';

export { getTemplate } from './render';
export type {
  EmailTemplate,
  SendTemplateParams,
  SendRawEmailParams,
} from './types';

let mailProvider: MailProvider | null = null;

export interface MailEnv {
  RESEND_API_KEY?: string;
}

function createProvider(): MailProvider {
  if (websiteConfig.mail?.provider === 'resend') {
    const apiKey =
      (env as MailEnv).RESEND_API_KEY ??
      (typeof process !== 'undefined' && process.env?.RESEND_API_KEY);
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is required.'
      );
    }
    if (!websiteConfig.mail?.fromEmail) {
      throw new Error('mail.fromEmail is required in websiteConfig.');
    }
    return new ResendProvider({
      apiKey,
      from: websiteConfig.mail?.fromEmail,
    });
  }
  throw new Error(`Unsupported mail provider: ${websiteConfig.mail?.provider}`);
}

/**
 * Get the mail provider (lazy-initialized on first use with current request env).
 */
export function getMailProvider(): MailProvider {
  if (!mailProvider) {
    mailProvider = createProvider();
  }
  return mailProvider;
}

/**
 * Send email using the configured mail provider.
 */
export async function sendEmail(
  params: SendTemplateParams | SendRawEmailParams
): Promise<boolean> {
  const provider = getMailProvider();
  if ('template' in params) {
    const result = await provider.sendTemplate(params);
    return result.success;
  }
  const result = await provider.sendRawEmail(params);
  return result.success;
}
