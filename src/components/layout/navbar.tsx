import { getNavbarLinks } from '@/config/navbar-config'
import { useScroll } from '@/hooks/use-scroll'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Routes } from '@/routes'
import { buttonVariants } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Skeleton } from '@/components/ui/skeleton'
import Container from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { ModeSwitcher } from '@/components/layout/mode-switcher'
import { NavbarIcon } from '@/components/layout/navbar-icons'
import { NavbarMobile } from '@/components/layout/navbar-mobile'
import { UserButton } from '@/components/layout/user-button'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

const navTriggerStyle = cn(
  'relative bg-transparent text-muted-foreground cursor-pointer',
  'hover:bg-accent hover:text-accent-foreground',
  'data-active:font-semibold data-active:bg-transparent data-active:text-accent-foreground',
  'rounded-lg px-2.5 py-1.5 text-sm font-medium'
)

interface NavbarProps {
  scroll?: boolean
}

const APP_NAME = 'MkFast'

export function Navbar({ scroll = true }: NavbarProps) {
  const scrolled = useScroll(50)
  const menuLinks = getNavbarLinks()
  const location = useLocation()
  const pathname = location.pathname
  const [mounted, setMounted] = useState(false)
  const { data: session, isPending } = authClient.useSession()
  const currentUser = session?.user

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      className={cn(
        'sticky inset-x-0 top-0 z-40 py-4 transition-all duration-300',
        scroll
          ? scrolled
            ? 'bg-muted/50 backdrop-blur-md border-b'
            : 'bg-transparent'
          : 'border-b bg-muted/50'
      )}
    >
      <Container className="px-4">
        <nav className="hidden lg:flex">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold">{APP_NAME}</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center space-x-2">
            <NavigationMenu className="relative">
              <NavigationMenuList className="flex items-center">
                {menuLinks?.map((item, index) =>
                  item.items ? (
                    <NavigationMenuItem key={index} className="relative">
                      <NavigationMenuTrigger
                        data-active={
                          item.items.some(
                            (sub) =>
                              sub.href &&
                              (sub.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(sub.href))
                          )
                            ? 'true'
                            : undefined
                        }
                        className={navTriggerStyle}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-4 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.items?.map((subItem, subIndex) => {
                            const isActive =
                              subItem.href &&
                              (subItem.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(subItem.href))
                            return (
                              <li key={subIndex}>
                                <NavigationMenuLink
                                  render={
                                    <Link
                                      to={subItem.href ?? '#'}
                                      target={subItem.external ? '_blank' : undefined}
                                      rel={
                                        subItem.external
                                          ? 'noopener noreferrer'
                                          : undefined
                                      }
                                      className={cn(
                                        'group flex select-none flex-row items-center gap-4 rounded-md p-2 leading-none no-underline outline-hidden transition-colors',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        isActive && 'bg-accent text-accent-foreground'
                                      )}
                                    >
                                      <div className="flex size-8 shrink-0 items-center justify-center">
                                        {subItem.icon
                                          ? (
                                              <subItem.icon
                                                className="size-4 text-muted-foreground group-hover:text-accent-foreground"
                                              />
                                            )
                                          : null}
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">
                                          {subItem.title}
                                        </div>
                                        {subItem.description && (
                                          <div className="text-sm text-muted-foreground">
                                            {subItem.description}
                                          </div>
                                        )}
                                      </div>
                                      {subItem.external && (
                                        <NavbarIcon
                                          name="ArrowUpRight"
                                          className="size-4 shrink-0"
                                        />
                                      )}
                                    </Link>
                                  }
                                />
                              </li>
                            )
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        render={
                          <Link
                            to={item.href ?? '#'}
                            target={item.external ? '_blank' : undefined}
                            rel={
                              item.external ? 'noopener noreferrer' : undefined
                            }
                            data-active={
                              item.href
                                ? item.href === '/'
                                  ? pathname === '/'
                                  : pathname.startsWith(item.href)
                                : false
                            }
                            className={navTriggerStyle}
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
          </div>

          <div className="flex items-center gap-x-4">
            <ModeSwitcher />
            {!mounted || isPending ? (
              <Skeleton className="size-8 rounded-full" />
            ) : currentUser ? (
              <UserButton user={currentUser} />
            ) : (
              <div className="flex items-center gap-x-4">
                <Link
                  to={Routes.Login}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Log in
                </Link>
                <Link
                  to={Routes.Register}
                  className={cn(buttonVariants({ size: 'sm' }))}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>

        <NavbarMobile className="lg:hidden" />
      </Container>
    </section>
  )
}
