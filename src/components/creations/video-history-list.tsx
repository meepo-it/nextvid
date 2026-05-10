'use client';

import { useVideoList } from '@/hooks/use-video';
import { cn } from '@/lib/utils';
import type { VideoGeneration } from '@/db/types';
import { useState } from 'react';
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconCoins,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconLoader2,
  IconPhoto,
  IconSparkles,
  IconVideo,
} from '@tabler/icons-react';
import { GenerationDetailModal } from './generation-detail-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

const PAGE_SIZE = 20;
const MAX_PAGE_BUTTONS = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;

type EffectiveStatus =
  | 'pending'
  | 'submitted'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timed_out';

type StatusFilter = 'all' | 'pending' | 'running' | 'completed' | 'failed';
type TypeFilter = 'all' | 'text-to-video' | 'reference-to-video' | 'video-edit';

const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: 'All Statuses',
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

const TYPE_FILTER_LABEL: Record<TypeFilter, string> = {
  all: 'All Types',
  'text-to-video': 'Text to Video',
  'reference-to-video': 'Reference to Video',
  'video-edit': 'Video Edit',
};

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

const STATUS_LABEL: Record<EffectiveStatus, string> = {
  pending: 'Pending',
  submitted: 'Submitted',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  timed_out: 'Timed Out',
};

const STATUS_CLASS: Record<EffectiveStatus, string> = {
  pending: 'text-amber-600 dark:text-amber-400',
  submitted: 'text-amber-600 dark:text-amber-400',
  running: 'text-violet-600 dark:text-violet-400',
  completed: 'text-emerald-600 dark:text-emerald-400',
  failed: 'text-red-500',
  timed_out: 'text-red-500',
};

