# Auth module

Authentication is built on [Better Auth](https://www.better-auth.com/). The server uses D1 (Drizzle) with email verification and password reset (via the Mail module). The client uses `better-auth/react`’s `createAuthClient`, integrated with TanStack Start via `tanstackStartCookies`.

## Directory structure

```
src/auth/
├── auth.ts        # Server: betterAuth instance (DB, email, plugins)
├── auth-client.ts # Client: createAuthClient for components
```

The API route `/api/auth/$` forwards GET/POST to `auth.handler(request)`, which handles login, sign-up, sign-out, session, OAuth, etc.

## Server (auth.ts)

- **baseURL**: From `getBaseUrl()` (Vite’s `VITE_BASE_URL`).
- **database**: `drizzleAdapter(getDb(env.DB), { provider: 'sqlite' })`; D1 is injected via the Worker’s `env.DB`.
- **emailAndPassword**:
  - Email + password enabled.
  - `requireEmailVerification: true`.
  - `sendResetPassword`: calls the Mail module’s `sendEmail({ template: 'forgotPassword', ... })`.
- **emailVerification**:
  - `sendVerificationEmail`: calls `sendEmail({ template: 'verifyEmail', ... })`.
- **user.deleteUser**: User deletion enabled.
- **plugins**: `tanstackStartCookies()` so cookies and session work correctly with TanStack Start on Cloudflare.

All email sending goes through the Mail module; there is no direct dependency on Resend or other providers.

## Client (auth-client.ts)

- `createAuthClient({ baseURL: getBaseUrl() })` exported as `authClient`.
- Typical usage in components:
  - `authClient.useSession()`: current session.
  - `authClient.signIn.email()`, `authClient.signUp.email()`, etc.
  - `authClient.updateUser({ name, image })`: update profile (e.g. avatar).
  - `authClient.signOut()`, listAccounts, etc.

All requests go to `baseURL + /api/auth/*` and are handled by `auth.handler`.

## Session checks for protected APIs

- **require-session** (`src/lib/require-session.ts`):
  - `requireSession(request)`: calls `auth.api.getSession({ headers: request.headers })`, returns session or null.
  - `unauthorizedResponse(message)`: returns 401 JSON.
- APIs that require a logged-in user (e.g. upload) call `const session = await requireSession(request)` first and return `unauthorizedResponse()` when null.

## Configuration and environment

- Auth-related options can be extended in `websiteConfig.auth` (e.g. OAuth toggles).
- **D1**: Configure `d1_databases` in `wrangler.jsonc` with binding name `DB`, matching `env.DB`.
- **Mail**: Verification and password reset depend on the Mail module; configure `RESEND_API_KEY` and `mail.fromEmail` etc.

## Database tables

Table definitions used by Better Auth live in `src/db/auth.schema.ts` (user, session, account, verification, etc.). Migrations and Drizzle usage are described in the [DB module](./db.md).
