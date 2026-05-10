/**
 * ApiMart.ai Video Generation Provider
 * https://docs.apimart.ai
 *
 * Standard models share the same endpoint and async pattern:
 *   POST /v1/videos/generations           → { task_id }
 *   GET  /v1/videos/generations/{task_id} → { status, video_url, ... }
 *
 * Remix (Veo 3 video extend) uses a different endpoint:
 *   POST /v1/videos/{source_task_id}/remix → { task_id }
 */

const BASE_URL = 'https://api.apimart.ai/v1';

// ── Request types ─────────────────────────────────────────────────────────────

// ── Wan 2.7 ───────────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/wan2.7/generation
// Modes: T2V (prompt), I2V (image_with_roles first_frame), R2V (image_with_roles reference_image), EDIT (video_urls)

export interface ApimartWan27Request {
  model: 'wan2.7';
  prompt?: string;
  image_urls?: string[];
  image_with_roles?: Array<{ url: string; role: 'first_frame' | 'last_frame' }>;
  video_urls?: string[];
  negative_prompt?: string;
  resolution?: '720P' | '1080P';
  duration?: number; // 2–15
  size?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
}

// ── Wan 2.7 Reference ─────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/wan2.7-r2v/generation

export interface ApimartWan27R2vRequest {
  model: 'wan2.7-r2v';
  prompt: string;
  image_with_roles?: Array<{
    url: string;
    role: 'reference_image' | 'first_frame';
    reference_voice?: string;
  }>;
  video_urls?: string[];
  negative_prompt?: string;
  resolution?: '720P' | '1080P';
  duration?: number; // 2–15 (2–10 with video ref)
  size?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
}

// ── Wan 2.7 Video Edit ────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/wan2.7-videoedit/generation

export interface ApimartWan27VideoEditRequest {
  model: 'wan2.7-videoedit';
  video_urls: string[]; // first item is the video to edit
  prompt?: string;
  negative_prompt?: string;
  image_urls?: string[]; // reference style images, max 4
  resolution?: '720P' | '1080P';
  duration?: number; // 0 = keep original length, 2–10 = trim
  size?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
  metadata?: { audio_setting?: 'auto' | 'origin' };
}

// ── Kling v3 ─────────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/kling-v3/generation
// mode: std=720p, pro=1080p, 4k=4K
// Aspect ratio is limited to 16:9 / 9:16 / 1:1

export interface ApimartKlingV3Request {
  model: 'kling-v3';
  prompt: string;
  negative_prompt?: string;
  mode?: 'std' | 'pro' | '4k';
  duration?: number; // 3–15
  aspect_ratio?: '16:9' | '9:16' | '1:1';
  image_urls?: string[]; // 1–2 images (first/last frame)
  watermark?: boolean;
  audio?: boolean;
}

// ── Seedance 2.0 ──────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/seedance/generation
// 1080p only available for face models

export interface ApimartSeedanceRequest {
  model:
    | 'doubao-seedance-2.0'
    | 'doubao-seedance-2.0-fast'
    | 'doubao-seedance-2.0-face'
    | 'doubao-seedance-2.0-fast-face';
  prompt?: string;
  duration?: number; // 4–15
  size?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9' | 'adaptive';
  resolution?: '480p' | '720p' | '1080p';
  seed?: number;
  generate_audio?: boolean;
  return_last_frame?: boolean;
  image_urls?: string[]; // max 9
  image_with_roles?: Array<{ url: string; role: 'first_frame' | 'last_frame' }>;
  video_urls?: string[]; // max 3, total ≤15s
  audio_urls?: string[];
}

// ── HappyHorse 1.0 ────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/happyhorse-1.0/generation
//
// Mode routing (fields are mutually exclusive except video_url + image_urls for styled EDIT):
//   T2V:  prompt only
//   I2V:  prompt + first_frame_image
//   R2V:  prompt + image_urls (1–9 reference images)
//   EDIT: prompt + video_url (+ 0–5 style refs in image_urls)

export interface ApimartHappyHorseRequest {
  model: 'happyhorse-1.0';
  prompt?: string; // required for T2V/R2V/EDIT; optional but recommended for I2V
  first_frame_image?: string; // I2V: URL or base64 data URI
  image_urls?: string[]; // R2V: 1–9 refs; EDIT: 0–5 style refs
  video_url?: string; // EDIT mode source video (HTTP/HTTPS only)
  audio_setting?: 'auto' | 'origin'; // EDIT mode audio (default: auto)
  resolution?: '720P' | '1080P'; // default: 1080P
  duration?: number; // 3–15 (default: 5)
  size?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4'; // ignored in I2V/EDIT
  watermark?: boolean;
  seed?: number; // 0–2,147,483,647
}

// ── MiniMax Hailuo 2.3 ────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/minimax-hailuo-2.3/generation
//
// Supports T2V and I2V (first_frame_image).
// Constraint: 1080p resolution is only valid when duration = 6.

