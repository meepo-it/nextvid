/**
 * ApiMart adapter — converts nextvid's internal submit input into
 * the provider-specific request body for each model.
 *
 * Add a new `if` block here when ApiMart adds a new model.
 *
 * Remix note: models whose providerModelName ends with "-remix" return an
 * ApimartVeo3RemixRequest body. The caller (video-generation.ts) detects this
 * suffix and routes to submitVideoRemix() using input.sourceTaskId.
 */

import {
  toWanResolution,
  toKlingMode,
  toAspectRatioParam,
  toUpperResolution,
  toWideAspectRatio,
  type ApimartRequest,
  type ApimartVeo3RemixRequest,
} from '../provider/apimart';
import type { VideoAdapterInput } from './types';

export function apimartAdapter(
  providerModelName: string,
  input: VideoAdapterInput
): ApimartRequest | ApimartVeo3RemixRequest {
  const {
    prompt,
    negativePrompt,
    imageUrl,
    videoUrl,
    mediaUrls,
    resolution,
    duration,
    aspectRatio,
    withAudio,
  } = input;
  const ar = toAspectRatioParam(aspectRatio);

  // ── Wan 2.7 (text/image-to-video) ──────────────────────────────────────────
  if (providerModelName === 'wan2.7') {
    return {
      model: 'wan2.7',
      prompt: prompt ?? '',
      negative_prompt: negativePrompt,
      resolution: toWanResolution(resolution),
      duration,
      size: ar,
      ...(imageUrl
        ? {
            image_with_roles: [{ url: imageUrl, role: 'first_frame' as const }],
          }
        : {}),
      ...(mediaUrls?.length ? { image_urls: mediaUrls } : {}),
    };
  }

  // ── Wan 2.7 Reference (reference-to-video) ──────────────────────────────────
  if (providerModelName === 'wan2.7-r2v') {
    const roles: Array<{
      url: string;
      role: 'reference_image' | 'first_frame';
    }> = [];
    if (imageUrl) roles.push({ url: imageUrl, role: 'first_frame' });
    if (mediaUrls?.length) {
      for (const url of mediaUrls) roles.push({ url, role: 'reference_image' });
    }
    return {
      model: 'wan2.7-r2v',
      prompt: prompt ?? '',
      negative_prompt: negativePrompt,
      image_with_roles: roles.length ? roles : undefined,
      video_urls: videoUrl ? [videoUrl] : undefined,
      resolution: toWanResolution(resolution),
      duration,
      size: ar,
    };
  }

  // ── Wan 2.7 Video Edit ───────────────────────────────────────────────────────
  if (providerModelName === 'wan2.7-videoedit') {
    return {
      model: 'wan2.7-videoedit',
      video_urls: videoUrl ? [videoUrl] : [],
      prompt: prompt ?? '',
      negative_prompt: negativePrompt,
      image_urls: mediaUrls?.length ? mediaUrls : undefined,
      resolution: toWanResolution(resolution),
      duration: duration === 0 ? undefined : duration,
      size: ar,
      metadata: { audio_setting: withAudio ? 'origin' : 'auto' },
    };
  }

  // ── Kling v3 ────────────────────────────────────────────────────────────────
  // Aspect ratio limited to 16:9 / 9:16 / 1:1 — 4:3 and 3:4 fall back to 16:9
  if (providerModelName === 'kling-v3') {
    const images: string[] = [];
    if (imageUrl) images.push(imageUrl);
    if (mediaUrls?.length) images.push(...mediaUrls);
    return {
      model: 'kling-v3',
      prompt: prompt ?? '',
      negative_prompt: negativePrompt,
      mode: toKlingMode(resolution),
      duration,
      aspect_ratio: ar === '4:3' || ar === '3:4' ? '16:9' : ar,
      audio: withAudio ?? false,
      ...(images.length ? { image_urls: images } : {}),
    };
  }

  // ── Seedance 2.0 family ─────────────────────────────────────────────────────
  if (
    providerModelName === 'doubao-seedance-2.0' ||
    providerModelName === 'doubao-seedance-2.0-fast' ||
    providerModelName === 'doubao-seedance-2.0-face' ||
    providerModelName === 'doubao-seedance-2.0-fast-face'
  ) {
    const model = providerModelName as
      | 'doubao-seedance-2.0'
      | 'doubao-seedance-2.0-fast'
      | 'doubao-seedance-2.0-face'
      | 'doubao-seedance-2.0-fast-face';

    const imageWithRoles: Array<{
      url: string;
      role: 'first_frame' | 'last_frame';
    }> = [];
    if (imageUrl) imageWithRoles.push({ url: imageUrl, role: 'first_frame' });

    return {
      model,
      prompt,
      duration,
      size: ar,
      resolution: resolution as '480p' | '720p' | '1080p',
      generate_audio: withAudio ?? false,
      ...(imageWithRoles.length ? { image_with_roles: imageWithRoles } : {}),
      ...(mediaUrls?.length ? { image_urls: mediaUrls } : {}),
      ...(videoUrl ? { video_urls: [videoUrl] } : {}),
    };
  }

  // ── HappyHorse 1.0 ──────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/happyhorse-1.0/generation
  // Mode determined by which media fields are present (see request type for details).
  if (providerModelName === 'happyhorse-1.0') {
    if (videoUrl) {
      return {
        model: 'happyhorse-1.0',
        prompt,
        video_url: videoUrl,
        image_urls: mediaUrls?.length ? mediaUrls : undefined,
        audio_setting: withAudio ? 'origin' : 'auto',
        resolution: toUpperResolution(resolution),
        duration,
      };
    }
    if (imageUrl) {
      return {
        model: 'happyhorse-1.0',
        prompt,
        first_frame_image: imageUrl,
        resolution: toUpperResolution(resolution),
        duration,
      };
    }
    if (mediaUrls?.length) {
      return {
        model: 'happyhorse-1.0',
        prompt,
        image_urls: mediaUrls,
        resolution: toUpperResolution(resolution),
        duration,
        size: ar,
      };
    }
    return {
      model: 'happyhorse-1.0',
      prompt,
      resolution: toUpperResolution(resolution),
      duration,
      size: ar,
    };
  }

  // ── MiniMax Hailuo 2.3 ──────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/minimax-hailuo-2.3/generation
  // Constraint: 1080p is only valid when duration = 6; otherwise falls back to 768p.
  if (
    providerModelName === 'MiniMax-Hailuo-2.3' ||
    providerModelName === 'MiniMax-Hailuo-2.3-Fast'
  ) {
    const model = providerModelName as
      | 'MiniMax-Hailuo-2.3'
      | 'MiniMax-Hailuo-2.3-Fast';
    const resolvedDuration: 6 | 10 = duration === 10 ? 10 : 6;
    const resolvedResolution: '768p' | '1080p' =
      resolution === '1080p' && resolvedDuration === 6 ? '1080p' : '768p';
    return {
      model,
      prompt: prompt ?? '',
      duration: resolvedDuration,
      resolution: resolvedResolution,
      ...(imageUrl ? { first_frame_image: imageUrl } : {}),
    };
  }

  // ── Veo 3 (generation) ──────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/veo3/generation
  // Duration is fixed at 8s. Aspect ratio limited to 16:9 / 9:16.
  if (
    providerModelName === 'veo3.1-fast' ||
    providerModelName === 'veo3.1-quality' ||
    providerModelName === 'veo3.1-lite'
  ) {
    const model = providerModelName as
      | 'veo3.1-fast'
      | 'veo3.1-quality'
      | 'veo3.1-lite';
    const validRes = (['720p', '1080p', '4k'] as const).includes(
      resolution as never
    )
      ? (resolution as '720p' | '1080p' | '4k')
      : '720p';

    let generation_type: 'frame' | 'reference' | undefined;
    let image_urls: string[] | undefined;
    if (imageUrl) {
      generation_type = 'frame';
      image_urls = [imageUrl, ...(mediaUrls ?? [])].slice(0, 3);
    } else if (mediaUrls?.length) {
      generation_type = 'reference';
      image_urls = mediaUrls.slice(0, 3);
    }

    return {
      model,
      prompt: prompt ?? '',
      duration: 8,
      aspect_ratio: toWideAspectRatio(aspectRatio),
      generation_type,
      image_urls,
      resolution: validRes,
    };
  }

  // ── Veo 3 Remix (video extend) ──────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/veo3/remix
  // Convention: providerModelName ends with "-remix" (e.g. "veo3.1-fast-remix").
  // The caller detects this suffix and calls submitVideoRemix() with input.sourceTaskId.
  if (
    providerModelName === 'veo3.1-fast-remix' ||
    providerModelName === 'veo3.1-quality-remix'
  ) {
    const baseModel = providerModelName.replace('-remix', '') as
      | 'veo3.1-fast'
      | 'veo3.1-quality';
    const validRes = (['720p', '1080p', '4k'] as const).includes(
      resolution as never
    )
      ? (resolution as '720p' | '1080p' | '4k')
      : '720p';
    return {
      model: baseModel,
      prompt: prompt ?? '',
      aspect_ratio: toWideAspectRatio(aspectRatio),
      resolution: validRes,
    };
  }

  // ── SkyReels v4 ─────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/skyreels-v4/generation
  // I2V: first_frame_image (imageUrl) + optional end_frame_image (mediaUrls[0]).
  // Omni ref_images/@tag mode requires structured prompt formatting and is not
  // auto-generated here — handled via dedicated UI when needed.
  if (
    providerModelName === 'skyreels-v4-fast' ||
    providerModelName === 'skyreels-v4-std'
  ) {
    const model = providerModelName as 'skyreels-v4-fast' | 'skyreels-v4-std';
    const validRes = (['480p', '720p', '1080p'] as const).includes(
      resolution as never
    )
      ? (resolution as '480p' | '720p' | '1080p')
      : '1080p';
    return {
      model,
      prompt: prompt ?? '',
      duration: Math.min(Math.max(duration, 3), 15),
      resolution: validRes,
      aspect_ratio: ar,
      ...(imageUrl ? { first_frame_image: imageUrl } : {}),
      ...(imageUrl && mediaUrls?.[0] ? { end_frame_image: mediaUrls[0] } : {}),
    };
  }

  // ── Vidu Q3 Pro ─────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/vidu-q3-pro/generation
  // Mode determined by image_urls count: 0 = T2V, 1 = I2V, 2 = first+last frame.
  if (
    providerModelName === 'viduq3-pro' ||
    providerModelName === 'viduq3-turbo'
  ) {
    const model = providerModelName as 'viduq3-pro' | 'viduq3-turbo';
    const validRes = (['540p', '720p', '1080p'] as const).includes(
      resolution as never
    )
      ? (resolution as '540p' | '720p' | '1080p')
      : '720p';
    const imageList: string[] = [];
    if (imageUrl) imageList.push(imageUrl);
    if (mediaUrls?.length)
      imageList.push(...mediaUrls.slice(0, 2 - imageList.length));
    return {
      model,
      prompt: prompt ?? '',
      duration: Math.min(Math.max(duration, 1), 16),
      resolution: validRes,
      aspect_ratio: ar,
      audio: withAudio ?? true,
      ...(imageList.length ? { image_urls: imageList } : {}),
    };
  }

  // ── Vidu Q3 ─────────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/vidu-q3/generation
  // Reference-to-video model — requires 1–7 image_urls.
  // viduq3-mix: 720p/1080p only; viduq3: 540p/720p/1080p.
  if (providerModelName === 'viduq3' || providerModelName === 'viduq3-mix') {
    const model = providerModelName as 'viduq3' | 'viduq3-mix';
    const allowedRes =
      model === 'viduq3-mix' ? ['720p', '1080p'] : ['540p', '720p', '1080p'];
    const validRes = allowedRes.includes(resolution) ? resolution : '720p';
    const minDur = model === 'viduq3' ? 3 : 1;
    const allImages: string[] = [];
    if (imageUrl) allImages.push(imageUrl);
    if (mediaUrls?.length) allImages.push(...mediaUrls);
    return {
      model,
      prompt: prompt ?? '',
      image_urls: allImages,
      duration: Math.min(Math.max(duration, minDur), 16),
      resolution: validRes as '540p' | '720p' | '1080p',
      aspect_ratio: ar,
    };
  }

  throw new Error(`apimartAdapter: unsupported model "${providerModelName}"`);
}
