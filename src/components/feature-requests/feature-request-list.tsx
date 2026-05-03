import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IconBulb, IconChevronUp, IconLogin2 } from '@tabler/icons-react';
import * as m from '@/paraglide/messages.js';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';

export type FeatureRequestItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  voteCount: number;
  createdAt: Date;
  userName: string | null;
  userImage: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  planned:
    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  in_progress:
    'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

const STATUS_LABELS: Record<string, () => string> = {
  submitted: m.feature_requests_status_submitted,
  planned: m.feature_requests_status_planned,
  in_progress: m.feature_requests_status_in_progress,
  done: m.feature_requests_status_done,
};

interface FeatureRequestListProps {
  items: FeatureRequestItem[];
  votedIds: string[];
  isLoggedIn: boolean;
  onVote: (id: string) => void;
  isVoting?: boolean;
}

export function FeatureRequestList({
  items,
  votedIds,
  isLoggedIn,
  onVote,
  isVoting,
}: FeatureRequestListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
        <IconBulb className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          {m.feature_requests_empty()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <FeatureRequestCard
          key={item.id}
          item={item}
          hasVoted={votedIds.includes(item.id)}
          isLoggedIn={isLoggedIn}
          onVote={onVote}
          isVoting={isVoting}
        />
      ))}
    </div>
  );
}

function FeatureRequestCard({
  item,
  hasVoted,
  isLoggedIn,
  onVote,
  isVoting,
}: {
  item: FeatureRequestItem;
  hasVoted: boolean;
  isLoggedIn: boolean;
  onVote: (id: string) => void;
  isVoting?: boolean;
}) {
  const [showLoginHint, setShowLoginHint] = useState(false);

  const handleVote = () => {
    if (!isLoggedIn) {
      setShowLoginHint(true);
      return;
    }
    onVote(item.id);
  };

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
      {/* Vote button */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={handleVote}
          disabled={isVoting}
          className={cn(
            'flex flex-col items-center rounded-lg border px-3 py-2 text-sm font-medium transition-all',
            hasVoted
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <IconChevronUp className="size-4" />
          <span className="tabular-nums">{item.voteCount}</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{item.title}</h3>
          <Badge
            variant="outline"
            className={cn(
              'shrink-0 border-transparent text-[11px]',
              STATUS_STYLES[item.status]
            )}
          >
            {STATUS_LABELS[item.status]?.() ?? item.status}
          </Badge>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {item.userName && (
            <span className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-primary/30" />
              {item.userName}
            </span>
          )}
          {item.category && (
            <Badge variant="secondary" className="h-4 text-[10px]">
              {item.category}
            </Badge>
          )}
        </div>

        {showLoginHint && !isLoggedIn && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{m.feature_requests_vote_login_required()}</span>
            <Link to={Routes.Login}>
              <Button variant="outline" size="sm">
                <IconLogin2 className="mr-1 size-3" />
                {m.auth_common_login()}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
