# Mail module

The mail module handles transactional email (verification, password reset, contact form, subscription welcome, etc.) using **Resend**. It runs in the Cloudflare Worker environment and reads the API key from env.

## Directory structure

```
src/mail/
├── index.ts           # Entry: getMailProvider, sendEmail, getTemplate
├── types.ts           # Template names, SendTemplateParams, MailProvider types
├── render.tsx         # React template rendering to HTML + plain text, getTemplate
├── provider/
│   └── resend.ts      # Resend implementation
├── templates/         # React email templates
│   ├── verify-email.tsx
│   ├── forgot-password.tsx
│   ├── subscribe-newsletter.tsx
│   └── contact-message.tsx
└── components/
    ├── email-layout.tsx
    └── email-button.tsx
```

## Configuration

- **websiteConfig.mail** (`src/config/website.ts`)
  - `provider`: `'resend'`
  - `fromEmail`, `supportEmail`: Sender display name and address

- **Environment / Worker bindings**
  - `RESEND_API_KEY`: Resend API key. Use `.dev.vars` or `process.env` locally, Wrangler secrets in production.

## Core API

- **sendEmail(params)**
  - `SendTemplateParams`: `{ to, template, context }` — renders the template then sends via Resend.
  - `SendRawEmailParams`: `{ to, subject, html, text? }` — sends raw content.
  - Returns `Promise<boolean>` indicating success.

- **getTemplate({ template, context })**
  - Internal: selects the React component by `template`, renders to `{ html, text, subject }` for the provider.

## Templates

- **forgotPassword**: Password reset link; context: `{ url, name }`.
- **verifyEmail**: Email verification link; context: `{ url, name }`.
- **subscribeNewsletter**: Subscription welcome; context: `{ email }`.
- **contactMessage**: Contact form notification; context: `{ name, email, message }`.

To add a template: extend `EmailTemplate` in `types.ts`, register in `EmailTemplates` and `subjectByTemplate` in `render.tsx`, and add the corresponding React template component.

## Consumers

- **Auth** (`src/auth/auth.ts`): Verification and password-reset emails via `sendEmail({ to, template, context })`.
- **API routes**: `/api/contact`, `/api/newsletter/subscribe` call `sendEmail` when needed.

## Dependencies

- `resend`: Resend official SDK.
- React / react-dom/server: Template rendering (`renderToStaticMarkup` or `renderToReadableStream`).
