'use client';

import { AuroraText } from '@/components/ui/aurora-text';
import { BlurFade } from '@/components/ui/blur-fade';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import { Spinner } from '@/components/ui/spinner';
import {
  getModelsForType,
  VIDEO_MODE_TABS,
  VIDEO_MODELS,
  type VideoAspectRatio,
  type VideoGenerationType,
  type VideoModelConfig,
  type VideoResolution,
} from '@/config/video-models';
import { computeCreditCost } from '@/lib/credit-utils';
import { useUserCredit, useSubmitVideo } from '@/hooks/use-video';
import { getGenerationById } from '@/api/video-generation';
import { uploadUserFile } from '@/api/user-files';
import { authClient } from '@/auth/client';
import * as m from '@/paraglide/messages.js';
import { cn } from '@/lib/utils';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCloudUpload,
  IconSquareLetterT,
  IconPhoto,
  IconSettings,
  IconSparkles,
  IconVideo,
  IconVolume,
  IconVolumeOff,
  IconX,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ── Constants ─────────────────────────────────────────────────────────────────

const SHORT_LABEL: Record<string, { en: string; zh: string }> = {
  'text-to-video': { en: 'Text / Image', zh: '文本/图像' },
  'reference-to-video': { en: 'Reference', zh: '参考图' },
  'video-edit': { en: 'Video Edit', zh: '视频编辑' },
};

// exact aurora colors from image2gpt: violet → fuchsia → amber
const AURORA_COLORS = [
  'oklch(0.606 0.25 292.717)',
  'oklch(0.667 0.295 322.15)',
  'oklch(0.769 0.188 70.08)',
];

// exact gradient from image2gpt card wrapper (oklab values)
const CARD_BORDER_BG =
  'linear-gradient(to right bottom, oklab(0.702 0.0730911 -0.16777 / 0.4) 0%, oklab(0.74 0.187955 -0.146003 / 0.4) 50%, oklab(0.828 0.0183479 0.188107 / 0.4) 100%)';
// fuchsia-tinted shadow
const CARD_SHADOW =
  'rgb(217 70 239 / 0.12) 0px 20px 25px -5px, rgb(217 70 239 / 0.08) 0px 8px 10px -6px';
// generate button gradient (violet → fuchsia)
const BTN_GRADIENT =
  'linear-gradient(to right, oklch(0.606 0.25 292.717), oklch(0.667 0.295 322.15))';

// ── Inspiration data ──────────────────────────────────────────────────────────

const CDN = 'https://cdn.happyhorsevideo.com/showcase';

const INSPIRATION_ITEMS = [
  {
    id: 1,
    thumbnail: `${CDN}/case_9.jpg`,
    videoSrc: `${CDN}/case_9.mp4`,
    categoryEn: 'Visual Story',
    categoryZh: '视觉故事',
    promptEn: 'Atmospheric narrative footage on demand',
    promptZh: '按需生成氛围化的叙事画面',
  },
  {
    id: 2,
    thumbnail: `${CDN}/cherry-blossom.jpg`,
    videoSrc: `${CDN}/cherry-blossom.mp4`,
    categoryEn: 'Zen Garden',
    categoryZh: '禅意花园',
    promptEn: 'Cherry blossoms drifting through soft cinematic light',
    promptZh: '樱花在柔和的电影光影中飘落',
  },
  {
    id: 3,
    thumbnail: `${CDN}/case_4.jpg`,
    videoSrc: `${CDN}/case_4.mp4`,
    categoryEn: 'Portrait Motion',
    categoryZh: '人像动态',
    promptEn: 'Bring still portraits to life with natural animation',
    promptZh: '让静态人像自然动起来',
  },
  {
    id: 4,
    thumbnail: `${CDN}/case_6.jpg`,
    videoSrc: `${CDN}/case_6.mp4`,
    categoryEn: 'Cinematic Scenes',
    categoryZh: '电影级场景',
    promptEn: 'Movie-quality storytelling from a single prompt',
    promptZh: '一句提示词即得电影级叙事画面',
  },
  {
    id: 5,
    thumbnail: `${CDN}/case_3.jpg`,
    videoSrc: `${CDN}/case_3.mp4`,
    categoryEn: 'Dynamic Action',
    categoryZh: '动感动作',
    promptEn: 'Fluid motion and cinematic camera work',
    promptZh: '流畅的运动与电影级运镜',
  },
  {
    id: 6,
    thumbnail: `${CDN}/case_5.jpg`,
    videoSrc: `${CDN}/case_5.mp4`,
    categoryEn: 'Creative Worlds',
    categoryZh: '创意世界',
    promptEn: 'Imagined scenes rendered in stunning detail',
    promptZh: '想象中的场景，细节惊艳地呈现',
  },
];

