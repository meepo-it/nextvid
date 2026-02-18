# Newsletter module

Email subscribe / unsubscribe / status, driven by **Resend** or **Beehiiv**. Config via `websiteConfig.newsletter`; env is read from **serverEnv** (`src/env/server.ts`). Add newsletter-related vars there (all optional); Worker/Node populate `process.env` (e.g. `.dev.vars`, Wrangler secrets).

**Consumers:** API routes (`/api/newsletter/subscribe`, `unsubscribe`, `status`), hooks (`use-newsletter`), settings card (`NewsletterFormCard`), marketing block (`NewsletterCard`). Optional welcome email after subscribe is sent by the **Mail** module when `websiteConfig.mail.fromEmail` is set.

---

## Directory structure

**Core module** (`src/newsletter/`):

```
src/newsletter/
├── index.ts           # subscribe, unsubscribe, isSubscribed, getNewsletterProvider; providerRegistry, createProvider
├── types.ts           # NewsletterProviderName, NewsletterProvider, Subscribe/Unsubscribe/CheckStatus params & handler types
└── provider/
    ├── resend.ts      # ResendNewsletterProvider (Resend Audiences contacts)
    └── beehiiv.ts     # BeehiivNewsletterProvider (@beehiiv/sdk)
```

**API routes** (`src/routes/api/newsletter/`): `subscribe.ts`, `unsubscribe.ts`, `status.ts`.

**Client** (outside `src/newsletter/`):
- `src/hooks/use-newsletter.ts` — `useNewsletterStatus`, `useSubscribeNewsletter`, `useUnsubscribeNewsletter`, `newsletterKeys`
- `src/components/settings/notification/newsletter-form-card.tsx` — logged-in user toggle (Switch) in settings
- `src/components/blocks/newsletter-card.tsx` — public email form (e.g. landing page)

---

## Configuration

| Source | Key | Description |
|--------|-----|-------------|
| `websiteConfig.newsletter` | `enable` | Master switch; when false, API returns 400 and UI hides. |
| | `provider` | `'resend'` \| `'beehiiv'`. |
| | `autoSubscribeAfterSignUp` | If true, call `subscribe(user.email)` after sign-up (implement in auth/sign-up flow). |
| `serverEnv` (`src/env/server.ts`) | `RESEND_API_KEY` | Optional; required when provider is `resend` (shared with Mail if used). |
| | `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` | Optional; both required when provider is `beehiiv`. |

Env is defined in `serverEnv` (runtime: `process.env`; Worker vars/secrets populate it).

---

## Core API

| Export | Description |
|--------|-------------|
| **subscribe(email)** | Subscribe email; returns `Promise<boolean>`. |
| **unsubscribe(email)** | Unsubscribe; returns `Promise<boolean>`. |
| **isSubscribed(email)** | Check status; returns `Promise<boolean>`. |
| **getNewsletterProvider()** | Builds provider from config + env (no caching; new instance per call). |

---

## Provider interface

`NewsletterProvider` (`types.ts`) implements:

- `subscribe({ email })` → `Promise<boolean>`
- `unsubscribe({ email })` → `Promise<boolean>`
- `checkSubscribeStatus({ email })` → `Promise<boolean>`
- `getProviderName()` → string

**Resend:** Uses Resend Audiences contacts (`contacts.create` / `contacts.update` / `contacts.get`). Subscribe: create contact with `unsubscribed: false`; on conflict, update to subscribed.

**Beehiiv:** Uses `@beehiiv/sdk` (subscriptions + bulk updates). Subscribe: get by email, reactivate if needed or create; unsubscribe: patch subscription to unsubscribed.

**Adding a provider:** Extend `NewsletterProviderName` in `types.ts`, add provider-specific optional vars to `serverEnv` in `src/env/server.ts`, implement `NewsletterProvider` in `provider/<name>.ts`, and register a factory in `providerRegistry` in `index.ts`.

---

## API routes

| Method | Path | Body / Query | Behavior |
|--------|------|--------------|----------|
| POST | `/api/newsletter/subscribe` | `{ email }` | Validate email → `subscribe(email)` → optional welcome email (Mail module, 3s delay when `mail.fromEmail` set). |
| POST | `/api/newsletter/unsubscribe` | `{ email }` | Validate email → `unsubscribe(email)`. |
| GET | `/api/newsletter/status` | `?email=` | Validate email → `isSubscribed(email)` → `{ success, subscribed }`. |

All return 400 when newsletter is disabled or email invalid; 500 on provider/network errors with `{ success: false, error }`.

---

## UI and hooks

- **use-newsletter** — `useNewsletterStatus(email)` (query), `useSubscribeNewsletter()` / `useUnsubscribeNewsletter()` (mutations). Calls API with `getBaseUrl()` for correct origin. Invalidates status query on subscribe/unsubscribe success.
- **NewsletterFormCard** — Renders only when `newsletter.enable` and user is logged in. Shows Switch bound to subscription status; toggling calls subscribe/unsubscribe and toast.
- **NewsletterCard** — Renders only when `newsletter.enable`. Email input + submit; calls `POST /api/newsletter/subscribe` (relative URL). Uses `messages.newsletter` (title, description, email, placeholderEmail, subscribe, error, thanks, emailInvalid).

---

## Dependencies

- **resend** — Resend SDK (audiences/contacts).
- **@beehiiv/sdk** — Beehiiv API client (when using Beehiiv provider).
