import { useSubscribeNewsletter } from '@/hooks/use-newsletter';
import * as m from '@/paraglide/messages.js';
import { IconLoader2, IconSend2 } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const subscribeMutation = useSubscribeNewsletter();
  const isPending = subscribeMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(m.newsletter_email_invalid());
      return;
    }

    try {
      await subscribeMutation.mutateAsync(email);
      toast.success(m.newsletter_thanks());
      setEmail('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : m.newsletter_error();
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="w-full pt-4">
      <p className="text-sm text-muted-foreground mb-2">
        {m.newsletter_description()}
      </p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={m.newsletter_placeholder_email()}
          className="h-9 flex-1 rounded-l-md border border-r-0 border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-9 items-center justify-center rounded-r-md bg-primary px-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconSend2 className="size-4" />
          )}
        </button>
      </form>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
