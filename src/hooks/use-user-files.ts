import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { UserFiles } from '@/db/types';

export const userFilesKeys = {
  all: ['user-files'] as const,
  lists: () => [...userFilesKeys.all, 'lists'] as const,
  list: (params: { pageIndex: number; pageSize: number }) =>
    [...userFilesKeys.lists(), params] as const,
};

/**
 * Fetches a list of user files
 */
export function useUserFiles(pageIndex: number, pageSize: number) {
  return useQuery({
    queryKey: userFilesKeys.list({ pageIndex, pageSize }),
    queryFn: async () => {
      const params = new URLSearchParams({
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/user-files?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = (await res.json()) as { items: UserFiles[]; total: number };
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

/**
 * Uploads a user file
 */
export function useUploadUserFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      file: File;
      isPublic?: boolean;
      description?: string;
    }) => {
      const form = new FormData();
      form.append('file', params.file);
      if (params.isPublic !== undefined) {
        form.append('isPublic', params.isPublic ? 'true' : 'false');
      }
      if (params.description != null && params.description !== '') {
        form.append('description', params.description);
      }
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userFilesKeys.all });
    },
  });
}

/** 
 * Uploads a file to the avatars folder
 */
export function useUploadAvatarFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'avatars');
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? 'Upload failed');
      }
      return res.json() as Promise<{ url: string; key: string }>;
    },
  });
}

/**
 * Deletes a user file
 */
export function useDeleteUserFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user-files/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Not found');
        throw new Error('Delete failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userFilesKeys.all });
    },
  });
}