// ── Helper: tab icon ──────────────────────────────────────────────────────────

function getTabIcon(iconName: string, cls = 'size-3.5') {
  if (iconName === 'Type') return <IconSquareLetterT className={cls} />;
  if (iconName === 'Image') return <IconPhoto className={cls} />;
  if (iconName === 'Video') return <IconVideo className={cls} />;
  return null;
}

// ── Aspect ratio visual box ───────────────────────────────────────────────────

function AspectBox({ ratio, active }: { ratio: string; active: boolean }) {
  const dims: Record<string, { w: number; h: number }> = {
    '16:9': { w: 17, h: 10 },
    '9:16': { w: 10, h: 17 },
    '1:1': { w: 14, h: 14 },
    '4:3': { w: 16, h: 12 },
    '3:4': { w: 12, h: 16 },
  };
  const s = dims[ratio] ?? { w: 14, h: 14 };
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-[2px] border-[1.5px]',
        active ? 'border-violet-500' : 'border-current'
      )}
      style={{ width: s.w, height: s.h }}
    />
  );
}

// ── Shared pill style (violet theme) ─────────────────────────────────────────

function pill(active: boolean) {
  return cn(
    'inline-flex items-center justify-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer',
    active
      ? 'border-violet-400/60 bg-violet-500/[0.07] text-violet-600 dark:text-violet-400'
      : 'border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground'
  );
}

// ── Tab design variants (3 × Style-A) ───────────────────────────────────────

interface TabProps {
  mode: VideoGenerationType;
  onChange: (m: VideoGenerationType) => void;
  isZh: boolean;
}

