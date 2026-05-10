# AGENTS.md - Agent Coding Guidelines

This document provides guidelines for AI agents working in this codebase.

## Project Overview

This is **NextVid** - a TanStack Start boilerplate for building SaaS applications on Cloudflare Workers. Built with React 19, TanStack Router, TanStack Query, Drizzle ORM, and Better Auth, Content Collections, ShadcnUI, and BaseUI.

## Build Commands

```bash
# Development
pnpm install                # Install dependencies
pnpm dev                    # Start dev server on port 3000
pnpm build                  # Build for production

# Linting & Formatting
pnpm lint                   # Run Biome linter with auto-fix
pnpm check                  # Run Biome linter (check only, no auto-fix)
pnpm format                 # Format code with Biome

# Database
pnpm db:generate            # Generate Drizzle types
pnpm db:push                # Push schema to database
pnpm db:migrate:local       # Run migrations locally
pnpm db:migrate:remote      # Run migrations on remote
pnpm db:studio:local        # Open local DB studio
pnpm db:studio:remote       # Open remote DB studio

# Auth
pnpm auth:schema:generate   # Generate better-auth schema

# Deployment
pnpm deploy                 # Build and deploy to Cloudflare

# Other
pnpm knip                   # Check for unused code/dependencies
pnpm cf-typegen             # Generate Cloudflare types
```

## Code Style

### Formatting (Biome)

- **Indent**: 2 spaces
- **Line width**: 80 characters
- **Quotes**: Single quotes (`'`)
- **Trailing commas**: ES5 style
- **Semicolons**: Always required

### Import Conventions

```typescript
// Use path aliases (@/) for internal imports
import { authClient } from '@/auth/client';
import { getDb } from '@/db';
import { user } from '@/db/auth.schema';

// Order: external → internal → relative
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { MyComponent } from './my-component';
```

### Naming Conventions

- **Files**: kebab-case (e.g., `use-auth.ts`, `data-table.tsx`)
- **Components**: PascalCase (e.g., `DataTable`, `LoginForm`)
- **Hooks**: camelCase with `use` prefix (e.g., `useUserAccounts`, `useAuth`)
- **Utilities**: camelCase (e.g., `cn`, `formatDate`)
- **Constants**: SCREAMING_SNAKE_CASE for config values (e.g., `SORT_FIELD_MAP`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `ListUsersInput`)

### TypeScript Guidelines

- Use explicit types for function parameters and return types
- Prefer `interface` over `type` for object shapes
- Use `zod` for runtime validation (see `src/api/users.ts` for examples)
- Avoid `any` - use `unknown` when type is truly unknown

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Validation with Zod
const listUsersInputSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  search: z.string(),
});
```

### Error Handling

- Use explicit error throwing with descriptive messages
- Handle API errors gracefully with user feedback
- Use try/catch for async operations

```typescript
// Good - explicit error with message
if (!userId) throw new Error('User ID is required');
if ('data' in accounts && Array.isArray(accounts.data))
  return accounts.data;
throw new Error('Failed to fetch user accounts');
```

### React Patterns

- Use TanStack Query (`useQuery`, `useMutation`) for server state
- Use TanStack Router for routing (file-based routing in `src/routes/`)
- Use Zod with `react-hook-form` + `@hookform/resolvers` for forms
- Prefer functional components with hooks

```typescript
// Query keys pattern (recommended)
export const userAccountsKeys = {
  all: ['userAccounts'] as const,
  list: (userId: string) => [...userAccountsKeys.all, 'list', userId] as const,
};

export function useUserAccounts(userId: string | undefined) {
  return useQuery({
    queryKey: userAccountsKeys.list(userId ?? ''),
    queryFn: async () => {
      // query logic
    },
    enabled: !!userId,
  });
}
```

### Server Functions

Use `createServerFn` from `@tanstack/react-start` for API endpoints:

```typescript
import { createServerFn } from '@tanstack/react-start';

export const listUsers = createServerFn({ method: 'GET' })
  .inputValidator(listUsersInputSchema)
  .middleware([adminApiMiddleware])
  .handler(async ({ data }) => {
    // handler logic
  });
