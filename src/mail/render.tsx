import React, { type ReactElement } from 'react'
import type { EmailTemplate } from './types'
import ContactMessage from './templates/contact-message'
import ForgotPassword from './templates/forgot-password'
import SubscribeNewsletter from './templates/subscribe-newsletter'
import VerifyEmail from './templates/verify-email'

const EmailTemplates = {
  forgotPassword: ForgotPassword,
  verifyEmail: VerifyEmail,
  subscribeNewsletter: SubscribeNewsletter,
  contactMessage: ContactMessage,
} as const

// Subject line for each template (used by mail provider only)
const subjectByTemplate: Record<EmailTemplate, string> = {
  forgotPassword: 'Reset your password',
  verifyEmail: 'Verify your email',
  subscribeNewsletter: 'Thanks for subscribing',
  contactMessage: 'Contact Message from Website',
}

export async function renderEmailHtml(email: ReactElement): Promise<string> {
  const reactDomServer = (await import('react-dom/server')) as {
    renderToReadableStream?: (element: ReactElement) => Promise<ReadableStream>
    renderToStaticMarkup?: (element: ReactElement) => string
    renderToString?: (element: ReactElement) => string
  }
  if (reactDomServer.renderToReadableStream) {
    const stream = await reactDomServer.renderToReadableStream(email)
    return await new Response(stream).text()
  }
  if (reactDomServer.renderToStaticMarkup) {
    return reactDomServer.renderToStaticMarkup(email)
  }
  if (reactDomServer.renderToString) {
    return reactDomServer.renderToString(email)
  }
  return ''
}

function decodeHtmlEntities(text: string): string {
  return text
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

export function toPlainText(html: string): string {
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return decodeHtmlEntities(stripped)
}

export async function getTemplate({
  template,
  context,
}: {
  template: EmailTemplate
  context: Record<string, unknown>
}) {
  const Component = EmailTemplates[template]
  const email = React.createElement(
    Component as React.ComponentType<Record<string, unknown>>,
    context as Record<string, unknown>
  )
  const html = await renderEmailHtml(email)
  const text = toPlainText(html)
  const subject = subjectByTemplate[template]
  return { html, text, subject }
}
