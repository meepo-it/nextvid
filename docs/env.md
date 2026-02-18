# Environment Variables

The project uses **T3 Env** (`@t3-oss/env-core`) for type-safe validation at build time and runtime:

- **`clientEnv`** (`src/env/client.ts`): Client/build-time only. Variables must be prefixed with `VITE_` and are read from `import.meta.env`.
- **`serverEnv`** (`src/env/server.ts`): Server-only. Read from `process.env` at runtime (Worker vars and secrets are populated into `process.env` when `nodejs_compat_populate_process_env` is enabled).

Rule of thumb: use **`clientEnv`** for build-time configuration; use **`serverEnv`** for runtime configuration (secrets, API keys, etc.). The deployment target is Cloudflare Workers.

---

## 1. Build-time (clientEnv / `import.meta.env`)

Values are read by Vite from `.env*` when you run `vite dev` or `vite build`, inlined into the bundle, and **not** read again at Worker runtime.

### How to set

| Scenario | Where to set |
|----------|---------------|
| Local dev (`pnpm dev`) | **`.env.local`** (or rely on defaults in code) |
| Production build (`pnpm build`) | **`.env.production`** or environment variables in the **build environment** (CI, etc.) |

Only variables prefixed with **`VITE_`** are exposed to app code; others are only available in Vite config.

### Build-time variables (clientEnv)

| Variable | Purpose | Required | Notes |
|----------|---------|----------|--------|
| `VITE_BASE_URL` | Site origin (e.g. for `getBaseUrl()`) | No | Default: `http://localhost:3000` |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics | No | |
| `VITE_CLARITY_PROJECT_ID` | Microsoft Clarity | No | |
| `VITE_PLAUSIBLE_DOMAIN` / `VITE_PLAUSIBLE_SCRIPT` | Plausible Analytics | No | |
| `VITE_UMAMI_WEBSITE_ID` / `VITE_UMAMI_SCRIPT` | Umami Analytics | No | |
| `VITE_DATAFAST_DOMAIN` / `VITE_DATAFAST_WEBSITE_ID` | DataFast Analytics | No | |

Do **not** put `VITE_*` in Wrangler `vars` or `wrangler secret`—they are build-time only, not Worker runtime env.

---

## 2. Runtime (serverEnv / `process.env`)

Read **at Worker request time**. Used for secrets, API keys, and feature configuration.

### How to set

| Scenario | Where to set |
|----------|---------------|
| Local dev (`pnpm dev`) | **`.env.local`** (loaded into `process.env` by the dev process) |
| Cloudflare Workers | **`wrangler secret put <NAME>`** for secrets, or **`vars`** in `wrangler.jsonc` for non-sensitive config |

With `nodejs_compat_populate_process_env` enabled, Worker vars and secrets appear on `process.env`. D1, R2, and other **bindings** are still accessed via `env.DB`, `env.FILES`, etc., and do not go on `process.env`.

### Runtime variables (serverEnv)

| Variable | Purpose | Required | Used by |
|----------|---------|----------|---------|
| `VITE_BASE_URL` | URL schema validation at runtime | Yes (schema) | Same value as build; can be set in build env |
| `BETTER_AUTH_SECRET` | Better Auth session signing | Yes | Auth |
| `GOOGLE_CLIENT_ID` | Google OAuth | No | Auth (when Google login enabled) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | No | Auth |
| `RESEND_API_KEY` | Resend email API | No | Mail, Newsletter (when using Resend) |
| `BEEHIIV_API_KEY` | Beehiiv API | No | Newsletter (when using Beehiiv) |
| `BEEHIIV_PUBLICATION_ID` | Beehiiv publication | No | Newsletter |
| `STORAGE_PUBLIC_URL` | R2 public URL (e.g. custom domain) | No | Storage |

Local: set in **`.env.local`**. Workers: use **`wrangler secret put <NAME>`** for secrets; **vars** in `wrangler.jsonc` for non-sensitive values.

---

## 3. VITE_BASE_URL and getBaseUrl()

`getBaseUrl()` reads from **`clientEnv.VITE_BASE_URL`** (see `src/lib/urls.ts`), i.e. a **build-time** value.

- **Local dev**: Set `VITE_BASE_URL=http://localhost:3000` (or your dev URL) in **`.env.local`**, or omit and use the default.
- **Production**: Set `VITE_BASE_URL=https://your-domain.com` in the **build environment** (e.g. `.env.production` or CI env vars).

You do **not** need to set `VITE_BASE_URL` in Cloudflare Workers **runtime** vars or secrets—it is inlined at build time.

---

## 4. Files and config overview

| File / mechanism | When it applies | Notes |
|------------------|-----------------|--------|
| `.env.local` | When present during `pnpm dev` | Build-time and runtime vars locally; git-ignored |
| `.env.production` | During `pnpm build` | Production build (e.g. `VITE_BASE_URL`); do not commit secrets |
| `wrangler.jsonc` `vars` | Worker runtime | Non-sensitive config; ends up on `process.env` if nodejs compat is on |
| `wrangler secret put <NAME>` | Worker runtime | Secrets; end up on `process.env` |

---

## 5. Storage (R2)

R2 is configured via **bindings** in `wrangler.jsonc` (e.g. `FILES`), not via environment variables. For a custom public URL (e.g. R2 custom domain), set the **runtime** variable **`STORAGE_PUBLIC_URL`** (in `.env.local` or Worker vars/secret); the app reads it via `serverEnv.STORAGE_PUBLIC_URL`.