// A1 · White active + gradient text (no gradient bg)
function TabVariantA1({ mode, onChange, isZh }: TabProps) {
  return (
    <div className="inline-flex rounded-[12px] border border-border/40 bg-muted/60 p-1 gap-0.5">
      {VIDEO_MODE_TABS.map((tab) => {
        const label = SHORT_LABEL[tab.id]?.[isZh ? 'zh' : 'en'] ?? tab.label.en;
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id as VideoGenerationType)}
            className={cn(
              'flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-sm font-bold transition-all',
              isActive
                ? 'bg-white dark:bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {/* icon — gradient color when active */}
            <span
              className={cn(isActive ? '' : 'text-muted-foreground')}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, oklch(0.606 0.25 292.717), oklch(0.667 0.295 322.15))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }
                  : undefined
              }
            >
              {getTabIcon(tab.icon)}
            </span>
            {/* label — gradient text when active */}
            <span
              className={cn(isActive ? '' : 'text-muted-foreground')}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, oklch(0.606 0.25 292.717), oklch(0.667 0.295 322.15))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }
                  : undefined
              }
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// A2 · White Elevated + Violet Shadow — active pill lifts out with colored glow
function TabVariantA2({ mode, onChange, isZh }: TabProps) {
  return (
    <div
      className="inline-flex rounded-2xl p-1.5 gap-1"
      style={{ background: 'oklch(0.88 0.02 292 / 0.55)' }}
    >
      {VIDEO_MODE_TABS.map((tab) => {
        const label = SHORT_LABEL[tab.id]?.[isZh ? 'zh' : 'en'] ?? tab.label.en;
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id as VideoGenerationType)}
            className={cn(
              'flex items-center gap-1.5 rounded-[11px] px-5 py-2.5 text-sm font-bold transition-all',
              isActive
                ? 'text-violet-700 dark:text-violet-300'
                : 'text-muted-foreground hover:text-foreground'
            )}
            style={
              isActive
                ? {
                    background:
                      'linear-gradient(145deg, #ffffff 60%, oklch(0.95 0.04 292))',
                    boxShadow:
                      '0 3px 16px -2px rgb(139 92 246 / 0.65), 0 1px 6px -1px rgb(139 92 246 / 0.35)',
                  }
                : undefined
            }
          >
            {getTabIcon(tab.icon)}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// A3 · Violet-Tinted Container — inverted: purple bg, white active card
function TabVariantA3({ mode, onChange, isZh }: TabProps) {
  return (
    <div
      className="inline-flex rounded-[12px] p-1 gap-0.5"
      style={{
        background:
          'linear-gradient(135deg, oklch(0.606 0.25 292.717 / 0.12), oklch(0.667 0.295 322.15 / 0.12))',
        border: '1px solid oklch(0.606 0.25 292.717 / 0.2)',
      }}
    >
      {VIDEO_MODE_TABS.map((tab) => {
        const label = SHORT_LABEL[tab.id]?.[isZh ? 'zh' : 'en'] ?? tab.label.en;
        const isActive = mode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id as VideoGenerationType)}
            className={cn(
              'flex items-center gap-1.5 rounded-[9px] px-4 py-2 text-sm font-bold transition-all',
              isActive
                ? 'bg-white dark:bg-background text-violet-700 dark:text-violet-300 shadow-sm'
                : 'text-violet-500/70 dark:text-violet-400/60 hover:text-violet-600 dark:hover:text-violet-300'
            )}
          >
            {getTabIcon(tab.icon)}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Mode tab selector ─────────────────────────────────────────────────────────

function TabDesignPicker({ mode, onChange, isZh }: TabProps) {
  return (
    <div className="mb-6">
      <TabVariantA1 mode={mode} onChange={onChange} isZh={isZh} />
    </div>
  );
}

// ── Featured Inspiration panel (autoplay video + auto-advance) ────────────────

function InspirationPanel({ isZh }: { isZh: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const total = INSPIRATION_ITEMS.length;
  const active = INSPIRATION_ITEMS[activeIdx];
  const thumbIdxs = Array.from(
    { length: 4 },
    (_, i) => (activeIdx + i) % total
  );

  // advance only when video ends naturally; click overrides immediately
  const advance = useCallback(() => {
    setActiveIdx((i) => (i + 1) % total);
  }, [total]);

  const go = useCallback(
    (dir: 1 | -1) => setActiveIdx((i) => (i + dir + total) % total),
    [total]
  );

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-base font-semibold text-foreground">
          <IconSparkles className="size-4 text-violet-500" />
          {isZh ? '看看 AI 能做什么' : "See What's Possible"}
        </p>
        <span className="select-none text-sm text-muted-foreground">
          {activeIdx + 1} / {total}
        </span>
      </div>

      {/* Main featured video — autoplay, fills remaining height */}
      <div className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
        {/* Blurred background fill */}
        <img
          key={`bg-${active.id}`}
          src={active.thumbnail}
          aria-hidden
          className="absolute inset-0 size-full scale-110 object-cover blur-2xl opacity-70"
        />
        <div className="absolute inset-0 bg-black/25" />

        <video
          key={active.id}
          src={active.videoSrc}
          poster={active.thumbnail}
          autoPlay
          muted={muted}
          playsInline
          onEnded={advance}
          className="absolute inset-0 size-full object-contain"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Bottom label */}
        <div className="absolute bottom-3 left-3">
          <p className="text-sm font-semibold text-white drop-shadow">
            {isZh ? active.categoryZh : active.categoryEn}
          </p>
        </div>

        {/* Mute toggle */}
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
        >
          {muted ? (
            <IconVolumeOff className="size-4" />
          ) : (
            <IconVolume className="size-4" />
          )}
        </button>

        {/* Prev / Next arrows */}
        {(['left', 'right'] as const).map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => go(side === 'left' ? -1 : 1)}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 transition-all group-hover:opacity-100 hover:bg-black/60',
              side === 'left' ? 'left-2' : 'right-2'
            )}
          >
            {side === 'left' ? (
              <IconChevronLeft className="size-4" />
            ) : (
              <IconChevronRight className="size-4" />
            )}
          </button>
        ))}
      </div>

      {/* Thumbnail strip — floating arrows */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-0 top-[52px] z-10 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-violet-300/60 hover:text-violet-500"
        >
          <IconChevronLeft className="size-4" />
        </button>

        <div className="grid grid-cols-4 gap-2.5">
          {thumbIdxs.map((idx, i) => {
            const item = INSPIRATION_ITEMS[idx];
            const isActive = i === 0;
            return (
              <div
                key={item.id}
                onClick={() => setActiveIdx(idx)}
                className="flex cursor-pointer flex-col gap-1.5"
              >
                <div
                  className={cn(
                    'relative h-[104px] overflow-hidden rounded-xl ring-2 transition-all',
                    isActive
                      ? 'ring-violet-500'
                      : 'ring-transparent hover:ring-violet-300/40'
                  )}
                >
                  <img
                    src={item.thumbnail}
                    alt={isZh ? item.categoryZh : item.categoryEn}
                    className="size-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  {isActive && (
                    <div className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-violet-500 shadow-md">
                      <IconCheck
                        className="size-3 text-white"
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    'truncate text-center text-[13px] font-semibold leading-tight',
                    isActive ? 'text-violet-500' : 'text-muted-foreground'
                  )}
                >
                  {isZh ? item.categoryZh : item.categoryEn}
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-0 top-[52px] z-10 flex size-7 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-violet-300/60 hover:text-violet-500"
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeroInspire() {
  const navigate = useNavigate();
  const { model: modelParam, runid: runId } = useSearch({ from: '/' });
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  const [mode, setMode] = useState<VideoGenerationType>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const availableModels = useMemo(() => getModelsForType(mode), [mode]);
  const [selectedModelId, setSelectedModelId] = useState<string>(
    () => getModelsForType('text-to-video')[0]?.id ?? ''
  );
  const currentModel: VideoModelConfig | undefined = useMemo(
    () =>
      availableModels.find((mdl) => mdl.id === selectedModelId) ??
      availableModels[0],
    [availableModels, selectedModelId]
  );
  const [resolution, setResolution] = useState<VideoResolution>(
    currentModel?.defaultResolution ?? '720p'
  );
  const [duration, setDuration] = useState<number>(
    currentModel?.defaultDuration ?? 5
  );
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(
    currentModel?.defaultAspectRatio ?? '16:9'
  );
  const [withAudio, setWithAudio] = useState(false);

  const { data: creditData } = useUserCredit();
  const balance = creditData?.credits;
  const cost = currentModel
    ? computeCreditCost(currentModel.creditCosts, resolution, duration)
    : 0;
  const submitMutation = useSubmitVideo();

  // Model dropdown
  const [modelOpen, setModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!modelOpen) return;
    const h = (e: MouseEvent) => {
      if (!modelRef.current?.contains(e.target as Node)) setModelOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [modelOpen]);

  // Sync model on mode switch
  useEffect(() => {
    const first = availableModels[0];
    if (first && !availableModels.find((mdl) => mdl.id === selectedModelId)) {
      setSelectedModelId(first.id);
      setResolution(first.defaultResolution);
      setDuration(first.defaultDuration);
      setAspectRatio(first.defaultAspectRatio);
    }
  }, [availableModels, selectedModelId]);

  useEffect(() => {
    if (!currentModel?.supportsAudio) setWithAudio(false);
  }, [currentModel]);

  // Pre-select model from URL ?model= param
  useEffect(() => {
    if (!modelParam) return;
    const target = VIDEO_MODELS.find((m) => m.id === modelParam && m.enabled);
    if (!target) return;
    const firstType = target.supportedTypes[0];
    if (firstType && firstType !== mode) setMode(firstType);
    setSelectedModelId(target.id);
    setResolution(target.defaultResolution);
    setDuration(target.defaultDuration);
    setAspectRatio(target.defaultAspectRatio);
    // Scroll into view after a short delay for paint
    setTimeout(() => {
      document
        .getElementById('hero-editor')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    // Only run when modelParam changes, not on every mode/state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelParam]);

  // Load a previous generation as template (?runid=<id>)
  useEffect(() => {
    if (!runId || !userId) return;
    getGenerationById({ data: { id: runId } })
      .then((record) => {
        if (!record) return;
        const target = VIDEO_MODELS.find((mdl) => mdl.id === record.model && mdl.enabled);
        const newMode = (record.type as VideoGenerationType) ?? 'text-to-video';
        setMode(newMode);
        if (target) {
          setSelectedModelId(target.id);
          setResolution((record.resolution as VideoResolution) ?? target.defaultResolution);
          setDuration(record.duration ?? target.defaultDuration);
          setAspectRatio((record.aspectRatio as VideoAspectRatio) ?? target.defaultAspectRatio);
        }
        if (record.prompt) setPrompt(record.prompt);
        if (record.imageUrl) {
          setImageUrl(record.imageUrl);
          setImagePreview(record.imageUrl);
        }
        setTimeout(() => {
          document.getElementById('hero-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, userId]);

  const handleModeChange = useCallback((newMode: VideoGenerationType) => {
    setMode(newMode);
    setImageUrl(undefined);
    setImagePreview(null);
    const first = getModelsForType(newMode)[0];
    if (first) {
      setSelectedModelId(first.id);
      setResolution(first.defaultResolution);
      setDuration(first.defaultDuration);
      setAspectRatio(first.defaultAspectRatio);
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'video-images');
      const result = await uploadUserFile({ data: form });
      setImageUrl(result.url);
    } catch {
      toast.error('Upload failed');
      setImageUrl(undefined);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f?.type.startsWith('image/')) handleImageUpload(f);
    },
    [handleImageUpload]
  );

  const canSubmit =
    prompt.trim().length > 0 &&
    !submitMutation.isPending &&
    !uploadingImage &&
    availableModels.length > 0 &&
    (mode !== 'reference-to-video' || !!imageUrl) &&
    (balance === undefined || balance >= cost);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || (mode === 'reference-to-video' && !imageUrl)) return;
    if (balance !== undefined && balance < cost) {
      toast.error(m.video_credits_insufficient());
      return;
    }
    submitMutation.mutate(
      {
        type: mode,
        modelId: currentModel?.id ?? '',
        prompt: prompt.trim(),
        imageUrl,
        resolution,
        duration,
        aspectRatio,
        withAudio: currentModel?.supportsAudio ? withAudio : undefined,
      },
      {
        onSuccess: (r) =>
          navigate({ to: '/creations/$id', params: { id: r.videoId } }),
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Generation failed';
          toast.error(
            msg === 'insufficient_credits'
              ? m.video_credits_insufficient()
              : msg
          );
        },
      }
    );
  }, [
    prompt,
    mode,
    imageUrl,
    resolution,
    duration,
    aspectRatio,
    withAudio,
    balance,
    cost,
    currentModel,
    submitMutation,
    navigate,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (canSubmit && userId) handleSubmit();
      }
    },
    [canSubmit, userId, handleSubmit]
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section
      className="relative -mt-[64px] overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 50% 0%, oklch(0.88 0.06 292 / 0.35) 0%, transparent 70%)',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-4 pt-[64px]">
        {/* ── Hero headline ── */}
        <BlurFade delay={0.06} direction="up" blur="10px">
          <div className="pb-10 pt-14 text-center sm:pb-11 sm:pt-16">
            <h1
              className="text-foreground"
              style={{
                fontSize: 'clamp(36px,5vw,60px)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.025em',
              }}
            >
              {isZh ? '最前沿的 AI 视频模型合集，' : 'The most advanced AI video models —'}
              <br />
              <AuroraText
                colors={AURORA_COLORS}
                speed={2.5}
                className="font-extrabold"
              >
                {isZh ? '全在一个工作台。' : 'all in one workspace.'}
              </AuroraText>
            </h1>

            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              {isZh
                ? 'Seedance 2.0、Kling v3、万相 2.7、Veo 3 — 顶级模型全部直连，即开即用。'
                : 'Seedance 2.0 · Kling v3 · Wan 2.7 · Veo 3 — every top model, zero setup.'}
            </p>

            {/* CTA button — image2gpt style: border-2 + gradient text + hover effects */}
            <div className="mt-7 flex flex-col items-center gap-4">
              {userId ? (
                <button
                  type="button"
                  onClick={() => textareaRef.current?.focus()}
                  className="group relative inline-flex items-center gap-2.5 rounded-full border-2 border-border bg-background px-8 py-3.5 text-base font-bold tracking-tight transition-all hover:-translate-y-0.5 active:translate-y-0 hover:border-fuchsia-300/70 hover:shadow-[0_6px_24px_-6px_rgb(217_70_239/0.3)]"
                >
                  <span className="text-sm opacity-80 transition-opacity group-hover:opacity-100">
                    ▶
                  </span>
                  <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
                    {isZh ? '立即开始创作' : 'Start creating now'}
                  </span>
                </button>
              ) : (
                <LoginWrapper mode="modal" asChild>
                  <button
                    type="button"
                    className="group relative inline-flex items-center gap-2.5 rounded-full border-2 border-border bg-background px-8 py-3.5 text-base font-bold tracking-tight transition-all hover:-translate-y-0.5 active:translate-y-0 hover:border-fuchsia-300/70 hover:shadow-[0_6px_24px_-6px_rgb(217_70_239/0.3)]"
                  >
                    <span className="text-sm opacity-80 transition-opacity group-hover:opacity-100">
                      ▶
                    </span>
                    <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
                      {isZh ? '免费积分起步' : 'Try with free credits'}
                    </span>
                  </button>
                </LoginWrapper>
              )}

              <div className="flex items-center gap-5 text-sm text-muted-foreground">
                {(isZh
                  ? ['免费积分起步', '最高 1080p', '无水印']
                  : ['Free credits to start', 'Up to 1080p', 'No watermarks']
                ).map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <IconCheck className="size-3.5 text-violet-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </BlurFade>

        {/* ── Widget card — gradient border wrapper (exact image2gpt values) ── */}
        <BlurFade delay={0.2} direction="up" blur="6px">
          <div
            id="hero-editor"
            className="mb-10 rounded-[22px] p-[1.5px]"
            style={{ background: CARD_BORDER_BG, boxShadow: CARD_SHADOW }}
          >
            <div className="overflow-hidden rounded-[21px] bg-background">
              <div className="grid grid-cols-1 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                {/* ══ LEFT: Generation form ══ */}
                <div className="flex flex-col p-7">
                  {/* § Mode tab picker — 5 design variants for user to choose */}
                  <TabDesignPicker
                    mode={mode}
                    onChange={handleModeChange}
                    isZh={isZh}
                  />

                  {/* § Prompt */}
                  <div className="mb-6">
                    <label className="text-base font-semibold text-foreground">
                      {isZh ? '描述你的创意' : 'Describe your idea'}{' '}
                      <span className="font-normal text-muted-foreground">
                        (Prompt)
                      </span>
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isZh
                        ? '描述越具体，AI 越能理解你的想法'
                        : 'Be specific so AI better understands your idea'}
                    </p>
                    <div className="relative mt-2.5">
                      <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => {
                          if (e.target.value.length <= 1500)
                            setPrompt(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          isZh
                            ? '描述你想要生成的视频...'
                            : 'Describe the video you want to create...'
                        }
                        disabled={submitMutation.isPending}
                        rows={4}
                        className="w-full resize-none rounded-[10px] border border-border bg-background pb-9 pl-3.5 pr-3.5 pt-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className="absolute bottom-2.5 right-3 select-none text-[12px] tabular-nums text-muted-foreground/50">
                        {prompt.length}/1500
                      </span>
                    </div>
                  </div>

                  {/* § Add image */}
                  <div className="mb-6">
                    <label className="text-base font-semibold text-foreground">
                      {isZh ? '添加参考图片' : 'Add image'}{' '}
                      <span className="ml-1 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                        optional
                      </span>
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isZh
                        ? '参考图片可帮助 AI 更准确匹配预期效果'
                        : 'Reference images help match your expected results'}
                    </p>

                    <div className="mt-2.5">
                      {imagePreview || imageUrl ? (
                        <div className="flex items-center gap-3 rounded-[10px] border border-border bg-muted/20 px-3.5 py-3">
                          <div className="relative shrink-0">
                            <img
                              src={imageUrl || imagePreview || ''}
                              alt="ref"
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            {uploadingImage && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/75">
                                <Spinner className="size-3.5" />
                              </div>
                            )}
                          </div>
                          <p className="flex-1 truncate text-sm text-muted-foreground">
                            {uploadingImage
                              ? isZh
                                ? '上传中...'
                                : 'Uploading...'
                              : isZh
                                ? '图片已上传'
                                : 'Image uploaded'}
                          </p>
                          {!uploadingImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setImageUrl(undefined);
                                setImagePreview(null);
                              }}
                              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <IconX className="size-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            'flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-[14px] border-2 border-dashed py-7 transition-all',
                            isDragging
                              ? 'border-violet-400/60 bg-violet-500/5'
                              : 'border-muted-foreground/20 hover:border-violet-400/40 hover:bg-muted/30'
                          )}
                        >
                          <IconCloudUpload
                            className={cn(
                              'size-7',
                              isDragging
                                ? 'text-violet-500'
                                : 'text-muted-foreground/50'
                            )}
                          />
                          <p className="text-sm font-medium text-muted-foreground">
                            {isDragging
                              ? isZh
                                ? '松开上传'
                                : 'Release to upload'
                              : isZh
                                ? '点击上传或拖拽图片'
                                : 'Click to upload or drag images'}
                          </p>
                          <p className="text-xs text-muted-foreground/50">
                            PNG · JPG · WebP — up to 5, ≤ 10MB each
                          </p>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(f);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* § Generation Settings (mode removed — now in TabDesignPicker above) */}
                  <div className="mb-6">
                    <p className="mb-4 flex items-center gap-1.5 text-base font-semibold text-foreground">
                      <IconSettings className="size-4 text-muted-foreground" />
                      {isZh ? '生成设置' : 'Generation Settings'}
                    </p>

                    <div className="flex flex-col gap-3.5">
                      {/* Model */}
                      {currentModel && (
                        <div className="flex items-center gap-4">
                          <span className="w-20 shrink-0 text-sm text-muted-foreground">
                            {isZh ? '模型' : 'Model'}
                          </span>
                          <div className="relative flex-1" ref={modelRef}>
                            <button
                              type="button"
                              onClick={() => setModelOpen((v) => !v)}
                              className={cn(
                                pill(false),
                                'w-full justify-between'
                              )}
                            >
                              <span className="truncate">
                                {isZh
                                  ? currentModel.name.zh
                                  : currentModel.name.en}
                              </span>
                              <IconChevronDown
                                className={cn(
                                  'size-3.5 text-muted-foreground transition-transform',
                                  modelOpen && 'rotate-180'
                                )}
                              />
                            </button>
                            {modelOpen && (
                              <div className="absolute top-full left-0 z-50 mt-1.5 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
                                <div className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  {isZh ? '选择模型' : 'Select Model'}
                                </div>
                                {availableModels.map((mdl) => (
                                  <button
                                    key={mdl.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedModelId(mdl.id);
                                      setResolution(mdl.defaultResolution);
                                      setDuration(mdl.defaultDuration);
                                      setAspectRatio(mdl.defaultAspectRatio);
                                      setModelOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                                  >
                                    <span
                                      className={cn(
                                        'size-2 shrink-0 rounded-full',
                                        selectedModelId === mdl.id
                                          ? 'bg-violet-500'
                                          : 'bg-transparent'
                                      )}
                                    />
                                    <span
                                      className={
                                        selectedModelId === mdl.id
                                          ? 'font-semibold text-foreground'
                                          : 'text-muted-foreground'
                                      }
                                    >
                                      {isZh ? mdl.name.zh : mdl.name.en}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Duration */}
                      {currentModel && (
                        <div className="flex items-center gap-4">
                          <span className="w-20 shrink-0 text-sm text-muted-foreground">
                            {isZh ? '时长' : 'Duration'}
                          </span>
                          <div className="flex flex-1 flex-wrap gap-2">
                            {currentModel.supportedDurations.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDuration(d)}
                                className={cn(pill(duration === d), 'flex-1')}
                              >
                                {d}s
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quality */}
                      {currentModel &&
                        currentModel.supportedResolutions.length > 1 && (
                          <div className="flex items-center gap-4">
                            <span className="w-20 shrink-0 text-sm text-muted-foreground">
                              {isZh ? '画质' : 'Quality'}
                            </span>
                            <div className="flex flex-1 flex-wrap gap-2">
                              {currentModel.supportedResolutions.map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() =>
                                    setResolution(r as VideoResolution)
                                  }
                                  className={cn(
                                    pill(resolution === r),
                                    'flex-1'
                                  )}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Aspect Ratio */}
                      {currentModel && (
                        <div className="flex items-start gap-4">
                          <span className="w-20 shrink-0 pt-2 text-sm text-muted-foreground">
                            {isZh ? '画面比例' : 'Aspect Ratio'}
                          </span>
                          <div className="flex flex-1 flex-wrap gap-2">
                            {currentModel.supportedAspectRatios.map((ar) => (
                              <button
                                key={ar}
                                type="button"
                                onClick={() =>
                                  setAspectRatio(ar as VideoAspectRatio)
                                }
                                className={cn(
                                  pill(aspectRatio === ar),
                                  'flex-1'
                                )}
                              >
                                <AspectBox
                                  ratio={ar}
                                  active={aspectRatio === ar}
                                />
                                <span>{ar}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Audio */}
                      {currentModel && (
                        <div className="flex items-center gap-4">
                          <span className="w-20 shrink-0 text-sm text-muted-foreground">
                            {isZh ? '声音' : 'Audio'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setWithAudio((v) => !v)}
                            className={pill(withAudio)}
                          >
                            {withAudio ? (
                              <IconVolume className="size-3.5" />
                            ) : (
                              <IconVolumeOff className="size-3.5" />
                            )}
                            <span>
                              {withAudio
                                ? isZh
                                  ? '已开启'
                                  : 'On'
                                : isZh
                                  ? '已关闭'
                                  : 'Off'}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* § Generate button */}
                  <div className="mt-auto">
                    {userId ? (
                      <button
                        type="button"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                        className={cn(
                          'flex h-14 w-full items-center justify-center gap-2 rounded-[14px] px-5 text-base font-bold transition-all',
                          canSubmit
                            ? 'text-white shadow-md hover:opacity-90 active:scale-[0.99]'
                            : 'cursor-not-allowed bg-muted text-muted-foreground'
                        )}
                        style={
                          canSubmit
                            ? {
                                background: BTN_GRADIENT,
                                boxShadow:
                                  '0 4px 20px oklch(0.667 0.295 322.15 / 0.35)',
                              }
                            : undefined
                        }
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Spinner className="size-4" />
                            <span>{isZh ? '生成中...' : 'Generating...'}</span>
                          </>
                        ) : (
                          <>
                            <IconSparkles className="size-5" />
                            <span>
                              {isZh
                                ? `生成 ${duration}s 视频`
                                : `Generate ${duration}s Video`}
                              <span className="ml-2 opacity-75">
                                · {cost} {isZh ? '积分' : 'credits'}
                              </span>
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <LoginWrapper mode="modal" asChild>
                        <button
                          type="button"
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-[14px] px-5 text-base font-bold text-white transition-all hover:opacity-90 active:scale-[0.99]"
                          style={{
                            background: BTN_GRADIENT,
                            boxShadow:
                              '0 4px 20px oklch(0.667 0.295 322.15 / 0.35)',
                          }}
                        >
                          <IconSparkles className="size-5" />
                          <span>
                            {isZh
                              ? '登录后开始生成'
                              : 'Sign in to start generating'}
                          </span>
                        </button>
                      </LoginWrapper>
                    )}
                  </div>
                </div>

                {/* ══ RIGHT: Featured Inspiration ══ */}
                <div className="hidden p-7 lg:flex">
                  <div className="w-full">
                    <InspirationPanel isZh={isZh} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
