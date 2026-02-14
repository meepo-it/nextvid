---
title: Deploy to Production
description: How to build and deploy your MkFast app to Cloudflare Pages or other platforms.
date: 2025-02-01
category: Guide
author: Mkdirs
avatar: https://cdn.mksaas.com/images/avatars/mkdirs.png
image: https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80
---

# Deploy to Production

Once your app is ready, you can deploy it with a single command.

## Build

Create an optimized production build:

```bash
pnpm build
```

The output goes to `dist/` by default. For Cloudflare, the worker entry and assets are in `dist/server/` and `dist/client/`.

## Deploy to Cloudflare

If you use the included Wrangler setup:

```bash
pnpm deploy
```

This runs `pnpm build` and then `wrangler deploy`. Make sure you have configured your account and bindings in `wrangler.toml` and environment variables.

## Other platforms

You can also deploy the static client and run the server on Node, or use adapters for Vercel, Netlify, etc. Check the project docs for your target platform.

Good luck with your launch.
