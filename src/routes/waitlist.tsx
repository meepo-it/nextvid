import { createFileRoute } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { WaitlistFormCard } from '@/components/waitlist/waitlist-form-card';
import { messages } from '@/config/messages';

export const Route = createFileRoute('/waitlist')({
  component: WaitlistPage,
});

function WaitlistPage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {messages.waitlist.title}
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            {messages.waitlist.description}
          </p>
        </div>
        <WaitlistFormCard />
      </div>
    </Container>
  );
}
