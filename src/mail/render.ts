import * as m from '@/paraglide/messages.js';
import React, { type ReactElement } from 'react';
import type { EmailTemplate } from './types';
import ContactMessage from './templates/contact-message';
import ForgotPassword from './templates/forgot-password';
import SubscribeNewsletter from './templates/subscribe-newsletter';
import VerifyEmail from './templates/verify-email';
import FeatureRequestStatusUpdate from './templates/feature-request-status-update';
import FeatureRequestRejected from './templates/feature-request-rejected';

const EmailTemplates = {
  forgotPassword: ForgotPassword,
  verifyEmail: VerifyEmail,
  subscribeNewsletter: SubscribeNewsletter,
  contactMessage: ContactMessage,
  featureRequestStatusUpdate: FeatureRequestStatusUpdate,
  featureRequestRejected: FeatureRequestRejected,
} as const;

const EmailSubjects: Record<EmailTemplate, () => string> = {
  forgotPassword: m.mail_forgot_password_subject,
  verifyEmail: m.mail_verify_email_subject,
  subscribeNewsletter: m.mail_subscribe_newsletter_subject,
  contactMessage: m.mail_contact_message_subject,
  featureRequestStatusUpdate: m.mail_feature_request_status_update_subject,
  featureRequestRejected: m.mail_feature_request_rejected_subject,
};

export async function renderEmailHtml(email: ReactElement): Promise<string> {
  const reactDomServer = (await import('react-dom/server')) as {
    renderToReadableStream?: (element: ReactElement) => Promise<ReadableStream>;
    renderToStaticMarkup?: (element: ReactElement) => string;
    renderToString?: (element: ReactElement) => string;
  };
  try {
    if (reactDomServer.renderToReadableStream) {
      const stream = await reactDomServer.renderToReadableStream(email);
      return await new Response(stream).text();
    }
    if (reactDomServer.renderToStaticMarkup) {
      return reactDomServer.renderToStaticMarkup(email);
    }
    if (reactDomServer.renderToString) {
      return reactDomServer.renderToString(email);
    }
  } catch (error) {
    console.error('[mail] Email rendering failed:', error);
    throw error;
  }
  throw new Error('No suitable React DOM server renderer available');
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

export function toPlainText(html: string): string {
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return decodeHtmlEntities(stripped);
}

export async function getTemplate({
  template,
  context,
}: {
  template: EmailTemplate;
  context: Record<string, unknown>;
}) {
  const Component = EmailTemplates[template];
  const email = React.createElement(
    Component as React.ComponentType<Record<string, unknown>>,
    context
  );
  const html = await renderEmailHtml(email);
  const text = toPlainText(html);
  const subject = EmailSubjects[template]();
  return { html, text, subject };
}
