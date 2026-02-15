import { createFileRoute, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { PageMarkdown } from '@/components/page/page-markdown';
import { getPageBySlug } from '@/lib/pages';

export const Route = createFileRoute('/cookie')({
  component: CookiePage,
});

function CookiePage() {
  const page = getPageBySlug('cookie-policy');
  if (!page) {
    throw notFound();
  }
  return (
    <Container className="py-16 px-4">
      <PageMarkdown page={page} />
    </Container>
  );
}
