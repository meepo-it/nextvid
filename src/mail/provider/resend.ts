import { websiteConfig } from '@/config/website'
import { getTemplate } from '../render'
import type {
  MailProvider,
  SendEmailResult,
  SendRawEmailParams,
  SendTemplateParams,
} from '@/mail/types'
import { Resend } from 'resend'

/**
 * Options to create Resend provider (API key from env or Cloudflare bindings).
 */
export interface ResendProviderOptions {
  apiKey: string
  from: string
}

/**
 * Resend mail provider implementation.
 * https://resend.com/docs
 */
export class ResendProvider implements MailProvider {
  private resend: Resend
  private from: string

  constructor(options: ResendProviderOptions) {
    const { apiKey, from } = options
    if (!apiKey) {
      throw new Error(
        'Resend API key is required. Set RESEND_API_KEY in env or Cloudflare secrets.'
      )
    }
    if (!from) {
      throw new Error(
        'Default from email is required. Set mail.fromEmail in websiteConfig.'
      )
    }
    this.resend = new Resend(apiKey)
    this.from = from
  }

  getProviderName(): string {
    return 'resend'
  }

  async sendTemplate(params: SendTemplateParams): Promise<SendEmailResult> {
    const { to, template, context } = params
    try {
      const mailTemplate = await getTemplate({ template, context })
      return this.sendRawEmail({
        to,
        subject: mailTemplate.subject,
        html: mailTemplate.html,
        text: mailTemplate.text,
      })
    } catch (error) {
      console.error('Error sending template email:', error)
      return { success: false, error }
    }
  }

  async sendRawEmail(
    params: SendRawEmailParams
  ): Promise<SendEmailResult> {
    const { to, subject, html, text } = params
    if (!this.from || !to || !subject || !html) {
      console.warn('Missing required fields for email send', {
        from: this.from,
        to,
        subject,
        html,
      })
      return { success: false, error: 'Missing required fields' }
    }
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      })
      if (error) {
        console.error('Error sending email', error)
        return { success: false, error }
      }
      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }
  }
}
