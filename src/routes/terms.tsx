import { createFileRoute, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { PageMarkdown } from '@/components/page/page-markdown';
import { getPageBySlug } from '@/lib/pages';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  const page = getPageBySlug('terms-of-service');
  if (!page) {
    throw notFound();
  }
  return (
    <Container className="py-16 px-4">
      <PageMarkdown page={page} />
    </Container>
  );
}
