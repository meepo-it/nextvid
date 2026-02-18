import { createFileRoute, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { MarkdownPage } from '@/components/page/markdown-page';
import { getPageBySlug } from '@/lib/pages';
import { websiteConfig } from '@/config/website';
import { getCanonicalUrl } from '@/lib/urls';

export const Route = createFileRoute('/privacy')({
  loader: () => {
    const page = getPageBySlug('privacy-policy');
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.page;
    if (!p) return {};
    return {
      meta: [
        { title: `${p.title} | ${websiteConfig.metadata?.name}` },
        { name: 'description', content: p.description },
      ],
      links: [{ rel: 'canonical', href: getCanonicalUrl('/privacy') }],
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const { page } = Route.useLoaderData();
  if (!page) throw notFound();
  return (
    <Container className="py-16 px-4">
      <MarkdownPage page={page} />
    </Container>
  );
}
