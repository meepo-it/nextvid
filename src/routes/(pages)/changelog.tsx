import { createFileRoute, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { ReleaseCard } from '@/components/changelog/release-card';
import { getChangelogReleases, type ChangelogRelease } from '@/lib/changelog';
import { websiteConfig } from '@/config/website';
import { messages } from '@/messages';
import { getCanonicalUrl } from '@/lib/urls';

const m = messages.changelogPage;

export const Route = createFileRoute('/(pages)/changelog')({
  loader: () => {
    const releases = getChangelogReleases();
    if (!releases?.length) throw notFound();
    return releases;
  },
  head: () => ({
    meta: [
      {
        title: `${m.title} | ${websiteConfig.metadata?.name}`,
      },
      { name: 'description', content: m.subtitle },
    ],
    links: [{ rel: 'canonical', href: getCanonicalUrl('/changelog') }],
  }),
  component: ChangelogPage,
});

function ChangelogPage() {
  const releases = Route.useLoaderData();

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {m.title}
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            {m.subtitle}
          </p>
        </div>

        <div className="mt-8">
          {releases?.map((release) => (
            <ReleaseCard key={release.slug} release={release} />
          ))}
        </div>
      </div>
    </Container>
  );
}
