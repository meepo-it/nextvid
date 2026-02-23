import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

const m = {
  title: 'Ready to get started?',
  description: 'Join thousands of teams building with TanStack Starter today',
  primaryButton: 'Get started',
  secondaryButton: 'View pricing',
};

export default function CallToActionSection() {
  return (
    <section id="call-to-action" className="bg-muted/50 px-4 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            {m.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{m.description}</p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/auth/login"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              <span>{m.primaryButton}</span>
            </Link>
            <Link
              to="/"
              hash="pricing"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
            >
              <span>{m.secondaryButton}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
