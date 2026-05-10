'use client';

import { VideoStatusBadge } from '@/components/creations/video-status-badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVideoStatus } from '@/hooks/use-video';
import * as m from '@/paraglide/messages.js';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDownload,
  IconLoader2,
  IconSparkles,
} from '@tabler/icons-react';
import type { VideoGeneration } from '@/db/types';

export const Route = createFileRoute('/creations/$id')({
  component: VideoDetailPage,
});

function VideoDetailPage() {
  const { id } = Route.useParams();
  const { data: video, isLoading } = useVideoStatus(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <IconAlertCircle className="size-12 text-destructive" />
        <p className="text-lg font-medium">Video not found</p>
        <Link
          to="/creations"
          className={buttonVariants({ variant: 'outline' })}
        >
          <IconArrowLeft className="size-4" />
          Back to Creations
        </Link>
      </div>
    );
  }

  const v = video as VideoGeneration;
  const isProcessing =
    v.status === 'pending' ||
    v.status === 'submitted' ||
    v.status === 'running';
  const isCompleted = v.status === 'completed';
  const isFailed = v.status === 'failed';

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/creations"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          <IconArrowLeft className="size-4" />
          Back
        </Link>
        <VideoStatusBadge
          status={
            v.status as
              | 'pending'
              | 'submitted'
              | 'running'
              | 'completed'
              | 'failed'
          }
        />
      </div>

      {isCompleted && v.outputVideoUrl ? (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-black">
            <video
              src={v.outputVideoUrl}
              controls
              className="w-full"
              style={{
                aspectRatio:
                  v.aspectRatio === '9:16'
                    ? '9/16'
                    : v.aspectRatio === '1:1'
                      ? '1/1'
                      : '16/9',
              }}
            >
              <track kind="captions" />
            </video>
          </div>
          <div className="flex gap-2">
            <a
              href={v.outputVideoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'outline' })}
            >
              <IconDownload className="size-4" />
              {m.video_detail_download()}
            </a>
            <Link
              to="/creations"
              className={buttonVariants({ variant: 'outline' })}
            >
              <IconSparkles className="size-4" />
              {m.video_detail_generate_another()}
            </Link>
          </div>
        </div>
      ) : isProcessing ? (
        <div className="flex flex-col items-center gap-6 rounded-xl border bg-muted/20 py-16">
          <div className="flex size-24 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5 shadow-lg shadow-primary/10">
            <IconLoader2 className="size-10 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">{m.video_progress_generating()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {v.model} · {v.resolution} · {v.duration}s · {v.aspectRatio}
            </p>
          </div>
        </div>
      ) : isFailed ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 py-12">
          <IconAlertCircle className="size-10 text-destructive" />
          <p className="font-medium text-destructive">
            {m.video_progress_failed()}
          </p>
          {v.errorMessage && (
            <p className="max-w-md text-center text-sm text-muted-foreground">
              {v.errorMessage}
            </p>
          )}
          <Link to="/creations" className={cn(buttonVariants())}>
            {m.video_detail_retry()}
          </Link>
        </div>
      ) : null}

      {v.prompt && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Prompt</p>
          <p className="text-sm">{v.prompt}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Model: {v.model}</span>
        <span>{v.resolution}</span>
        <span>{v.aspectRatio}</span>
        {v.duration > 0 && <span>{v.duration}s</span>}
        <span>{v.creditsUsed} credits</span>
      </div>
    </main>
  );
}
