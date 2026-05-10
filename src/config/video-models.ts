// ============================================================
// Video Generation Model & Credit Configuration
// ============================================================
import { computeCreditCost, type ModelCreditCosts } from '@/lib/credit-utils';
export type { ModelCreditCosts } from '@/lib/credit-utils';

export type VideoGenerationType =
  | 'text-to-video'
  | 'image-to-video'
  | 'reference-to-video'
  | 'video-edit';

export type VideoResolution =
  | '480p'
  | '540p'
  | '720p'
  | '768p'
  | '1080p'
  | '4k';
export type VideoAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

/** Provider identifier → maps to env var & apimart.ts logic */
export type VideoProvider = 'apimart' | 'wan' | 'kie';

export interface I18nLabel {
  en: string;
  zh: string;
}

export interface VideoModelConfig {
  /** Unique ID used across the system */
  id: string;
  /** Display name */
  name: I18nLabel;
  /** Which provider(s) can serve this model, ordered by priority */
  providers: VideoProvider[];
  /** The model name sent to each provider (keyed by provider id) */
  providerModelNames: Partial<Record<VideoProvider, string>>;
  supportedTypes: VideoGenerationType[];
  supportedResolutions: VideoResolution[];
  supportedAspectRatios: VideoAspectRatio[];
  supportedDurations: number[];
  defaultResolution: VideoResolution;
  defaultDuration: number;
  defaultAspectRatio: VideoAspectRatio;
  /** Short description for model pages and SEO */
  description: I18nLabel;
  /** Whether this model supports audio/sound generation or preservation */
  supportsAudio: boolean;
  enabled: boolean;
  /** Per-resolution credit costs; mirrors DB seed values. DB is authoritative for billing. */
  creditCosts: ModelCreditCosts;
}

// ── Model registry ────────────────────────────────────────────────────────────

