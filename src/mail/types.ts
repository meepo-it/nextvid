/**
 * Email template registry and mail types.
 * Template components are imported in index.ts to avoid circular deps.
 */
export type EmailTemplate =
  | 'forgotPassword'
  | 'verifyEmail'
  | 'subscribeNewsletter'
  | 'contactMessage'

export interface SendEmailParams {
  to: string
  subject: string
  text?: string
  html: string
  from?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: unknown
}

export interface SendTemplateParams {
  to: string
  template: EmailTemplate
  context: Record<string, unknown>
}

export interface SendRawEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export interface MailProvider {
  sendTemplate(params: SendTemplateParams): Promise<SendEmailResult>
  sendRawEmail(params: SendRawEmailParams): Promise<SendEmailResult>
  getProviderName(): string
}