```

### Database (Drizzle ORM)

- Schema files in `src/db/` (`auth.schema.ts`, `app.schema.ts`)
- Use `drizzle-orm` queries with proper type safety
- Follow the pattern in `src/api/users.ts` for CRUD operations

### Styling

- Use Tailwind CSS v4 with `@tailwindcss/vite`
- Use `cn()` utility from `src/lib/utils` for conditional classes
- Follow component patterns in `src/components/ui/`

## File Structure

```
src/
├── api/              # Server functions (API endpoints)
├── auth/             # Authentication (better-auth)
├── components/       # React components
│   ├── ui/           # Base UI components (shadcn)
│   └── data-table/   # Data table components
├── db/               # Database schemas and utilities
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── routes/           # TanStack Router routes (file-based)
├── newsletter/       # Newsletter functionality
├── payment/          # Payment integration (Stripe)
└── storage/          # File storage (Cloudflare R2)
```

## Technical Design Stack

- **CSS Framework:** Tailwind CSS v4 with oklch color tokens
- **Component Library:** shadcn/ui (base-nova style) + Base UI React primitives
- **Variant System:** class-variance-authority (CVA) + clsx + tailwind-merge
- **Icons:** Tabler Icons (`@tabler/icons-react`)
- **Animation:** tw-animate-css (minimal, purposeful transitions)
- **Font:** Bricolage Grotesque (400, 500, 600, 700 weights, Latin subset)
- **Dark mode:** Class-based (`.dark` on `<html>`), localStorage-persisted

## Internationalization (i18n)

**完整指南：[`docs/i18n.md`](./docs/i18n.md)。任何 i18n 相关改动必须按该文档执行。**

由 Paraglide JS 驱动，支持 `en` / `zh` / `ja`，messages 在 `messages/*.json`，编译产物在 `src/paraglide/`（不要手改）。

强制规则：

- **禁止硬编码任何用户可见字符串。** 一律通过 `import * as m from '@/paraglide/messages.js'` 调用 `m.my_key()`。
- **新加 key 必须三个 locale 同步加。** key 用 `snake_case`，按业务前缀分组（`nav_` / `auth_` / `pricing_` / `mail_` / `admin_` / ...）。提交前跑 `pnpm exec vitest run src/__tests__/i18n.test.ts` 校验。
- **路由 `head()` 用 `seo(path, { title: m.x(), description: m.y() })`。** 受保护路由的 layout 也必须有 `head()`。新公共页面记得加进 `src/routes/sitemap[.]xml.ts` 的 `publicPaths`，否则 hreflang 会缺。
- **格式化日期 / 数字 / 货币用 `src/lib/formatter.ts` 的 helper**（默认走 `getLocale()`），或者 `new Intl.X(getLocale(), …)`。**禁止硬编码 `'en-US'`。**
- **后台任务 / 异步邮件必须用 `withLocale(recipient.locale ?? getLocale(), () => sendEmail(...))` 包裹**（见 `src/lib/i18n.ts`），不能直接 `sendEmail`，否则所有用户都会收到「管理员当时浏览器语言」的邮件。需要本地化的 status / 枚举标签要在 `withLocale` 闭包内调用对应的 `m.*()` 函数后再传给模板。
- **第三方集成（Stripe）** 已经在 `src/api/payment.ts` 自动注入 `getLocale()`，新加 checkout / portal 调用按现有模式来。
- **locale 切换器** 用 `m.language_name_*` / `m.language_region_*` / `m.locale_switcher_*` 这些 key，不要硬编码语言名。
- **新增 locale** 请严格按 `docs/i18n.md` 的「工作流速查表」走完所有 6 步，否则会漏 sitemap / 切换器 / hreflang / 测试。

## Important Notes

- This project uses Cloudflare Workers - avoid Node.js-specific APIs
- Some files are auto-generated and excluded from linting (see `biome.json`)
- Run `pnpm lint` before committing code
- Database migrations use Drizzle Kit with Wrangler