export const VIDEO_MODELS: VideoModelConfig[] = [
  // ── Wan 2.7 ───────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/wan2.7/generation
  {
    id: 'wan2.7',
    name: { en: 'Wan 2.7', zh: '万相 2.7' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'wan2.7' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [2, 5, 10, 15],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Versatile text-to-video and image-to-video model with smooth motion and wide aspect ratio support.',
      zh: '多功能文本/图像生成视频模型，运动流畅，支持多种画面比例。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 7, creditCost720p: 10, creditCost1080p: 15 },
  },
  {
    id: 'wan2.7-r2v',
    name: { en: 'Wan 2.7 Reference', zh: '万相 2.7 参考' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'wan2.7-r2v' },
    supportedTypes: ['reference-to-video'],
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [2, 5, 10, 15],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Generate videos from reference images, preserving style and character appearance with smooth motion.',
      zh: '从参考图像生成视频，保持风格和角色外观，动效流畅。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 7, creditCost720p: 10, creditCost1080p: 15 },
  },
  {
    id: 'wan2.7-videoedit',
    name: { en: 'Wan 2.7 Video Edit', zh: '万相 2.7 视频编辑' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'wan2.7-videoedit' },
    supportedTypes: ['video-edit'],
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [0, 2, 5, 10], // 0 = keep original length
    defaultResolution: '720p',
    defaultDuration: 0,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Edit existing videos with text prompts — change style, add effects, or modify scenes while preserving motion.',
      zh: '通过文本提示编辑现有视频，改变风格、添加效果或修改场景，同时保留原有动态。',
    },
    supportsAudio: true, // preserves original video audio when enabled
    enabled: true,
    creditCosts: { creditCost480p: 7, creditCost720p: 10, creditCost1080p: 15 },
  },

  // ── Kling v3 ──────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/kling-v3/generation
  {
    id: 'kling-v3',
    name: { en: 'Kling v3', zh: 'Kling v3' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'kling-v3' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1'], // 4:3 and 3:4 coerced to 16:9 in adapter
    supportedDurations: [5, 10, 15],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'High-quality cinematic video generation with native audio support, producing vivid scenes with precise motion control.',
      zh: '支持原生音频的高质量电影级视频生成，场景生动，动作控制精准。',
    },
    supportsAudio: true,
    enabled: true,
    creditCosts: { creditCost480p: 7, creditCost720p: 10, creditCost1080p: 16 },
  },

  // ── Seedance 2.0 ──────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/seedance/generation
  {
    id: 'seedance-2.0',
    name: { en: 'Seedance 2.0', zh: 'Seedance 2.0' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'doubao-seedance-2.0' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['480p', '720p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [4, 5, 8, 10, 15],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: "ByteDance's flagship video model delivering cinematic quality with built-in audio synthesis and multi-style support.",
      zh: '字节跳动旗舰视频模型，内置音频合成，支持多种风格，生成电影级画质。',
    },
    supportsAudio: true,
    enabled: true,
    creditCosts: { creditCost480p: 8, creditCost720p: 11, creditCost1080p: 17 },
  },
  {
    id: 'seedance-2.0-fast',
    name: { en: 'Seedance 2.0 Fast', zh: 'Seedance 2.0 极速' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'doubao-seedance-2.0-fast' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['480p', '720p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [4, 5, 8, 10, 15],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: "ByteDance's fast video generation model — same cinematic quality as Seedance 2.0 at significantly higher speed.",
      zh: '字节跳动极速视频模型，与 Seedance 2.0 同等画质，生成速度大幅提升。',
    },
    supportsAudio: true,
    enabled: true,
    creditCosts: { creditCost480p: 5, creditCost720p: 7, creditCost1080p: 11 },
  },
  {
    id: 'seedance-2.0-face',
    name: { en: 'Seedance 2.0 Face', zh: 'Seedance 2.0 面部增强' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'doubao-seedance-2.0-face' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['480p', '720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [4, 5, 8, 10, 15],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Face-enhanced video generation with superior likeness preservation — ideal for portrait and character-driven videos.',
      zh: '面部增强视频生成，人物面部保真度更高，适合人像和角色驱动的视频内容。',
    },
    supportsAudio: true,
    enabled: true,
    creditCosts: { creditCost480p: 8, creditCost720p: 11, creditCost1080p: 17 },
  },

  // ── HappyHorse 1.0 ────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/happyhorse-1.0/generation
  // Supports T2V / I2V / R2V / EDIT. Mode is auto-selected by adapter based on inputs.
  {
    id: 'happyhorse-1.0',
    name: { en: 'HappyHorse 1.0', zh: 'HappyHorse 1.0' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'happyhorse-1.0' },
    supportedTypes: [
      'text-to-video',
      'image-to-video',
      'reference-to-video',
      'video-edit',
    ],
    supportedResolutions: ['720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 10, 15],
    defaultResolution: '1080p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'All-in-one generation model supporting text, image, reference, and video editing in a single unified interface.',
      zh: '全能生成模型，支持文本、图像、参考图和视频编辑，统一界面一键搞定。',
    },
    supportsAudio: true, // EDIT mode preserves audio when audio_setting = 'origin'
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 35, creditCost1080p: 52 },
  },

  // ── MiniMax Hailuo 2.3 ────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/minimax-hailuo-2.3/generation
  // Note: 1080p is only valid when duration = 6 (enforced in adapter).
  {
    id: 'hailuo-2.3',
    name: { en: 'Hailuo 2.3', zh: '海螺 2.3' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'MiniMax-Hailuo-2.3' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['768p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [6, 10],
    defaultResolution: '768p',
    defaultDuration: 6,
    defaultAspectRatio: '16:9',
    description: {
      en: "MiniMax's flagship video model with high-fidelity motion and cinematic 1080p output for polished short clips.",
      zh: 'MiniMax 旗舰视频模型，高保真动态，支持电影级 1080p，适合精品短视频制作。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 8, creditCost1080p: 12 },
  },
  {
    id: 'hailuo-2.3-fast',
    name: { en: 'Hailuo 2.3 Fast', zh: '海螺 2.3 极速' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'MiniMax-Hailuo-2.3-Fast' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['768p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [6, 10],
    defaultResolution: '768p',
    defaultDuration: 6,
    defaultAspectRatio: '16:9',
    description: {
      en: "MiniMax's faster video variant delivering smooth, natural motion at reduced cost for rapid creative iteration.",
      zh: 'MiniMax 极速视频模型，动态自然流畅，成本更低，适合快速创意迭代。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 5, creditCost1080p: 8 },
  },

  // ── Veo 3 ─────────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/veo3/generation
  // Duration is fixed at 8s. Aspect ratio limited to 16:9 / 9:16.
  {
    id: 'veo3-fast',
    name: { en: 'Veo 3 Fast', zh: 'Veo 3 极速' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'veo3.1-fast' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [8],
    defaultResolution: '720p',
    defaultDuration: 8,
    defaultAspectRatio: '16:9',
    description: {
      en: "Google DeepMind's Veo 3 fast mode — generates 8-second videos with strong visual coherence at lower cost.",
      zh: 'Google DeepMind Veo 3 极速版，8 秒视频生成，视觉连贯性强，成本更低。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 2, creditCost1080p: 3 },
  },
  {
    id: 'veo3-quality',
    name: { en: 'Veo 3 Quality', zh: 'Veo 3 高质量' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'veo3.1-quality' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [8],
    defaultResolution: '720p',
    defaultDuration: 8,
    defaultAspectRatio: '16:9',
    description: {
      en: "Google DeepMind's Veo 3 quality mode — maximum visual fidelity and 4K support for premium video production.",
      zh: 'Google DeepMind Veo 3 高质量版，视觉保真度最高，支持 4K，适合高端视频制作。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 4, creditCost1080p: 6 },
  },
  {
    id: 'veo3-lite',
    name: { en: 'Veo 3 Lite', zh: 'Veo 3 轻量' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'veo3.1-lite' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [8],
    defaultResolution: '720p',
    defaultDuration: 8,
    defaultAspectRatio: '16:9',
    description: {
      en: "Google DeepMind's Veo 3 lite mode — efficient 8-second video generation balancing quality and speed.",
      zh: 'Google DeepMind Veo 3 轻量版，高效生成 8 秒视频，兼顾画质与速度。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 2, creditCost1080p: 4 },
  },

  // ── Veo 3 Remix (video extend) ────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/veo3/remix
  // Extends a completed Veo3 video. Requires sourceTaskId of the original generation.
  // providerModelName ends with "-remix" so video-generation.ts routes to submitVideoRemix().
  {
    id: 'veo3-remix-fast',
    name: { en: 'Veo 3 Remix Fast', zh: 'Veo 3 续写 极速' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'veo3.1-fast-remix' },
    supportedTypes: ['video-edit'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [8],
    defaultResolution: '720p',
    defaultDuration: 8,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Extend your Veo 3 videos with AI-guided continuation — fast mode for rapid creative extensions.',
      zh: '使用 AI 引导续写 Veo 3 视频，极速版适合快速扩展创意内容。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 2, creditCost1080p: 3 },
  },
  {
    id: 'veo3-remix-quality',
    name: { en: 'Veo 3 Remix Quality', zh: 'Veo 3 续写 高质量' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'veo3.1-quality-remix' },
    supportedTypes: ['video-edit'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportedAspectRatios: ['16:9', '9:16'],
    supportedDurations: [8],
    defaultResolution: '720p',
    defaultDuration: 8,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Extend your Veo 3 videos with AI-guided continuation — quality mode for seamless, cinematic extensions.',
      zh: '使用 AI 引导续写 Veo 3 视频，高质量版生成无缝电影级延伸片段。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 4, creditCost1080p: 6 },
  },

  // ── SkyReels v4 ───────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/skyreels-v4/generation
  // Supports T2V and I2V (first_frame + optional end_frame). Omni @tag mode
  // requires structured prompt formatting and is not auto-generated.
  {
    id: 'skyreels-v4-fast',
    name: { en: 'SkyReels v4 Fast', zh: 'SkyReels v4 极速' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'skyreels-v4-fast' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['480p', '720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 10, 15],
    defaultResolution: '1080p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Fast infinite-length video generation with consistent scene continuity across extended sequences.',
      zh: '极速无限长度视频生成，长序列场景一致性强。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 7, creditCost720p: 10, creditCost1080p: 15 },
  },
  {
    id: 'skyreels-v4-std',
    name: { en: 'SkyReels v4 Standard', zh: 'SkyReels v4 标准' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'skyreels-v4-std' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['720p', '1080p'], // 480p not supported by this variant
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 10, 15],
    defaultResolution: '1080p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Standard-quality SkyReels v4 with enhanced detail and richer scene complexity for polished outputs.',
      zh: 'SkyReels v4 标准版，细节更丰富，场景复杂度更高，适合精品输出。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 12, creditCost1080p: 18 },
  },

  // ── Vidu Q3 Pro ───────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/vidu-q3-pro/generation
  // Mode auto-selected by adapter: 0 images = T2V, 1 = I2V, 2 = first+last frame.
  {
    id: 'vidu-q3-pro',
    name: { en: 'Vidu Q3 Pro', zh: 'Vidu Q3 Pro' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'viduq3-pro' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['540p', '720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 8, 10, 16],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Top-tier video quality with native audio support and precise motion control across multiple visual styles.',
      zh: 'Vidu Q3 Pro 提供顶级视频质量，支持音频，精准控制多种风格的动态效果。',
    },
    supportsAudio: true,
    enabled: true,
    creditCosts: {
      creditCost480p: 10,
      creditCost720p: 14,
      creditCost1080p: 22,
    },
  },
  {
    id: 'vidu-q3-turbo',
    name: { en: 'Vidu Q3 Turbo', zh: 'Vidu Q3 Turbo' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'viduq3-turbo' },
    supportedTypes: ['text-to-video', 'image-to-video'],
    supportedResolutions: ['540p', '720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 8, 10, 16],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Balances quality and speed with native audio capability — ideal for high-throughput video workflows.',
      zh: 'Vidu Q3 Turbo 兼顾画质与速度，支持音频，适合高吞吐量视频生成场景。',
    },
    supportsAudio: true,
    enabled: true,
    creditCosts: {
      creditCost480p: 10,
      creditCost720p: 12,
      creditCost1080p: 18,
    },
  },

  // ── Vidu Q3 ───────────────────────────────────────────────────────────────
  // Docs: https://docs.apimart.ai/cn/api-reference/videos/vidu-q3/generation
  // Reference-to-video model; requires 1–7 reference images.
  {
    id: 'vidu-q3',
    name: { en: 'Vidu Q3', zh: 'Vidu Q3' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'viduq3' },
    supportedTypes: ['reference-to-video'],
    supportedResolutions: ['540p', '720p', '1080p'],
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 8, 10, 16],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Animate style and subject from 1 to 7 reference images with high consistency and smooth motion.',
      zh: '支持 1-7 张参考图生成视频，高一致性动画化风格与主体，动效流畅。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: {
      creditCost480p: 10,
      creditCost720p: 12,
      creditCost1080p: 18,
    },
  },
  {
    id: 'vidu-q3-mix',
    name: { en: 'Vidu Q3 Mix', zh: 'Vidu Q3 Mix' },
    providers: ['apimart'],
    providerModelNames: { apimart: 'viduq3-mix' },
    supportedTypes: ['reference-to-video'],
    supportedResolutions: ['720p', '1080p'], // viduq3-mix does not support 540p
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3', '3:4'],
    supportedDurations: [3, 5, 8, 10, 16],
    defaultResolution: '720p',
    defaultDuration: 5,
    defaultAspectRatio: '16:9',
    description: {
      en: 'Advanced reference-to-video model combining multiple reference images for complex, multi-subject video generation.',
      zh: '高级参考图生成视频模型，融合多张参考图，支持复杂多主体视频生成。',
    },
    supportsAudio: false,
    enabled: true,
    creditCosts: { creditCost480p: 0, creditCost720p: 12, creditCost1080p: 18 },
  },
];

// ── Credit cost ───────────────────────────────────────────────────────────────
// Wraps computeCreditCost for use in client components that have model data.
// Model.creditCosts mirrors DB seed values; DB is authoritative for actual billing.
export function calculateVideoCost(
  costs: ModelCreditCosts,
  resolution: VideoResolution,
  duration: number
): number {
  return computeCreditCost(costs, resolution, duration);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getModelsForType(
  type: VideoGenerationType
): VideoModelConfig[] {
  return VIDEO_MODELS.filter(
    (m) => m.enabled && m.supportedTypes.includes(type)
  );
}

export function getModelById(id: string): VideoModelConfig | undefined {
  return VIDEO_MODELS.find((m) => m.id === id);
}

// ── UI mode tabs ──────────────────────────────────────────────────────────────

export interface VideoModeTab {
  id: VideoGenerationType;
  label: I18nLabel;
  icon: string;
}

export const VIDEO_MODE_TABS: VideoModeTab[] = [
  {
    id: 'text-to-video',
    label: { en: 'Text/Image to Video', zh: '文本/图像生成视频' },
    icon: 'Type',
  },
  {
    id: 'reference-to-video',
    label: { en: 'Reference to Video', zh: '参考生成视频' },
    icon: 'Image',
  },
  {
    id: 'video-edit',
    label: { en: 'Video Edit', zh: '视频编辑' },
    icon: 'Video',
  },
];
