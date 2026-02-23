import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { IconArrowRight } from '@tabler/icons-react';

const m = {
  title: 'Ship Faster, Cost Less',
  description:
    'The complete TanStack Start boilerplate for building profitable SaaS, packed with AI, auth, payments, database, storage, email, newsletter, blog, dashboard, SEO and more, fully deployed on Cloudflare Workers',
  introduction: 'Introducing TanStack Starter',
  primary: 'Get Started',
  secondary: 'View Pricing',
};

export default function HeroSection() {
  return (
    <main id="hero" className="overflow-hidden">
      {/* background, light shadows on top of the hero section */}
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
      </div>

      <section>
        <div className="relative pt-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
              {/* introduction */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-accent group mx-auto flex w-fit items-center gap-2 rounded-full border p-1 pl-4"
              >
                <span className="text-foreground text-sm">
                  {m.introduction}
                </span>
                <div className="size-6 overflow-hidden rounded-full duration-500">
                  <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                    <span className="flex size-6">
                      <IconArrowRight className="m-auto size-3" />
                    </span>
                    <span className="flex size-6">
                      <IconArrowRight className="m-auto size-3" />
                    </span>
                  </div>
                </div>
              </a>

              {/* title */}
              <h1 className="font-heading mt-8 text-balance text-5xl font-bold lg:mt-16 xl:text-[5rem]">
                {m.title}
              </h1>

              {/* description */}
              <p className="mx-auto mt-8 max-w-5xl text-balance text-lg text-muted-foreground">
                {m.description}
              </p>

              {/* action buttons */}
              <div className="mt-12 flex flex-row items-center justify-center gap-4">
                <div className="bg-foreground/10 rounded-xl">
                  <Link
                    to="/auth/login"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'h-10.5 rounded-xl px-5 text-base'
                    )}
                  >
                    <span className="text-nowrap">{m.primary}</span>
                  </Link>
                </div>
                <Link
                  to="/"
                  hash="pricing"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    'h-10.5 rounded-xl px-5'
                  )}
                >
                  <span className="text-nowrap">{m.secondary}</span>
                </Link>
              </div>
            </div>

            {/* images */}
            <div className="relative overflow-hidden px-2 my-8 sm:my-12 md:my-16">
              <div className="inset-shadow-2xs ring-muted/50 dark:inset-shadow-white/20 bg-muted/50 relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                <img
                  className="bg-muted/50 relative hidden rounded-2xl dark:block w-full"
                  src="https://cdn.mksaas.com/blocks/music.png"
                  alt="website screenshot"
                />
                <img
                  className="z-2 border-border/25 relative rounded-2xl border dark:hidden w-full"
                  src="https://cdn.mksaas.com/blocks/music-light.png"
                  alt="App screen"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
