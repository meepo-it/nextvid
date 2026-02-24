import { getNavbarLinks } from '@/config/navbar-config';
import { useScroll } from '@/hooks/use-scroll';
import { authClient } from '@/auth/client';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { Routes } from '@/lib/routes';
import { buttonVariants } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Skeleton } from '@/components/ui/skeleton';
import Container from '@/components/layout/container';
import { Logo } from '@/components/shared/logo';
import { ModeSwitcher } from '@/components/theme/mode-switcher';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { UserButton } from '@/components/shared/user-button';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { websiteConfig } from '@/config/website';
import { messages } from '@/messages';

const navTriggerClass =
  'rounded-lg px-2.5 py-1.5 text-sm font-medium bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground data-active:font-semibold data-active:bg-transparent data-active:text-accent-foreground';

const navDropdownItemClass =
  'group flex items-center gap-4 rounded-md p-2 text-sm font-medium no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground';

interface NavbarProps {
  scroll?: boolean;
}

export function Navbar({ scroll = true }: NavbarProps) {
  const pathname = useLocation().pathname;
  const scrolled = useScroll(50);
  const menuLinks = getNavbarLinks();
  const [mounted, setMounted] = useState(false);
  const [menuValue, setMenuValue] = useState('');
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const showBarBg = scroll && scrolled;

  // Sync mount (avoid auth hydration mismatch) and close menu on route change
  useEffect(() => {
    setMounted(true);
    setMenuValue('');
  }, [pathname]);

  return (
    <section
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        showBarBg && 'border-b'
      )}
    >
      {showBarBg && (
        <div
          className="absolute inset-0 z-0 bg-muted/50 backdrop-blur-md"
          aria-hidden
        />
      )}
      <div className="relative z-10">
        <Container className="px-4">
          <nav className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Logo />
              <span className="text-xl font-semibold">
                {websiteConfig.metadata?.name}
              </span>
            </Link>

            <NavigationMenu
              value={menuValue}
              onValueChange={setMenuValue}
              className="flex-1 justify-center"
            >
              <NavigationMenuList className="flex items-center gap-1">
                {menuLinks?.map((item) =>
                  item.items ? (
                    <NavigationMenuItem
                      key={item.title}
                      value={item.title}
                      className="relative"
                    >
                      <NavigationMenuTrigger
                        data-active={
                          item.items.some((sub) =>
                            isLinkActive(sub.href, pathname)
                          )
                            ? 'true'
                            : undefined
                        }
                        className={navTriggerClass}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-4 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.items.map((sub) => (
                            <li key={sub.title}>
                              <NavigationMenuLink
                                closeOnClick
                                render={
                                  <Link
                                    to={sub.href ?? '#'}
                                    target={sub.external ? '_blank' : undefined}
                                    rel={
                                      sub.external
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                    className={cn(
                                      navDropdownItemClass,
                                      isLinkActive(sub.href, pathname) &&
                                        'bg-accent text-accent-foreground'
                                    )}
                                  >
                                    <div className="flex size-8 shrink-0 items-center justify-center">
                                      {sub.icon ? (
                                        <sub.icon className="size-4 text-muted-foreground group-hover:text-accent-foreground" />
                                      ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium">
                                        {sub.title}
                                      </div>
                                      {sub.description ? (
                                        <div className="text-sm text-muted-foreground">
                                          {sub.description}
                                        </div>
                                      ) : null}
                                    </div>
                                    {sub.external ? (
                                      <IconArrowUpRight className="size-4 shrink-0" />
                                    ) : null}
                                  </Link>
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink
                        render={
                          <Link
                            to={item.href ?? '#'}
                            target={item.external ? '_blank' : undefined}
                            rel={
                              item.external ? 'noopener noreferrer' : undefined
                            }
                            data-active={
                              isLinkActive(item.href, pathname)
                                ? 'true'
                                : undefined
                            }
                            className={navTriggerClass}
                          >
                            {item.title}
                          </Link>
                        }
                      />
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-4 shrink-0">
              <ModeSwitcher />
              {websiteConfig.auth?.enable &&
                (!mounted || isPending ? (
                  <Skeleton className="size-8 rounded-full" />
                ) : user ? (
                  <UserButton user={user} />
                ) : (
                  <>
                    <LoginWrapper mode="modal" asChild>
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({
                            variant: 'outline',
                            size: 'sm',
                          }),
                          'cursor-pointer'
                        )}
                      >
                        {messages.auth.common.login}
                      </button>
                    </LoginWrapper>
                    <Link
                      to={Routes.Register}
                      className={buttonVariants({ size: 'sm' })}
                    >
                      {messages.auth.common.signup}
                    </Link>
                  </>
                ))}
            </div>
          </nav>

          <NavbarMobile className="lg:hidden" />
        </Container>
      </div>
    </section>
  );
}
