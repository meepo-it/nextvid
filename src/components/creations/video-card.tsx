'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import type { VideoGeneration } from '@/db/types';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconLoader2,
  IconPlayerPlay,
  IconSparkles,
} from '@tabler/icons-react';

const ONE_HOUR_MS = 60 * 60 * 1000;

type EffectiveStatus =
  | 'pending'
  | 'submitted'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timed_out';

function resolveStatus(video: VideoGeneration): EffectiveStatus {
  const isProcessing =
    video.status === 'pending' ||
    video.status === 'submitted' ||
    video.status === 'running';
  if (
    isProcessing &&
    Date.now() - new Date(video.createdAt).getTime() > ONE_HOUR_MS
  ) {
    return 'timed_out';
  }
  return video.status as EffectiveStatus;
}

const STATUS_CONFIG: Record<
  EffectiveStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: '排队中',
    icon: <IconClock className="size-3" />,
    className:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  },
  submitted: {
    label: '已提交',
    icon: <IconSparkles className="size-3" />,
    className:
      'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
  },
  running: {
    label: '生成中',
    icon: <IconLoader2 className="size-3 animate-spin" />,
    className:
      'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/25',
  },
  completed: {
    label: '已完成',
    icon: <IconCircleCheck className="size-3" />,
    className:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  failed: {
    label: '生成失败',
    icon: <IconAlertTriangle className="size-3" />,
    className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
  },
  timed_out: {
    label: '生成超时',
    icon: <IconAlertTriangle className="size-3" />,
    className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
  },
};

function StatusBadge({ status }: { status: EffectiveStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
        cfg.className
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function ProcessingPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/60">
      <div className="relative flex size-12 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
        <div className="absolute inset-1 animate-pulse rounded-full bg-violet-400/10" />
        <IconSparkles className="relative size-6 text-violet-400" />
      </div>
      <p className="text-xs text-muted-foreground/60">AI 正在生成中…</p>
    </div>
  );
}

function FailedPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40">
      <IconAlertTriangle className="size-8 text-red-400/50" />
      <p className="text-xs text-muted-foreground/50">生成未能完成</p>
    </div>
  );
}

export function VideoCard({
  video,
  className,
}: {
  video: VideoGeneration;
  className?: string;
}) {
  const status = resolveStatus(video);
  const isProcessing =
    status === 'pending' || status === 'submitted' || status === 'running';
  const isFailed = status === 'failed' || status === 'timed_out';

  const formattedDate = new Date(video.createdAt).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const prompt = video.prompt ?? '';
  const shortPrompt = prompt.length > 72 ? `${prompt.slice(0, 72)}…` : prompt;

  return (
    <Link to="/creations/$id" params={{ id: video.id }} className="block">
      <div
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg',
          className
        )}
      >
        {/* Thumbnail / video area */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {video.outputVideoUrl ? (
            <>
              <video
                src={video.outputVideoUrl}
                muted
                playsInline
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              >
                <track kind="captions" />
              </video>
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                <div className="flex size-10 scale-75 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100">
                  <IconPlayerPlay className="ml-0.5 size-4" />
                </div>
              </div>
            </>
          ) : isProcessing ? (
            <ProcessingPlaceholder />
          ) : (
            <FailedPlaceholder />
          )}

          {/* Duration pill */}
          {video.duration > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              <IconClock className="size-3" />
              {video.duration}s
            </div>
          )}

          {/* Status badge — top right */}
          <div className="absolute right-2 top-2">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Card body */}
        <div className="px-3.5 py-3">
          <p className="line-clamp-2 text-sm leading-snug text-foreground">
            {shortPrompt || <span className="text-muted-foreground/50">—</span>}
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {video.resolution && <span>{video.resolution}</span>}
              {video.resolution && video.aspectRatio && (
                <span className="text-muted-foreground/30">·</span>
              )}
              {video.aspectRatio && <span>{video.aspectRatio}</span>}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 px-3.5 py-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex items-center justify-between pt-0.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
