import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  getUserCredit,
  submitVideoGeneration,
  pollVideoStatus,
  listVideoGenerations,
} from '@/api/video-generation';

export const videoKeys = {
  all: ['video'] as const,
  credit: () => [...videoKeys.all, 'credit'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...videoKeys.all, 'list', params] as const,
  status: (id: string) => [...videoKeys.all, 'status', id] as const,
};

export function useUserCredit() {
  return useQuery({
    queryKey: videoKeys.credit(),
    queryFn: () => getUserCredit(),
    staleTime: 30_000,
  });
}

export function useSubmitVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof submitVideoGeneration>[0]['data']) =>
      submitVideoGeneration({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.credit() });
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  });
}

export function useVideoStatus(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: videoKeys.status(id ?? ''),
    queryFn: () => pollVideoStatus({ data: { id: id! } }),
    enabled: !!id && enabled,
    refetchInterval: (query) => {
      const status = (query.state.data as { status?: string })?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 4_000;
    },
    staleTime: 0,
  });
}

export function useVideoList(pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: videoKeys.list({ pageIndex, pageSize }),
    queryFn: () => listVideoGenerations({ data: { pageIndex, pageSize } }),
    placeholderData: keepPreviousData,
  });
}
