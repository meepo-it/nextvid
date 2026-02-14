import { keepPreviousData, useQuery } from '@tanstack/react-query';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'lists'] as const,
  list: (params: {
    pageIndex: number;
    pageSize: number;
    search: string;
    sortId: string;
    sortDesc: boolean;
  }) => [...usersKeys.lists(), params] as const,
};

export function useUsers(
  pageIndex: number,
  pageSize: number,
  search: string,
  sortId: string,
  sortDesc: boolean
) {
  return useQuery({
    queryKey: usersKeys.list({
      pageIndex,
      pageSize,
      search,
      sortId,
      sortDesc,
    }),
    queryFn: async () => {
      const params = new URLSearchParams({
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
        search,
        sortId,
        sortDesc: String(sortDesc),
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        data?: { items: AdminUser[]; total: number };
      };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to fetch users');
      }
      return json.data as { items: AdminUser[]; total: number };
    },
    placeholderData: keepPreviousData,
  });
}
