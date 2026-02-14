# Newsletter module

The newsletter module provides email subscribe / unsubscribe / status checks. It supports **Resend** and **Beehiiv** as providers, configured via `websiteConfig.newsletter` and env.

## Directory structure

```
src/newsletter/
├── index.ts           # subscribe, unsubscribe, isSubscribed, getNewsletterProvider
├── types.ts           # NewsletterProvider, subscribe/unsubscribe/status param types
├── provider/
│   ├── resend.ts      # Resend implementation
│   └── beehiiv.ts     # Beehiiv implementation
```

## Configuration

- **websiteConfig.newsletter** (`src/config/website.ts`)
  - `enable`: Whether newsletter is enabled.
  - `provider`: `'resend'` | `'beehiiv'`.
  - `autoSubscribeAfterSignUp`: Whether to auto-subscribe after sign-up (call subscribe in the sign-up flow if needed).

- **Environment variables**
  - Resend: `RESEND_API_KEY`.
  - Beehiiv: `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`.

Values are read from `cloudflare:workers` `env` with a fallback to `process.env` for local/testing. Use `.dev.vars` locally and Wrangler secrets in production.

## Core API

- **subscribe(email)**: Subscribe; returns `Promise<boolean>`.
- **unsubscribe(email)**: Unsubscribe; returns `Promise<boolean>`.
- **isSubscribed(email)**: Check subscription status; returns `Promise<boolean>`.
- **getNewsletterProvider()**: Creates and returns the current provider from config and env (internal use).

## Provider interface

`NewsletterProvider` must implement:
- `subscribe({ email })`
- `unsubscribe({ email })`
- `checkSubscribeStatus({ email })`
- `getProviderName()`

To add a provider: add a branch in `createProvider()` in `index.ts` and implement the interface.

## Consumers

- **API routes**
  - `GET /api/newsletter/status?email=...`: calls `isSubscribed(email)`.
  - `POST /api/newsletter/subscribe`: body includes `email`, calls `subscribe(email)`; optionally sends welcome email via the Mail module.
  - `POST /api/newsletter/unsubscribe`: unsubscribe.
- If `autoSubscribeAfterSignUp` is enabled, call `subscribe(user.email)` after successful registration.

## Dependencies

- Resend: Resend API (can share `RESEND_API_KEY` with the Mail module).
- Beehiiv: `@beehiiv/sdk` or equivalent HTTP calls (see `provider/beehiiv.ts`).
