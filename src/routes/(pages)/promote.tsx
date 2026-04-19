import { PromoteAndEarn } from '@/components/blocks/promote-and-earn';
import Container from '@/components/layout/container';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import * as m from '@/paraglide/messages.js';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/promote')({
  head: () =>
    seo('/promote', {
      title: `${m.promote_seo_title()} | ${websiteConfig.metadata?.name}`,
      description: m.promote_seo_description(),
    }),
  component: PromotePage,
});

function PromotePage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {m.promote_title()}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {m.promote_subtitle()}
          </p>
        </div>
        <PromoteAndEarn />
      </div>
    </Container>
  );
}
