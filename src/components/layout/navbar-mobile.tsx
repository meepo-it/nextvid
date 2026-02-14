import { getNavbarLinks } from '@/config/navbar-config'
import { authClient } from '@/lib/auth-client'
import { Routes } from '@/routes'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Link, useLocation } from '@tanstack/react-router'
import { IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/layout/logo'
import { ModeSwitcher } from '@/components/layout/mode-switcher'
import { UserButton } from '@/components/layout/user-button'
import { cn } from '@/lib/utils'

const APP_NAME = 'MkFast'

export function NavbarMobile({
  className,
  ...other
}: React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = React.useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const [mounted, setMounted] = useState(false)
  const { data: session, isPending } = authClient.useSession()
  const currentUser = session?.user

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!mounted) return null

  return (
    <>
      <div
        className={cn('flex items-center justify-between', className)}
        {...other}
      >
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-semibold">{APP_NAME}</span>
        </Link>

        <div className="flex items-center justify-end gap-4">
          <ModeSwitcher />
          {isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : currentUser ? (
            <UserButton user={currentUser} />
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="size-8 rounded-md border"
          >
            {open ? (
              <IconX className="size-4" />
            ) : (
              <IconMenu2 className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[57px] z-50 overflow-y-auto bg-background">
          <div className="flex flex-col items-start space-y-4 p-4">
            {!currentUser && (
              <div className="flex w-full flex-col gap-4">
                <Link
                  to={Routes.Login}
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'w-full'
                  )}
                >
                  Log in
                </Link>
                <Link
                  to={Routes.Register}
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                >
                  Sign up
                </Link>
              </div>
            )}

            <ul className="w-full space-y-1">
              {getNavbarLinks()?.map((item) => {
                const isActive = item.href
                  ? item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                  : item.items?.some(
                      (sub) =>
                        sub.href &&
                        (sub.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(sub.href))
                    )

                return (
                  <li key={item.title} className="py-1">
                    {item.items ? (
                      <Collapsible>
                        <CollapsibleTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              className={cn(
                                'flex w-full items-center justify-between text-left',
                                'bg-transparent text-muted-foreground hover:text-foreground',
                                isActive && 'font-semibold text-foreground'
                              )}
                            >
                              <span className="text-base">{item.title}</span>
                              <IconChevronRight className="size-4" />
                            </Button>
                          }
                          nativeButton={false}
                        />
                        <CollapsibleContent className="pl-2">
                          <ul className="mt-2 space-y-2">
                            {item.items.map((subItem) => {
                              const isSubActive =
                                subItem.href &&
                                pathname.startsWith(subItem.href)
                              return (
                                <li key={subItem.title}>
                                  <Link
                                    to={subItem.href ?? '#'}
                                    target={
                                      subItem.external ? '_blank' : undefined
                                    }
                                    rel={
                                      subItem.external
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                      'flex w-full items-center gap-4 rounded-md p-2 text-sm',
                                      'text-muted-foreground hover:text-foreground',
                                      isSubActive && 'font-semibold text-foreground'
                                    )}
                                  >
                                    {subItem.icon
                                      ? (
                                          <subItem.icon className="size-4 shrink-0" />
                                        )
                                      : null}
                                    {subItem.title}
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        to={item.href ?? '#'}
                        target={item.external ? '_blank' : undefined}
                        rel={
                          item.external ? 'noopener noreferrer' : undefined
                        }
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex w-full items-center rounded-md p-2 text-base',
                          'text-muted-foreground hover:text-foreground',
                          isActive && 'font-semibold text-foreground'
                        )}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
