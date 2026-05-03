import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconMap } from '@tabler/icons-react';
import * as m from '@/paraglide/messages.js';
import type { FeatureRequestItem } from './feature-request-list';

const ROADMAP_COLUMNS = [
  { key: 'planned', color: 'bg-purple-500' },
  { key: 'in_progress', color: 'bg-orange-500' },
  { key: 'done', color: 'bg-green-500' },
] as const;

const COLUMN_LABELS: Record<string, () => string> = {
  planned: m.feature_requests_status_planned,
  in_progress: m.feature_requests_status_in_progress,
  done: m.feature_requests_status_done,
};

interface RoadmapBoardProps {
  items: FeatureRequestItem[];
}

export function RoadmapBoard({ items }: RoadmapBoardProps) {
  const grouped = {
    planned: items.filter((i) => i.status === 'planned'),
    in_progress: items.filter((i) => i.status === 'in_progress'),
    done: items.filter((i) => i.status === 'done'),
  };

  const hasItems = Object.values(grouped).some((list) => list.length > 0);

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
        <IconMap className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          {m.feature_requests_roadmap_empty()}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ROADMAP_COLUMNS.map(({ key, color }) => (
        <div key={key} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className={cn('size-2 rounded-full', color)} />
            <span className="text-sm font-semibold">
              {COLUMN_LABELS[key]?.() ?? key}
            </span>
            <Badge
              variant="secondary"
              className="pointer-events-none rounded-sm"
            >
              {grouped[key].length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            {grouped[key].map((item) => (
              <RoadmapCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoadmapCard({ item }: { item: FeatureRequestItem }) {
  return (
    <div className="rounded-md border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-sm font-medium">{item.title}</span>
          <Badge
            variant="outline"
            className="pointer-events-none shrink-0 text-[10px]"
          >
            {m.feature_requests_votes({ count: String(item.voteCount) })}
          </Badge>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </p>
        {item.category && (
          <Badge variant="secondary" className="w-fit text-[10px]">
            {item.category}
          </Badge>
        )}
      </div>
    </div>
  );
}
