# Storage module

The storage module provides file upload (and optional delete) using **Cloudflare R2** via the Worker bucket binding. No S3 SDK or third-party storage library is used—only the [Cloudflare R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/). It is used for avatar uploads (Settings → Profile) when enabled.

## Directory structure

```
src/storage/
├── index.ts           # getStorageProvider, uploadFile, deleteFile
├── types.ts           # StorageConfig, StorageProvider, UploadFileResult, errors
├── client.ts          # uploadFileFromBrowser (for client components)
├── get-bucket.ts      # getR2Bucket() from env.FILES
├── config/
│   └── storage-config.ts  # publicUrl from env
└── provider/
    └── r2.ts          # R2Provider (put, delete)
```

## Configuration

- **websiteConfig.storage** (`src/config/website.ts`)
  - `enable`: Whether storage is enabled. When false, the upload API and avatar card are disabled.
  - `provider`: `'r2'`.

- **wrangler.jsonc**
  - `r2_buckets`: Bind the R2 bucket with `binding: "FILES"` (and `bucket_name`). The Worker accesses it as `env.FILES`.

- **Environment** (optional)
  - `STORAGE_PUBLIC_URL`: If set (e.g. custom domain for the bucket), returned file URLs use this base. If unset, files are served via the same-origin route `/api/storage/file?key=...`.

## Core API

- **uploadFile(file, filename, contentType, folder?)** (server)
  - Uploads to R2; returns `Promise<{ url, key }>`. Used by the upload API route.

- **deleteFile(key)** (server)
  - Deletes the object from R2. Available for future use (e.g. avatar cleanup).

- **uploadFileFromBrowser(file, folder?)** (client)
  - Sends a file to `POST /api/storage/upload` via FormData; returns `Promise<{ url, key }>`. Used by the avatar upload card.

## API routes

- **POST /api/storage/upload**
  - Requires session. Validates file size (max 4MB) and type (jpeg, png, webp). Uploads to R2 and returns `{ url, key }`. If `STORAGE_PUBLIC_URL` is not set, `url` is rewritten to the same-origin proxy URL.

- **GET /api/storage/file?key=...**
  - Streams the object from R2. Used when no custom domain is configured. Keys are unguessable (e.g. `avatars/<uuid>.<ext>`).

## Consumers

- **Settings → Profile** (`UpdateAvatarCard`): When `websiteConfig.storage.enable` and `websiteConfig.features.enableUpdateAvatar` are true, the user can upload an avatar; the client calls `uploadFileFromBrowser(file, 'avatars')` then updates `user.image` with the returned URL.

## Constants

- **MAX_FILE_SIZE** (`src/lib/constants.ts`): 4MB limit for uploads.

## Notes

- The R2 bucket is provided by the Worker binding only; no S3-style credentials or endpoint are used.
- For avatar use, the returned URL is stored in `user.image` (Better Auth). There is no separate file-metadata table in this project.
