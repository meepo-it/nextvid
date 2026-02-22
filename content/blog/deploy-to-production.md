---
title: Deploy to Production
description: How to build and deploy your TanStack Starter app to Cloudflare Workers.
date: 2026-02-13
category: Guide
image: https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80
---

Once your app is ready, you can deploy it with a single command.

## Build

Create an optimized production build:

```bash
pnpm build
```

The output goes to `dist/` by default. For Cloudflare, the worker entry and assets live under `dist/server/` and `dist/client/`. The build uses the Cloudflare Vite plugin, so the bundle is ready for Workers.

## Deploy to Cloudflare

If you use the included Wrangler setup:

```bash
pnpm deploy
```

This runs `pnpm build` and then `wrangler deploy`. Configure your account and bindings in `wrangler.jsonc`, and set any required environment variables or secrets with `wrangler secret`.

![img](https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80)

Good luck with your launch.
