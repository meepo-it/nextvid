'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { VideoGeneration } from '@/db/types';
import { Link } from '@tanstack/react-router';
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconLoader2,
  IconPhoto,
  IconPlayerPlay,
  IconSparkles,
  IconX,
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
  if (isProcessing && Date.now() - new Date(video.createdAt).getTime() > ONE_HOUR_MS) {
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
  'image-to-video': 'Image to Video',
  'reference-to-video': 'Reference to Video',
  'video-edit': 'Video Edit',
};

type MediaItem = {
  url: string;
  isVideo: boolean;
  label: string;
};

function buildInputs(video: VideoGeneration): MediaItem[] {
  const items: MediaItem[] = [];
  if (video.imageUrl)
    items.push({ url: video.imageUrl, isVideo: false, label: 'Input Image' });
  if (video.videoUrl)
    items.push({ url: video.videoUrl, isVideo: true, label: 'Input Video' });
  if (video.mediaUrls) {
    try {
      const urls = JSON.parse(video.mediaUrls) as string[];
      urls.forEach((url, i) => {
        const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
        items.push({ url, isVideo, label: `Reference ${i + 1}` });
      });
    } catch {}
  }
  return items;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
      {children}
    </p>
  );
}

function ParamCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Thumbnail({
  item,
  index,
  active,
  onClick,
}: {
  item: MediaItem;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={item.label}
      className={cn(
        'relative h-12 w-[4.5rem] flex-shrink-0 overflow-hidden rounded-md border-2 transition-all',
        active
          ? 'border-violet-500 shadow-sm shadow-violet-500/30'
          : 'border-border hover:border-violet-300',
      )}
    >
      {item.isVideo ? (
        <div className="flex h-full w-full items-center justify-center bg-muted/60">
          <IconPlayerPlay className="size-3.5 text-muted-foreground/60" />
        </div>
      ) : (
        <img src={item.url} alt={item.label} className="h-full w-full object-contain" />
      )}
      <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white/70 drop-shadow">
        {index + 1}
      </span>
    </button>
  );
}

/* ─── Lightbox ─────────────────────────────────────── */

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const multi = items.length > 1;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
      >
        <IconX className="size-5" />
        <span className="sr-only">Close</span>
      </button>
      {multi && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
        >
          <IconChevronLeft className="size-6" />
        </button>
      )}
      <div className="max-h-[88vh] max-w-[88vw]" onClick={(e) => e.stopPropagation()}>
        {item.isVideo ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            className="max-h-[88vh] max-w-[88vw] rounded-lg"
          >
            <track kind="captions" />
          </video>
        ) : (
          <img
            src={item.url}
            alt={item.label}
            className="max-h-[88vh] max-w-[88vw] rounded-lg object-contain"
          />
        )}
      </div>
      {multi && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
        >
          <IconChevronRight className="size-6" />
        </button>
      )}
      {multi && (
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white/70">
          {index + 1} / {items.length}
        </p>
      )}
    </div>
  );
}

/* ─── Main modal ────────────────────────────────────── */

interface GenerationDetailModalProps {
  video: VideoGeneration | null;
  onClose: () => void;
}

