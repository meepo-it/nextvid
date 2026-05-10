import { getNavbarLinks } from '@/config/navbar-config.tsx';
import { useScroll } from '@/hooks/use-scroll';
import { authClient } from '@/auth/client';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { Routes } from '@/lib/routes';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Skeleton } from '@/components/ui/skeleton';
import Container from '@/components/layout/container';
import { Logo } from '@/components/shared/logo';
import { ModeSwitcher } from '@/components/theme/mode-switcher';
import { LocaleSwitcher } from '@/components/locale/locale-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { UserButton } from '@/components/shared/user-button';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import {
  IconArrowBigRightFilled,
  IconArrowUpRight,
  IconCoins,
  IconPhoto,
} from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useUserCredit } from '@/hooks/use-video';
import { websiteConfig } from '@/config/website';
import * as m from '@/paraglide/messages.js';

interface NavbarProps {
  scroll?: boolean;
}

export function Navbar({ scroll = true }: NavbarProps) {
  const pathname = useLocation().pathname;
  const scrolled = useScroll(50);
  const menuLinks = getNavbarLinks();
  const [mounted, setMounted] = useState(false);
  const [menuValue, setMenuValue] = useState<string | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const { data: creditData } = useUserCredit();
  const showBarBg = scroll && scrolled;

  // Sync mount (avoid auth hydration mismatch) and close menu on route change
  useEffect(() => {
    setMounted(true);
    setMenuValue(null);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-3 transition-all duration-300',
        showBarBg && 'border-b'
      )}
    >
      {showBarBg && (
        <div
          className="absolute inset-0 z-0 bg-muted/50 backdrop-blur-md"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">
        <Container className="px-4">
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex lg:items-center lg:justify-between lg:gap-8"
          >
            <Link
              to="/"
              aria-label="Home"
              className="flex items-center gap-2 shrink-0"
            >
              <Logo className="rounded-none" />
              <span className="text-2xl font-semibold">
                {websiteConfig.metadata?.name}
              </span>
            </Link>

            <NavigationMenu
              value={menuValue}
              onValueChange={setMenuValue}
              className="flex-1 justify-center"
            >
              <NavigationMenuList>
                {menuLinks?.map((item) =>
                  item.items ? (
                    <NavigationMenuItem key={item.title} value={item.title}>
                      <NavigationMenuTrigger
                        className={cn(
                          'bg-transparent text-base',
                          item.items.some((sub) =>
                            isLinkActive(sub.href, pathname)
                          ) && 'font-semibold text-foreground'
                        )}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-100 gap-3 p-3 md:w-125 md:grid-cols-2 lg:w-150">
                          {item.items.map((sub) => (
                            <li key={sub.title}>
                              <NavigationMenuLink
                                closeOnClick
                                className={cn(
                                  'group flex select-none flex-row items-center gap-4 rounded-md',
                                  'p-2 leading-none no-underline outline-hidden transition-colors',
                                  'hover:bg-accent hover:text-accent-foreground',
                                  'focus:bg-accent focus:text-accent-foreground',
                                  isLinkActive(sub.href, pathname) &&
                                    'bg-accent text-accent-foreground'
                                )}
                                render={
                                  <Link
                                    to={sub.href ?? '#'}
                                    target={sub.external ? '_blank' : undefined}
                                    rel={
                                      sub.external
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                  />
                                }
                              >
                                {sub.icon ? (
                                  <sub.icon className="size-4 shrink-0" />
                                ) : null}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">
                                    {sub.title}
                                  </div>
                                  {sub.description ? (
                                    <p className="text-xs text-muted-foreground">
                                      {sub.description}
                                    </p>
                                  ) : null}
                                </div>
                                {sub.external ? (
                                  <IconArrowUpRight className="size-4 shrink-0" />
                                ) : null}
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink
                        render={<Link to={item.href ?? '#'} />}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          'bg-transparent text-base',
                          isLinkActive(item.href, pathname) &&
                            'font-semibold text-primary'
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-3 shrink-0">
              <LocaleSwitcher />
              <ModeSwitcher />
              {websiteConfig.auth?.enable &&
                (!mounted || isPending ? (
                  <Skeleton className="size-8 rounded-full" />
                ) : user ? (
                  <>
                    {/* Credits pill */}
                    <Link
                      to={Routes.SettingsCredits}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-1.5',
                        'border-amber-300 bg-amber-50 text-amber-700 text-sm font-semibold',
                        'hover:bg-amber-100 transition-colors',
                        'dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40'
                      )}
                    >
                      <IconCoins className="size-4 shrink-0" />
                      <span>{creditData?.credits ?? '—'}</span>
                    </Link>

                    {/* Creations button */}
                    <Link
                      to={Routes.Creations}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-1.5',
                        'border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold',
                        'hover:bg-blue-100 transition-colors',
                        'dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'
                      )}
                    >
                      <IconPhoto className="size-4 shrink-0" />
                      <span>Creations</span>
                    </Link>

                    <UserButton user={user} />
                  </>
                ) : (
                  <LoginWrapper mode="modal" asChild>
                    <button
                      type="button"
                      className="group flex items-center gap-2 rounded-full border border-violet-300 bg-violet-100/80 px-5 py-2 shadow-sm transition-all hover:scale-[1.03] hover:border-violet-400 hover:bg-violet-200/70 hover:shadow-md hover:shadow-violet-300/50 active:scale-95 dark:border-violet-700/60 dark:bg-violet-900/30 dark:hover:border-violet-600 dark:hover:bg-violet-800/40"
                    >
                      <IconArrowBigRightFilled className="size-3.5 shrink-0 text-violet-500 transition-colors group-hover:text-violet-600" />
                      <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold text-transparent transition-all group-hover:from-violet-700 group-hover:to-fuchsia-700">
                        Get Started
                      </span>
                    </button>
                  </LoginWrapper>
                ))}
            </div>
          </nav>

          <NavbarMobile className="lg:hidden" />
        </Container>
      </div>
    </header>
  );
}