const TYPE_LABEL: Record<string, string> = {
  'text-to-video': 'Text to Video',
  'reference-to-video': 'Reference to Video',
  'video-edit': 'Video Edit',
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  'text-to-video':
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'reference-to-video':
    'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'video-edit':
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

function formatDate(date: Date | string) {
  const d = new Date(date);
  const datePart = d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({
  page,
  total,
  onChange,
  disabled,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
  disabled: boolean;
}) {
  if (total <= 1) return null;

  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  let start = Math.max(0, page - half);
  const end = Math.min(total - 1, start + MAX_PAGE_BUTTONS - 1);
  start = Math.max(0, end - MAX_PAGE_BUTTONS + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btnBase =
    'inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-medium transition-all';

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 0 || disabled}
        className={cn(
          btnBase,
          'border border-border text-muted-foreground hover:border-border/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        <IconChevronLeft className="size-4" />
      </button>

      {start > 0 && (
        <>
          <button
            type="button"
            onClick={() => onChange(0)}
            className={cn(
              btnBase,
              'border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            1
          </button>
          {start > 1 && (
            <span className="px-1 text-muted-foreground/40">…</span>
          )}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          disabled={disabled}
          className={cn(
            btnBase,
            p === page
              ? 'border border-violet-400/60 bg-violet-500/[0.07] text-violet-600 dark:text-violet-400'
              : 'border border-border text-muted-foreground hover:border-border/60 hover:text-foreground'
          )}
        >
          {p + 1}
        </button>
      ))}

      {end < total - 1 && (
        <>
          {end < total - 2 && (
            <span className="px-1 text-muted-foreground/40">…</span>
          )}
          <button
            type="button"
            onClick={() => onChange(total - 1)}
            className={cn(
              btnBase,
              'border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {total}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= total - 1 || disabled}
        className={cn(
          btnBase,
          'border border-border text-muted-foreground hover:border-border/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
        )}
      >
        <IconChevronRight className="size-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column header
// ---------------------------------------------------------------------------

const COL_HEADER_CLASS =
  'text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none';

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0">
      <div className="size-14 shrink-0 rounded-lg bg-muted animate-pulse" />
      <div className="size-14 shrink-0 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-4 w-20 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="hidden sm:block w-16 h-3.5 rounded bg-muted animate-pulse" />
      <div className="hidden sm:block w-20 h-3.5 rounded bg-muted animate-pulse" />
      <div className="hidden md:block w-28 h-3.5 rounded bg-muted animate-pulse" />
      <div className="flex gap-1.5">
        <div className="size-7 rounded-md bg-muted animate-pulse" />
        <div className="size-7 rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single table row
// ---------------------------------------------------------------------------

interface RowProps {
  video: VideoGeneration;
  onOpen: (v: VideoGeneration) => void;
}

function VideoRow({ video, onOpen }: RowProps) {
  const status = resolveStatus(video);

  const prompt = video.prompt ?? '';
  const shortPrompt = prompt.length > 60 ? `${prompt.slice(0, 60)}…` : prompt;

  const hasOutput = !!video.outputVideoUrl;

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!video.outputVideoUrl) return;
    const a = document.createElement('a');
    a.href = video.outputVideoUrl;
    a.download = `generation-${video.id}.mp4`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }

  function handleOpenDetail(e: React.MouseEvent) {
    e.stopPropagation();
    onOpen(video);
  }

  return (
    <div
      onClick={() => onOpen(video)}
      className="group flex cursor-pointer items-center gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-muted/40 transition-colors"
    >
      {/* INPUT thumbnail */}
      <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {video.imageUrl ? (
          <img
            src={video.imageUrl}
            alt="Input"
            className="size-full object-cover"
          />
        ) : video.videoUrl ? (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <IconVideo className="size-5" />
          </div>
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <IconFileText className="size-5" />
          </div>
        )}
      </div>

      {/* OUTPUT thumbnail */}
      <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
        {video.outputVideoUrl ? (
          <video
            src={video.outputVideoUrl}
            muted
            playsInline
            className="size-full object-cover"
          >
            <track kind="captions" />
          </video>
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/30">
            <IconPhoto className="size-5" />
          </div>
        )}
      </div>

      {/* PROMPT + type badge */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground leading-snug">
          {shortPrompt || (
            <span className="text-muted-foreground/40 italic">No prompt</span>
          )}
        </p>
        <span
          className={cn(
            'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
            TYPE_BADGE_CLASS[video.type] ?? 'bg-muted text-muted-foreground'
          )}
        >
          {TYPE_LABEL[video.type] ?? video.type}
        </span>
      </div>

      {/* CREDITS */}
      <div className="hidden sm:flex w-14 shrink-0 items-center gap-1 text-sm font-medium text-foreground">
        <IconCoins className="size-3.5 shrink-0 text-muted-foreground/50" />
        <span>{video.creditsUsed}</span>
      </div>

      {/* STATUS */}
      <div className="hidden sm:flex w-24 shrink-0 items-center gap-1">
        {status === 'running' ? (
          <IconLoader2 className="size-3.5 shrink-0 animate-spin text-violet-500" />
        ) : status === 'completed' ? (
          <IconCircleCheck className="size-3.5 shrink-0 text-emerald-500" />
        ) : status === 'failed' || status === 'timed_out' ? (
          <IconAlertTriangle className="size-3.5 shrink-0 text-red-500" />
        ) : (
          <IconClock className="size-3.5 shrink-0 text-amber-500" />
        )}
        <span className={cn('text-xs font-semibold', STATUS_CLASS[status])}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* TIME */}
      <div className="hidden md:block w-36 shrink-0 text-xs text-muted-foreground tabular-nums">
        {formatDate(video.createdAt)}
      </div>

      {/* ACTIONS */}
      <div
        className="flex shrink-0 items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          title={hasOutput ? 'Download video' : 'No output yet'}
          disabled={!hasOutput}
          onClick={handleDownload}
          className={cn(
            'flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors',
            hasOutput
              ? 'hover:border-border/60 hover:bg-muted hover:text-foreground'
              : 'opacity-30 cursor-not-allowed'
          )}
        >
          <IconDownload className="size-3.5" />
        </button>
        <button
          type="button"
          title="View details"
          onClick={handleOpenDetail}
          className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted hover:text-foreground"
        >
          <IconExternalLink className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function VideoHistoryList() {
  const [pageIndex, setPageIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoGeneration | null>(
    null
  );

  const { data, isLoading } = useVideoList(pageIndex, PAGE_SIZE);

  const rawVideos = (data?.items ?? []) as VideoGeneration[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side filter
  const videos = rawVideos.filter((v) => {
    const effectiveStatus = resolveStatus(v);

    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        if (effectiveStatus !== 'pending' && effectiveStatus !== 'submitted')
          return false;
      } else if (statusFilter === 'failed') {
        if (effectiveStatus !== 'failed' && effectiveStatus !== 'timed_out')
          return false;
      } else {
        if (effectiveStatus !== statusFilter) return false;
      }
    }

    if (typeFilter !== 'all' && v.type !== typeFilter) return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (rawVideos.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 dark:border-violet-800/50 dark:bg-violet-950/20">
            <IconSparkles className="size-8 text-violet-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground">还没有创作记录</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            回到首页，输入你的第一句提示词，
            <br />让 AI 帮你把想法变成视频。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Count + filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-semibold text-foreground">{total}</span>{' '}
          条创作记录
          {totalPages > 1 && `，第 ${pageIndex + 1} / ${totalPages} 页`}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
            Filters
          </span>
          <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val as StatusFilter); }}>
            <SelectTrigger size="sm" className="text-xs min-w-[120px]">
              <span>{STATUS_FILTER_LABEL[statusFilter]}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(val) => { if (val) setTypeFilter(val as TypeFilter); }}>
            <SelectTrigger size="sm" className="text-xs min-w-[130px]">
              <span>{TYPE_FILTER_LABEL[typeFilter]}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text-to-video">Text to Video</SelectItem>
              <SelectItem value="reference-to-video">Reference to Video</SelectItem>
              <SelectItem value="video-edit">Video Edit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Header row */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
          <div className={cn('w-12 shrink-0', COL_HEADER_CLASS)}>Input</div>
          <div className={cn('w-12 shrink-0', COL_HEADER_CLASS)}>Output</div>
          <div className={cn('flex-1 min-w-0', COL_HEADER_CLASS)}>Prompt</div>
          <div
            className={cn('hidden sm:block w-14 shrink-0', COL_HEADER_CLASS)}
          >
            Credits
          </div>
          <div
            className={cn('hidden sm:block w-24 shrink-0', COL_HEADER_CLASS)}
          >
            Status
          </div>
          <div
            className={cn('hidden md:block w-36 shrink-0', COL_HEADER_CLASS)}
          >
            Time
          </div>
          {/* Actions col — no header text */}
          <div className="w-[62px] shrink-0" />
        </div>

        {/* Data rows */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground/50">
            <IconSparkles className="size-8" />
            <p className="text-sm">No results match the current filters.</p>
          </div>
        ) : (
          <div>
            {videos.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                onOpen={setSelectedVideo}
              />
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={pageIndex}
        total={totalPages}
        onChange={setPageIndex}
        disabled={isLoading}
      />

      {/* Detail modal */}
      <GenerationDetailModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
