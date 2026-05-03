import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import { IconPhoto } from '@tabler/icons-react';

export const Route = createFileRoute('/creations')({
  head: () =>
    seo('/creations', {
      title: `Creations | ${websiteConfig.metadata?.name}`,
      description: 'Browse all creations.',
    }),
  component: CreationsPage,
});

function CreationsPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
      <IconPhoto className="size-12 text-muted-foreground/40" />
      <h1 className="text-2xl font-semibold">Creations</h1>
      <p className="text-muted-foreground">Coming soon.</p>
    </main>
  );
}
