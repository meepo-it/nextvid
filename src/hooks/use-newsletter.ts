import { getBaseUrl } from '@/lib/urls';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const newsletterKeys = {
  all: ['newsletter'] as const,
  status: (email: string) => [...newsletterKeys.all, 'status', email] as const,
};

async function fetchStatus(email: string): Promise<{ subscribed: boolean }> {
  const url = `${getBaseUrl()}/api/newsletter/status?email=${encodeURIComponent(email)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? 'Failed to check newsletter status');
  }
  return { subscribed: !!data.subscribed };
}

async function subscribeEmail(email: string): Promise<void> {
  const url = `${getBaseUrl()}/api/newsletter/subscribe`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? 'Failed to subscribe to the newsletter');
  }
}

async function unsubscribeEmail(email: string): Promise<void> {
  const url = `${getBaseUrl()}/api/newsletter/unsubscribe`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.error ?? 'Failed to unsubscribe from the newsletter');
  }
}

export function useNewsletterStatus(email: string | undefined) {
  return useQuery({
    queryKey: newsletterKeys.status(email ?? ''),
    queryFn: () => fetchStatus(email!),
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscribeNewsletter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscribeEmail,
    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.status(email) });
    },
  });
}

export function useUnsubscribeNewsletter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsubscribeEmail,
    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: newsletterKeys.status(email) });
    },
  });
}
