import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  listFeatureRequests,
  updateFeatureRequestStatus,
  deleteFeatureRequest,
} from '@/api/feature-requests';
import {
  IconArrowRight,
  IconBulb,
  IconMail,
  IconTrash,
} from '@tabler/icons-react';
import * as m from '@/paraglide/messages.js';

const STATUSES = ['submitted', 'planned', 'in_progress', 'done'] as const;

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  planned: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  in_progress: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

const STATUS_LABELS: Record<string, () => string> = {
  submitted: m.feature_requests_status_submitted,
  planned: m.feature_requests_status_planned,
  in_progress: m.feature_requests_status_in_progress,
  done: m.feature_requests_status_done,
};

export function AdminFeatureRequestsContent() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notifyCreator, setNotifyCreator] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feature-requests', statusFilter],
    queryFn: () =>
      listFeatureRequests({
        data: {
          sort: 'votes',
          status: statusFilter as 'all' | 'submitted' | 'planned' | 'in_progress' | 'done',
        },
      }),
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; status: 'submitted' | 'planned' | 'in_progress' | 'done'; notify: boolean }) =>
      updateFeatureRequestStatus({ data: input }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-requests'] });
      if (result.notified && result.notifiedCount > 0) {
        toast.success(m.admin_feature_requests_notified({ count: String(result.notifiedCount) }));
      } else {
        toast.success(m.admin_feature_requests_status_updated());
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (input: { id: string; reason?: string; notifyCreator: boolean }) =>
      deleteFeatureRequest({ data: input }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-requests'] });
      if (variables.notifyCreator && variables.reason) {
        toast.success(m.admin_feature_requests_rejected_notified());
      } else {
        toast.success(m.admin_feature_requests_deleted());
      }
      setRejectTarget(null);
      setRejectReason('');
    },
  });

  const items = data?.items ?? [];

  const filters = [
    { value: 'all', label: m.feature_requests_filter_all },
    { value: 'submitted', label: m.feature_requests_filter_submitted },
    { value: 'planned', label: m.feature_requests_filter_planned },
    { value: 'in_progress', label: m.feature_requests_filter_in_progress },
    { value: 'done', label: m.feature_requests_filter_done },
  ];

  const handleReject = () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    deleteMutation.mutate({
      id: rejectTarget.id,
      reason: reason || undefined,
      notifyCreator: notifyCreator && reason.length > 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={statusFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label()}
          </Button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16">
          <IconBulb className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {m.feature_requests_empty()}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >
              {/* Vote count */}
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold tabular-nums">{item.voteCount}</span>
                <span className="text-[10px] text-muted-foreground">votes</span>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{item.title}</span>
                  {item.category && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {item.category}
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  by {item.userName}
                </span>
              </div>

              {/* Status selector + notify + delete */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 border-transparent text-[11px]',
                    STATUS_STYLES[item.status]
                  )}
                >
                  {STATUS_LABELS[item.status]?.() ?? item.status}
                </Badge>
                <IconArrowRight className="size-3 text-muted-foreground" />
                <Select
                  value={item.status}
                  onValueChange={(value) =>
                    updateMutation.mutate({
                      id: item.id,
                      status: value as 'submitted' | 'planned' | 'in_progress' | 'done',
                      notify: true,
                    })
                  }
                >
                  <SelectTrigger className="h-7 w-[130px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]?.() ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reject / Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setRejectTarget({ id: item.id, title: item.title });
                    setRejectReason(
                      m.admin_feature_requests_reject_default_reason({ title: item.title })
                    );
                    setNotifyCreator(true);
                  }}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{m.admin_feature_requests_reject_title()}</DialogTitle>
            <DialogDescription>
              {rejectTarget?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {m.admin_feature_requests_reject_reason()}
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={m.admin_feature_requests_reject_reason_placeholder()}
                rows={3}
                maxLength={500}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={notifyCreator}
                onCheckedChange={(v) => setNotifyCreator(!!v)}
              />
              <IconMail className="size-3.5 text-muted-foreground" />
              {m.admin_feature_requests_notify_creator()}
            </label>
            <div className="flex justify-end gap-2">
              <DialogClose
                render={
                  <Button variant="outline">
                    {m.feature_requests_form_cancel()}
                  </Button>
                }
              />
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={deleteMutation.isPending}
              >
                {m.admin_feature_requests_reject_confirm()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
