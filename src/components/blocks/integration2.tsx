import { Logo } from '@/components/shared/logo';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

const m = {
  title: 'Integrate with your favorite tools',
  description:
    'Connect seamlessly with popular platforms and services to enhance your workflow',
  primaryButton: 'Get Started',
  secondaryButton: 'View Pricing',
};

function IntegrationCard({
  children,
  className,
  borderClassName,
}: {
  children: React.ReactNode;
  className?: string;
  borderClassName?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex size-20 rounded-xl bg-muted dark:bg-muted/50',
        className
      )}
    >
      <div
        role="presentation"
        className={cn('absolute inset-0 rounded-xl border', borderClassName)}
      />
      <div className="relative z-20 m-auto size-fit [&>*]:size-8 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default function Integration2Section() {
  return (
    <section>
      <div className="bg-muted/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center sm:grid-cols-2">
            <div className="relative mx-auto w-fit">
              <div className="mx-auto mb-2 flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <div className="rounded bg-muted-foreground/20 size-8" />
                </IntegrationCard>
                <IntegrationCard>
                  <div className="rounded bg-muted-foreground/20 size-8" />
                </IntegrationCard>
              </div>
              <div className="mx-auto my-2 flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <div className="rounded bg-muted-foreground/20 size-8" />
                </IntegrationCard>
                <IntegrationCard
                  borderClassName="border-black/25 dark:border-white/25"
                  className="dark:bg-muted"
                >
                  <Logo />
                </IntegrationCard>
                <IntegrationCard>
                  <div className="rounded bg-muted-foreground/20 size-8" />
                </IntegrationCard>
              </div>
              <div className="mx-auto flex w-fit justify-center gap-2">
                <IntegrationCard>
                  <div className="rounded bg-muted-foreground/20 size-8" />
                </IntegrationCard>
                <IntegrationCard>
                  <div className="rounded bg-muted-foreground/20 size-8" />
                </IntegrationCard>
              </div>
            </div>
            <div className="mx-auto mt-6 max-w-lg space-y-6 text-center sm:mt-0 sm:text-left">
              <h2 className="text-balance text-3xl font-semibold md:text-4xl">
                {m.title}
              </h2>
              <p className="text-muted-foreground">{m.description}</p>

              <div className="mt-12 flex flex-wrap justify-center gap-4 md:justify-start">
                <Link
                  to="/auth/login"
                  className={cn(buttonVariants({ size: 'lg' }))}
                >
                  <span>{m.primaryButton}</span>
                </Link>
                <Link
                  to="/"
                  hash="pricing"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' })
                  )}
                >
                  <span>{m.secondaryButton}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
