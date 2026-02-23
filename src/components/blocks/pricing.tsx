import { HeaderSection } from '@/components/shared/header-section';
import { getPricePlans } from '@/lib/price-plan';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const m = {
  title: 'Pricing',
  subtitle: 'Simple pricing',
  description: 'Choose the plan that fits your needs',
};

export default function PricingSection() {
  const plans = getPricePlans();
  const planList = Object.entries(plans);

  return (
    <section id="pricing" className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-16 px-6">
        <HeaderSection
          subtitle={m.subtitle}
          subtitleAs="h2"
          subtitleClassName="text-4xl font-bold"
          description={m.description}
          descriptionAs="p"
        />

        <div className="grid gap-8 md:grid-cols-3">
          {planList.map(([key, plan]) => (
            <Card
              key={key}
              className={plan.popular ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader className="text-center">
                {plan.popular && (
                  <span className="text-sm font-medium text-primary">
                    Most popular
                  </span>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
                {plan.isFree ? (
                  <div className="mt-4 text-3xl font-bold">$0</div>
                ) : plan.prices[0] ? (
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ${(plan.prices[0].amount / 100).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.prices[0].interval === 'year' ? 'year' : 'month'}
                    </span>
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features?.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <IconCheck className="size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.isFree ? '/' : '/auth/register'}
                  className={cn(
                    buttonVariants({
                      variant: plan.popular ? 'default' : 'outline',
                    }),
                    'w-full'
                  )}
                >
                  {plan.isFree ? 'Get started' : 'Subscribe'}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