export interface ApimartMinimaxHailuo23Request {
  model: 'MiniMax-Hailuo-2.3' | 'MiniMax-Hailuo-2.3-Fast';
  prompt: string; // required; max 2000 chars; supports camera movement [指令] syntax
  duration?: 6 | 10; // default: 6
  resolution?: '768p' | '1080p'; // default: 768p; 1080p requires duration = 6
  first_frame_image?: string; // I2V: URL or base64
  prompt_optimizer?: boolean; // default: true
  fast_pretreatment?: boolean; // reduce prompt optimization latency (default: false)
  watermark?: boolean; // default: false
}

// ── Veo 3 (generation) ────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/veo3/generation
//
// Duration is fixed at 8s.
// generation_type: 'frame'     = frame-to-video (image_urls[0] as first frame)
//                  'reference' = reference image mode (up to 3 images in image_urls)
// Video links are valid for 24 hours — save promptly.

export interface ApimartVeo3Request {
  model: 'veo3.1-fast' | 'veo3.1-quality' | 'veo3.1-lite';
  prompt: string;
  duration?: 8; // fixed at 8s
  aspect_ratio?: '16:9' | '9:16';
  generation_type?: 'frame' | 'reference'; // I2V mode selector
  image_urls?: string[]; // max 3; jpg/jpeg/png/webp; max 10MB each
  resolution?: '720p' | '1080p' | '4k'; // default: 720p
  enable_gif?: boolean; // default: false
  official_fallback?: boolean; // default: false
}

// ── Veo 3 Remix (video extend) ────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/veo3/remix
//
// Endpoint: POST /v1/videos/{source_task_id}/remix   (NOT /v1/videos/generations)
// The source_task_id must be from a prior completed Veo3 generation (status = success).
// The model field must match the original video's model.
// Internally we use providerModelName convention "*-remix" to distinguish from generation.

export interface ApimartVeo3RemixRequest {
  model: 'veo3.1-fast' | 'veo3.1-quality';
  prompt: string; // description of the continuation/extended segment
  raw?: boolean; // true = return only the extended portion (default: false)
  aspect_ratio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p' | '4k'; // default: 720p
}

// ── SkyReels v4 ───────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/skyreels-v4/generation
//
// Two mutually exclusive modes for advanced use:
//   I2V mode:   first_frame_image / end_frame_image / mid_frame_images (max 6 keyframes)
//   Omni mode:  ref_images (with @tag in prompt) / ref_videos (max 1)
//
// @tag rules: each tag must start with "@" and appear in prompt text.
// ref_videos type 'reference': overrides duration (max 10s); compatible with ref_images type 'image'
// ref_videos type 'extend': incompatible with ref_images

export interface ApimartSkyReelsV4MidFrame {
  tag: string; // @tag referenced in prompt
  image_url: string;
  time_stamp: -1 | number; // -1 = auto; or 0 < value < duration
}

export interface ApimartSkyReelsV4RefImage {
  tag: string; // @tag referenced in prompt
  type: 'image' | 'grid'; // image: 1–3 urls; grid: exactly 1 url
  image_urls: string[];
  audio_url?: string; // audio file ≤15s
}

export interface ApimartSkyReelsV4RefVideo {
  tag: string; // @tag referenced in prompt
  type: 'reference' | 'extend'; // reference: overrides duration max 10s; extend: cannot use ref_images
  video_url: string; // ≤15s
}

export interface ApimartSkyReelsV4Request {
  model: 'skyreels-v4-fast' | 'skyreels-v4-std';
  prompt: string; // max 1280 tokens; must include @tag when using refs
  duration?: number; // 3–15 (default: 5)
  resolution?: '480p' | '720p' | '1080p'; // default: 1080p
  aspect_ratio?: '16:9' | '4:3' | '1:1' | '9:16' | '3:4'; // default: 16:9
  prompt_optimizer?: boolean; // default: true
  // I2V fields (mutually exclusive with Omni fields)
  first_frame_image?: string; // jpg/jpeg/png/gif/bmp
  end_frame_image?: string;
  mid_frame_images?: ApimartSkyReelsV4MidFrame[];
  // Omni fields (mutually exclusive with I2V fields)
  ref_images?: ApimartSkyReelsV4RefImage[];
  ref_videos?: ApimartSkyReelsV4RefVideo[]; // max 1
}

// ── Vidu Q3 Pro ───────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/vidu-q3-pro/generation
//
// Mode is determined automatically by image count in image_urls:
//   0 images → text-to-video
//   1 image  → image-to-video
//   2 images → first-and-last-frame mode

export interface ApimartViduQ3ProRequest {
  model: 'viduq3-pro' | 'viduq3-turbo';
  prompt: string; // max 2000 chars; required for T2V
  duration?: number; // 1–16 (default: 5)
  resolution?: '540p' | '720p' | '1080p'; // default: 720p
  aspect_ratio?: '16:9' | '9:16' | '4:3' | '3:4' | '1:1';
  image_urls?: string[]; // 0–2 URLs; determines mode
  audio?: boolean; // generate audio (default: true)
  seed?: number; // -1 to 2^32-1
}

