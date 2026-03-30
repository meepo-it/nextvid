# AGENTS.md - Agent Coding Guidelines

This document provides guidelines for AI agents working in this codebase.

## Project Overview

This is **LetsShip** - a TanStack Start boilerplate for building SaaS applications on Cloudflare Workers. Built with React 19, TanStack Router, TanStack Query, Drizzle ORM, and Better Auth, Content Collections, ShadcnUI, and BaseUI.

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

## Important Notes

- This project uses Cloudflare Workers - avoid Node.js-specific APIs
- Some files are auto-generated and excluded from linting (see `biome.json`)
- Run `pnpm lint` before committing code
- Database migrations use Drizzle Kit with Wrangler
