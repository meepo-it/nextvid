import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import {
  IconAlertCircle,
  IconClock,
  IconCoins,
  IconExternalLink,
} from '@tabler/icons-react';

type GenerationRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  type: string;
  provider: string;
  model: string;
  providerModel: string;
  prompt: string | null;
  negativePrompt: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaUrls: string | null;
  resolution: string;
  duration: number;
  aspectRatio: string;
  status: string;
  outputVideoUrl: string | null;
  outputDuration: number | null;
  creditsUsed: number;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  running: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  'text-to-video': 'T2V',
  'image-to-video': 'I2V',
  'reference-to-video': 'Ref',
  'video-edit': 'Edit',
};

function parseMediaUrls(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface GenerationDetailDialogProps {
  generation: GenerationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerationDetailDialog({
  generation,
  open,
  onOpenChange,
}: GenerationDetailDialogProps) {
  if (!generation) return null;

  const inputUrls: { src: string; isVideo: boolean }[] = [];
  if (generation.imageUrl) inputUrls.push({ src: generation.imageUrl, isVideo: false });
  if (generation.videoUrl) inputUrls.push({ src: generation.videoUrl, isVideo: true });
  const extras = parseMediaUrls(generation.mediaUrls);
  for (const url of extras) {
    const isVideo = /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
    inputUrls.push({ src: url, isVideo });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-full sm:max-w-[min(92vw,1100px)] max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 px-5 pt-5 pb-4 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold">Generation Detail</DialogTitle>
            <Badge
              variant="outline"
              className="border-transparent bg-secondary text-secondary-foreground text-xs"
            >
              {TYPE_LABELS[generation.type] ?? generation.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'border-transparent text-xs capitalize',
                STATUS_STYLES[generation.status] ?? 'bg-muted text-muted-foreground'
              )}
            >
              {generation.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Body — 左右两栏，各自独立滚动 */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* 左侧：媒体区（撑满），左侧内部均分高度 */}
          <div className="flex-1 min-w-0 p-5 flex flex-col gap-4 overflow-y-auto">
            {/* Output — 均分一半高度 */}
            <div className="flex-1 min-h-0 flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Output
              </p>
              {generation.outputVideoUrl ? (
                <>
                  <div className="flex-1 min-h-0 overflow-hidden rounded-xl border bg-black">
                    <video
                      src={generation.outputVideoUrl}
                      className="h-full w-full object-contain"
                      controls
                      preload="metadata"
                    />
                  </div>
                  <a
                    href={generation.outputVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-fit shrink-0"
                  >
                    <IconExternalLink className="size-3" />
                    Open original
                  </a>
                </>
              ) : (
                <div className="flex-1 min-h-0 rounded-xl border bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No output</span>
                </div>
              )}
            </div>

            {/* Input — 均分一半高度 */}
            {inputUrls.length > 0 && (
              <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Input ({inputUrls.length})
                </p>
                <div className="flex-1 min-h-0 overflow-y-auto flex flex-wrap gap-2 content-start">
                  {inputUrls.map((item, i) => (
                    <a
                      key={i}
                      href={item.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-44 overflow-hidden rounded-lg border bg-muted block shrink-0"
                    >
                      {item.isVideo ? (
                        <video
                          src={item.src}
                          className="h-full w-full object-cover"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img src={item.src} alt="" className="h-full w-full object-cover" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：参数信息栏（固定宽度，独立滚动） */}
          <div className="w-64 shrink-0 border-l p-5 flex flex-col gap-4 text-sm overflow-y-auto">
            {/* Prompt */}
            {generation.prompt && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompt</p>
                <p className="leading-relaxed whitespace-pre-wrap break-words">{generation.prompt}</p>
              </div>
            )}
            {generation.negativePrompt && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Negative Prompt</p>
                <p className="leading-relaxed whitespace-pre-wrap break-words text-muted-foreground">{generation.negativePrompt}</p>
              </div>
            )}

            <Separator />

            {/* Parameters */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parameters</p>
              <div className="flex flex-col gap-2.5">
                <ParamRow label="Model" value={generation.model} />
                <ParamRow label="Provider" value={generation.provider} />
                <ParamRow label="Provider Model" value={generation.providerModel} />
                <ParamRow label="Resolution" value={generation.resolution} />
                <ParamRow label="Aspect Ratio" value={generation.aspectRatio} />
                <ParamRow label="Duration" value={`${generation.duration}s`} />
              </div>
            </div>

            <Separator />

            {/* Stats */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <IconCoins className="size-4 shrink-0" />
                <span>{generation.creditsUsed} credits</span>
              </div>
              {generation.outputDuration != null && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconClock className="size-4 shrink-0" />
                  <span>{generation.outputDuration}s output</span>
                </div>
              )}
            </div>

            {/* Error */}
            {generation.errorMessage && (
              <>
                <Separator />
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 flex gap-2">
                  <IconAlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive break-words">{generation.errorMessage}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps + ID */}
            <div className="flex flex-col gap-2.5">
              <ParamRow label="Created" value={formatDate(new Date(generation.createdAt))} />
              <ParamRow label="Updated" value={formatDate(new Date(generation.updatedAt))} />
              <ParamRow label="ID" value={generation.id} mono />
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function ParamRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('font-medium break-all', mono && 'font-mono text-xs')}>
        {value}
      </span>
    </div>
  );
}
