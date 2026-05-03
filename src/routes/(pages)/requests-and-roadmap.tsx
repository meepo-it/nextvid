import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/auth/client';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FeatureRequestList } from '@/components/feature-requests/feature-request-list';
import { FeatureRequestForm } from '@/components/feature-requests/feature-request-form';
import { RoadmapBoard } from '@/components/feature-requests/roadmap-board';
import {
  listFeatureRequests,
  createFeatureRequest,
  voteFeatureRequest,
} from '@/api/feature-requests';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { toast } from 'sonner';
import * as m from '@/paraglide/messages.js';

export const Route = createFileRoute('/(pages)/requests-and-roadmap')({
  head: () =>
    seo('/requests-and-roadmap', {
      title: `${m.feature_requests_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.feature_requests_seo_description(),
    }),
  component: RequestsAndRoadmapPage,
});

function RequestsAndRoadmapPage() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const [sort, setSort] = useState<'votes' | 'newest'>('votes');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['feature-requests', sort, statusFilter, userId],
    queryFn: () =>
      listFeatureRequests({
        data: {
          sort,
          status: statusFilter as
            | 'all'
            | 'submitted'
            | 'planned'
            | 'in_progress'
            | 'done',
          userId,
        },
      }),
  });

  const { data: roadmapData } = useQuery({
    queryKey: ['feature-requests-roadmap'],
    queryFn: () =>
      listFeatureRequests({
        data: { sort: 'votes', status: 'all', userId: undefined },
      }),
  });

  const createMutation = useMutation({
    mutationFn: (input: {
      title: string;
      description: string;
      category?: string;
    }) => createFeatureRequest({ data: input }),
    onSuccess: () => {
      toast.success(m.feature_requests_submit_success());
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      queryClient.invalidateQueries({ queryKey: ['feature-requests-roadmap'] });
    },
    onError: () => {
      toast.error(m.feature_requests_submit_error());
    },
  });

  const voteMutation = useMutation({
    mutationFn: (featureRequestId: string) =>
      voteFeatureRequest({ data: { featureRequestId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      queryClient.invalidateQueries({ queryKey: ['feature-requests-roadmap'] });
    },
    onError: () => {
      toast.error(m.feature_requests_vote_error());
    },
  });

  const items = data?.items ?? [];
  const votedIds = data?.votedIds ?? [];
  const roadmapItems = roadmapData?.items ?? [];

  const filters = [
    { value: 'all', label: m.feature_requests_filter_all },
    { value: 'submitted', label: m.feature_requests_filter_submitted },
    { value: 'planned', label: m.feature_requests_filter_planned },
    { value: 'in_progress', label: m.feature_requests_filter_in_progress },
    { value: 'done', label: m.feature_requests_filter_done },
  ];

  return (
    <Container className="px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Page header */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {m.feature_requests_title_prefix()}{' '}
            <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              {m.feature_requests_title_highlight()}
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            {m.feature_requests_subtitle_line1()}{' '}
            <span className="font-medium text-foreground">
              {m.feature_requests_subtitle_highlight()}
            </span>{' '}
            {m.feature_requests_subtitle_line2()}
          </p>
        </div>

        {/* Section: Feature Requests */}
        <section id="requests" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between">
            <a
              href="#requests"
              className="group text-xl font-semibold hover:underline"
            >
              {m.feature_requests_tab_requests()}
              <span className="ml-1 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground">
                #
              </span>
            </a>
            <FeatureRequestForm
              isLoggedIn={isLoggedIn}
              onSubmit={(data) => createMutation.mutate(data)}
              isSubmitting={createMutation.isPending}
            />
          </div>

          {/* Toolbar: filters + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3">
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
            <div className="flex items-center gap-2">
              <Button
                variant={sort === 'votes' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSort('votes')}
              >
                {m.feature_requests_sort_votes()}
              </Button>
              <Button
                variant={sort === 'newest' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSort('newest')}
              >
                {m.feature_requests_sort_newest()}
              </Button>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <FeatureRequestList
              items={items}
              votedIds={votedIds}
              isLoggedIn={isLoggedIn}
              onVote={(id) => voteMutation.mutate(id)}
              isVoting={voteMutation.isPending}
            />
          )}
        </section>

        <Separator />

        {/* Section: Roadmap */}
        <section id="roadmap" className="scroll-mt-20 space-y-4">
          <a
            href="#roadmap"
            className="group text-xl font-semibold hover:underline"
          >
            {m.feature_requests_tab_roadmap()}
            <span className="ml-1 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground">
              #
            </span>
          </a>
          <RoadmapBoard items={roadmapItems} />
        </section>
      </div>
    </Container>
  );
}