// ── Vidu Q3 ───────────────────────────────────────────────────────────────────
// Docs: https://docs.apimart.ai/cn/api-reference/videos/vidu-q3/generation
//
// Reference-to-video model — requires 1–7 reference image_urls.
// viduq3-mix: duration 1–16s, resolution 720p/1080p only
// viduq3:     duration 3–16s, resolution 540p/720p/1080p

export interface ApimartViduQ3Request {
  model: 'viduq3-mix' | 'viduq3';
  prompt: string; // max 5000 chars
  image_urls: string[]; // 1–7 reference images; PNG/JPEG/WebP; min 128×128; ≤50MB each
  duration?: number; // viduq3: 3–16; viduq3-mix: 1–16 (default: 5)
  resolution?: '540p' | '720p' | '1080p'; // viduq3-mix: 720p/1080p only; viduq3: all three
  aspect_ratio?: '16:9' | '9:16' | '4:3' | '3:4' | '1:1';
  seed?: number;
}

// ── Union type ────────────────────────────────────────────────────────────────

export type ApimartRequest =
  | ApimartWan27Request
  | ApimartWan27R2vRequest
  | ApimartWan27VideoEditRequest
  | ApimartKlingV3Request
  | ApimartSeedanceRequest
  | ApimartHappyHorseRequest
  | ApimartMinimaxHailuo23Request
  | ApimartVeo3Request
  | ApimartSkyReelsV4Request
  | ApimartViduQ3ProRequest
  | ApimartViduQ3Request;

// ── Response types ────────────────────────────────────────────────────────────

export interface ApimartSubmitResponse {
  code: number;
  data: Array<{ status: string; task_id: string }>;
}

export interface ApimartTaskResult {
  task_id: string;
  status: 'submitted' | 'running' | 'completed' | 'failed';
  video_url?: string;
  cover_url?: string;
  duration?: number;
  prompt?: string; // final prompt used by provider
  error?: string;
}

export interface ApimartStatusResponse {
  code: number;
  data: ApimartTaskResult;
}

// ── Client ────────────────────────────────────────────────────────────────────

function headers(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

/** Submit a standard video generation job. Returns task_id. */
export async function submitVideoJob(
  apiKey: string,
  request: ApimartRequest
): Promise<string> {
  const res = await fetch(`${BASE_URL}/videos/generations`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ApiMart submit failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as ApimartSubmitResponse;
  const taskId = json.data?.[0]?.task_id;
  if (!taskId) throw new Error('ApiMart: missing task_id in response');
  return taskId;
}

/**
 * Submit a Veo 3 Remix (video extend) job.
 * Uses endpoint: POST /v1/videos/{sourceTaskId}/remix
 * The sourceTaskId must be from a prior completed Veo3 generation.
 */
export async function submitVideoRemix(
  apiKey: string,
  sourceTaskId: string,
  request: ApimartVeo3RemixRequest
): Promise<string> {
  const res = await fetch(`${BASE_URL}/videos/${sourceTaskId}/remix`, {
    method: 'POST',
    headers: headers(apiKey),
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ApiMart remix failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as ApimartSubmitResponse;
  const taskId = json.data?.[0]?.task_id;
  if (!taskId) throw new Error('ApiMart: missing task_id in remix response');
  return taskId;
}

/** Poll a task status. */
export async function getTaskStatus(
  apiKey: string,
  taskId: string
): Promise<ApimartTaskResult> {
  const res = await fetch(`${BASE_URL}/videos/generations/${taskId}`, {
    method: 'GET',
    headers: headers(apiKey),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ApiMart status failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as ApimartStatusResponse;
  return json.data;
}

// ── Resolution / parameter helpers ───────────────────────────────────────────

/** Convert nextvid resolution (720p/1080p) to Wan 2.7 / HappyHorse format (720P/1080P) */
export function toUpperResolution(res: string): '720P' | '1080P' {
  return res === '720p' ? '720P' : '1080P';
}

/** Convert nextvid resolution to Kling mode (std/pro/4k) */
export function toKlingMode(res: string): 'std' | 'pro' | '4k' {
  if (res === '1080p') return 'pro';
  if (res === '4k') return '4k';
  return 'std';
}

/** Normalize aspect ratio to the standard Apimart size string */
export function toAspectRatioParam(
  ar: string
): '16:9' | '9:16' | '1:1' | '4:3' | '3:4' {
  const valid = ['16:9', '9:16', '1:1', '4:3', '3:4'] as const;
  return valid.includes(ar as (typeof valid)[number])
    ? (ar as (typeof valid)[number])
    : '16:9';
}

/** Clamp aspect ratio to only Veo3 / Kling-supported values (16:9 or 9:16) */
export function toWideAspectRatio(ar: string): '16:9' | '9:16' {
  return ar === '9:16' ? '9:16' : '16:9';
}

// Keep the old name as an alias for backward compatibility with existing adapter code
export const toWanResolution = toUpperResolution;
