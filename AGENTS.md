## Project Overview

TanStarter (mkfast-template) is a **TanStack Start** full-stack SaaS boilerplate that runs on **Cloudflare Workers**. It includes auth (Better Auth), payments (Stripe), database (Drizzle ORM + Cloudflare D1), storage (Cloudflare R2), email (Resend), newsletter (Resend / Beehiiv), blog (content-collections), dashboar (ShadcnUI + BaseUI + Tailwind CSS.), and deploy on Cloudflare Workers via wrangler. The app is built with Vite, React 19, TanStack Router, Drizzle ORM (D1), and

## Setup Commands

- Install dependencies: `pnpm install`
- Copy env: copy `.env.local.example` to `.env.local` and fill in values
- Start dev server: `pnpm dev` (Vite on port 3000)
- Lint/format: `pnpm check` (Biome check), `pnpm lint` (check + write), `pnpm format` (format only)
- Deploy: `pnpm run deploy` (build then `wrangler deploy`)

## Build, Database & Tooling

- Build: `pnpm build` (Vite production build)
- Preview: `pnpm preview` (preview production build)
- Generate Cloudflare env types: `pnpm cf-typegen` (run after `pnpm install` via postinstall)
- Auth schema: `pnpm auth:schema:generate` — generates `src/db/auth.schema.ts` from Better Auth
- Drizzle: `pnpm db:generate` (migrations from schema), `pnpm db:push` (push schema to DB), `pnpm db:studio:local` / `pnpm db:studio:remote` (Drizzle Studio), `pnpm db:migrate:local` / `pnpm db:migrate:remote` (apply D1 migrations)
- Email preview: `pnpm email:dev` (React Email dev server on port 3333, templates in `src/mail/templates`)
- Dead code: `pnpm knip`

## Project Structure

- `src/routes/` — TanStack Router file-based routes; do not edit `src/routeTree.gen.ts` (auto-generated)
- `src/components/` — Reusable UI (e.g. `ui/`, blocks, auth, settings, layout)
- `src/lib/` — Shared utilities and helpers
- `src/db/` — Drizzle schema and migrations (Cloudflare D1); `auth.schema.ts` is generated
- `src/auth/` — Better Auth config and API
- `src/payment/`, `src/storage/`, `src/mail/`, `src/newsletter/`, `src/notification/` — Feature modules and providers
- `src/api/` — API route handlers / server logic used by routes
- `src/config/` — App config (website, navbar, footer, sidebar, etc.)
- `src/env/` — Env validation (client/server)
- `src/hooks/`, `src/middlewares/` — React hooks and route middlewares
- `content/` — MDX/blog content for content-collections
- `scripts/` — One-off scripts (e.g. DB name, wrangler parsing)
- `docs/` — Project docs (env, db, storage, auth)
- Config: `wrangler.jsonc` (Cloudflare), `drizzle.config.ts` / `drizzle.config.local.ts`, `biome.json`

## Code Style & Naming

- **Biome** (`biome.json`): two-space indent, **single quotes**, ES5 trailing commas, **semicolons**, line width 80. Use `pnpm check` / `pnpm lint` / `pnpm format` before committing.
- Filenames: **kebab-case** (e.g. `dashboard-sidebar.tsx`). Hooks: **`use-`** prefix (e.g. `use-auth.ts`).
- Prefer **named exports** for utilities and components. Keep server-only logic out of client bundles; use env from `src/env/` (client vs server).
- Styling: Tailwind in `src/styles.css`; avoid scattering magic values; prefer design tokens or shared classes.

## Commit & PR Guidelines

- Use **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.). Keep commits scoped; reference issue IDs in the body.
- Update `.env.local.example` when adding or changing environment variables.
- PRs: short summary, how you tested (commands + result), screenshots for UI, and callouts for config or docs. Run `pnpm check` before pushing; call out breaking changes.

## Configuration & Secrets

- Do not commit `.env` or `.env.local`. Copy `.env.local.example` to `.env.local` and fill in secrets. Production secrets live in the deployment environment (e.g. Cloudflare).
- Use scoped API keys for Stripe, Resend, OAuth, etc. Remove temporary debug logs before merging. See `docs/env.md` for variable reference.