export function GenerationDetailModal({
  video,
  onClose,
}: GenerationDetailModalProps) {
  const [activeInputIdx, setActiveInputIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const inputs = video ? buildInputs(video) : [];
  const hasInputs = inputs.length > 0;
  const multi = inputs.length > 1;
  const activeInput = inputs[activeInputIdx] ?? null;

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevLightbox = useCallback(
    () => setLightboxIdx((i) => (i !== null ? (i - 1 + inputs.length) % inputs.length : null)),
    [inputs.length],
  );
  const nextLightbox = useCallback(
    () => setLightboxIdx((i) => (i !== null ? (i + 1) % inputs.length : null)),
    [inputs.length],
  );

  // Keyboard navigation — capture phase to intercept Dialog's Escape
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeLightbox(); }
      else if (e.key === 'ArrowLeft') prevLightbox();
      else if (e.key === 'ArrowRight') nextLightbox();
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [lightboxIdx, closeLightbox, prevLightbox, nextLightbox]);

  if (!video) return null;

  const status = resolveStatus(video);
  const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox
          items={inputs}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}

      <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent
          showCloseButton={false}
          className="w-[min(95vw,1100px)] max-w-[min(95vw,1100px)] sm:max-w-[min(95vw,1100px)] max-h-[90vh] overflow-hidden p-0 gap-0"
        >
          {/* ── Header ─────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
            <div className="flex items-center gap-2">
              <IconSparkles className="size-4 text-violet-500" />
              <DialogTitle className="text-base font-bold tracking-tight">
                Generation Detail
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <IconX className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* ── Body: left stacked rows + right params sidebar ── */}
          <div className="flex flex-row overflow-auto" style={{ maxHeight: 'calc(90vh - 57px)' }}>

            {/* Left: stacked rows */}
            <div className="flex flex-1 min-w-0 flex-col">

              {/* Row 1: Input + Prompt (only when inputs exist) */}
              {hasInputs && (
                <div className="flex flex-row shrink-0 border-b border-border" style={{ height: '270px' }}>

                  {/* Input panel */}
                  <div className="flex w-[52%] flex-col gap-2 border-r border-border p-4">
                    <SectionLabel>
                      {multi ? `Inputs · ${inputs.length}` : inputs[0].label}
                    </SectionLabel>
                    <div className="flex flex-1 gap-2 min-h-0">
                      {/* Main active display */}
                      <div className="group relative flex-1 overflow-hidden rounded-lg border border-border bg-muted">
                        {activeInput.isVideo ? (
                          <video
                            key={activeInput.url}
                            src={activeInput.url}
                            controls
                            className="h-full w-full object-cover"
                          >
                            <track kind="captions" />
                          </video>
                        ) : (
                          <img
                            src={activeInput.url}
                            alt={activeInput.label}
                            onClick={() => setLightboxIdx(activeInputIdx)}
                            className="h-full w-full cursor-zoom-in object-contain"
                          />
                        )}
                        {multi && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveInputIdx((activeInputIdx - 1 + inputs.length) % inputs.length)}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-md bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                            >
                              <IconChevronLeft className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveInputIdx((activeInputIdx + 1) % inputs.length)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-md bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                            >
                              <IconChevronRight className="size-3.5" />
                            </button>
                            <span className="absolute bottom-1.5 right-2 rounded-full bg-black/40 px-1.5 py-px text-[10px] font-medium text-white/80">
                              {activeInputIdx + 1}/{inputs.length}
                            </span>
                          </>
                        )}
                        {!activeInput.isVideo && (
                          <button
                            type="button"
                            onClick={() => setLightboxIdx(activeInputIdx)}
                            className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-px text-[10px] font-medium text-white/70 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
                          >
                            <IconPhoto className="size-3" />
                            Full
                          </button>
                        )}
                      </div>
                      {/* Thumbnail column */}
                      {multi && (
                        <div className="flex flex-col gap-1.5 overflow-y-auto">
                          {inputs.map((item, i) => (
                            <Thumbnail
                              key={item.url}
                              item={item}
                              index={i}
                              active={i === activeInputIdx}
                              onClick={() => setActiveInputIdx(i)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prompt panel */}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <SectionLabel>Prompt</SectionLabel>
                    <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 px-4 py-3">
                      <p className="text-sm leading-relaxed text-foreground">
                        {video.prompt || (
                          <span className="italic text-muted-foreground/50">No prompt provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 2: Output (same height as input row) */}
              <div className="flex shrink-0 flex-col p-4" style={{ height: '270px' }}>
                {!hasInputs && (
                  <>
                    <SectionLabel>Prompt</SectionLabel>
                    <div className="mb-3 max-h-16 overflow-y-auto rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                      <p className="text-sm leading-relaxed text-foreground">
                        {video.prompt || (
                          <span className="italic text-muted-foreground/50">No prompt provided</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
                <SectionLabel>Output</SectionLabel>
                <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-muted">
                  {video.outputVideoUrl ? (
                    <video
                      src={video.outputVideoUrl}
                      controls
                      className="absolute inset-0 h-full w-full object-contain"
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/40">
                      {status === 'running' ? (
                        <>
                          <div className="relative flex size-10 items-center justify-center">
                            <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                            <IconLoader2 className="relative size-6 animate-spin text-violet-400" />
                          </div>
                          <p className="text-sm font-medium text-violet-500">Generating…</p>
                        </>
                      ) : status === 'failed' || status === 'timed_out' ? (
                        <>
                          <IconAlertTriangle className="size-8 text-red-400/60" />
                          <p className="text-sm font-medium text-red-400">
                            {status === 'timed_out' ? 'Timed out' : 'Generation failed'}
                          </p>
                          {video.errorMessage && (
                            <p className="mt-1 max-w-[200px] text-center text-xs text-muted-foreground/60">
                              {video.errorMessage}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <IconPhoto className="size-8" />
                          <p className="text-sm font-medium">
                            {status === 'pending' || status === 'submitted'
                              ? 'Waiting to process'
                              : 'No output yet'}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Parameters sidebar (spans full body height) */}
            <div className="flex w-64 shrink-0 flex-col border-l border-border">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <SectionLabel>Parameters</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  <ParamCell label="Model" value={video.model} />
                  <ParamCell label="Type" value={TYPE_LABEL[video.type] ?? video.type} />
                  <ParamCell label="Quality" value={video.resolution} />
                  <ParamCell label="Aspect" value={video.aspectRatio} />
                  <ParamCell label="Duration" value={`${video.duration}s`} />
                  <ParamCell label="Credits" value={`${video.creditsUsed}`} />
                  <ParamCell
                    label="Status"
                    value={
                      <span className={STATUS_CLASS[status]}>
                        {status === 'running' ? (
                          <span className="inline-flex items-center gap-1">
                            <IconLoader2 className="size-3.5 animate-spin" />
                            {STATUS_LABEL[status]}
                          </span>
                        ) : status === 'completed' ? (
                          <span className="inline-flex items-center gap-1">
                            <IconCircleCheck className="size-3.5" />
                            {STATUS_LABEL[status]}
                          </span>
                        ) : status === 'failed' || status === 'timed_out' ? (
                          <span className="inline-flex items-center gap-1">
                            <IconAlertTriangle className="size-3.5" />
                            {STATUS_LABEL[status]}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <IconClock className="size-3.5" />
                            {STATUS_LABEL[status]}
                          </span>
                        )}
                      </span>
                    }
                  />
                  <ParamCell label="Created" value={formattedDate} />
                </div>
              </div>
              <div className="shrink-0 border-t border-border px-5 py-4">
                <Link
                  to="/"
                  search={{ runid: video.id }}
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-500/[0.07] px-4 py-2.5 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-500/[0.12] dark:text-violet-400"
                >
                  <IconSparkles className="size-4" />
                  Use as template
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
