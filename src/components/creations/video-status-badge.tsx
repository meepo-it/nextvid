'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as m from '@/paraglide/messages.js';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconCircleDot,
  IconClock,
  IconLoader2,
} from '@tabler/icons-react';

type VideoStatus = 'pending' | 'submitted' | 'running' | 'completed' | 'failed';

interface VideoStatusBadgeProps {
  status: VideoStatus;
  className?: string;
}

const statusConfig: Record<
  VideoStatus,
  { label: () => string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: m.video_status_pending,
    className:
      'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    icon: <IconClock className="size-3" />,
  },
  submitted: {
    label: m.video_status_submitted,
    className:
      'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: <IconCircleDot className="size-3" />,
  },
  running: {
    label: m.video_status_running,
    className:
      'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: <IconLoader2 className="size-3 animate-spin" />,
  },
  completed: {
    label: m.video_status_completed,
    className:
      'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
    icon: <IconCircleCheck className="size-3" />,
  },
  failed: {
    label: m.video_status_failed,
    className: '',
    icon: <IconAlertCircle className="size-3" />,
  },
};

export function VideoStatusBadge({ status, className }: VideoStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.icon}
      {config.label()}
    </Badge>
  );
}
