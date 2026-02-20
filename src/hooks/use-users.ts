import { authClient } from '@/auth/auth-client';
import type { User } from '@/auth/auth-types';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { ColumnSort } from '@tanstack/react-table';

/** Sorting state for users list (avoids ExtendedColumnSort from data-table parsers). */
export type UsersSortingState = ColumnSort[];

interface SimpleFilter {
  id: string;
  value: string;
}

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'lists'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    search: string;
    sorting: UsersSortingState;
    filters: SimpleFilter[];
  }) => [...usersKeys.lists(), params] as const,
};

/**
 * Fetch users with pagination, search, sort. Uses TanStack Query; filters are in key for cache but API only supports search/sort.
 */
export function useUsers(
  pageIndex: number,
  pageSize: number,
  search: string,
  sorting: UsersSortingState,
  filters: SimpleFilter[]
) {
  return useQuery({
    queryKey: usersKeys.list({
      pageIndex,
      pageSize,
      search,
      sorting,
      filters,
    }),
    queryFn: async () => {
      const first = sorting[0];
      const sortId = first?.id ?? 'createdAt';
      const sortDesc = first?.desc ?? true;
      const params = new URLSearchParams({
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
        search,
        sortId,
        sortDesc: String(sortDesc),
      });
      const roleFilter = filters.find((f) => f.id === 'role');
      const statusFilter = filters.find((f) => f.id === 'status');
      if (roleFilter?.value) params.set('role', roleFilter.value);
      if (statusFilter?.value) params.set('status', statusFilter.value);
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { items: User[]; total: number };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to fetch users');
      }
      return json.data as { items: User[]; total: number };
    },
    placeholderData: keepPreviousData,
  });
}

/** Ban user via Better Auth admin plugin; invalidates users list on success. */
export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opts: {
      userId: string;
      banReason: string;
      banExpiresIn?: number;
    }) =>
      authClient.admin.banUser({
        userId: opts.userId,
        banReason: opts.banReason,
        banExpiresIn: opts.banExpiresIn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

/** Unban user via Better Auth admin plugin; invalidates users list on success. */
export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opts: { userId: string }) =>
      authClient.admin.unbanUser({ userId: opts.userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}
