import { getFooterLinks } from '@/config/footer-config';
import { getSocialLinks } from '@/config/social-config';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { Logo } from '@/components/shared/logo';
import { Link, useLocation } from '@tanstack/react-router';
import { websiteConfig } from '@/config/website';
import * as m from '@/paraglide/messages.js';
import { FooterNewsletter } from '@/components/layout/footer-newsletter';
import { FooterFriendLinks } from '@/components/layout/footer-friend-links';
import { FooterLocaleSwitcher } from '@/components/locale/footer-locale-switcher';
import { ModeSwitcher } from '@/components/theme/mode-switcher';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = useLocation().pathname;
  const footerLinks = getFooterLinks();
  const socialLinks = getSocialLinks();

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-6">
          <div className="col-span-full flex flex-col items-start md:col-span-2">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold">
                {websiteConfig.metadata?.name}
              </span>
            </div>
            <p className="text-muted-foreground text-base py-2 md:pr-12">
              {m.footer_tagline()}
            </p>

            <nav
              aria-label="Social links"
              className="flex items-center gap-3 pt-2"
            >
              {socialLinks?.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.title}
                    href={link.href ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.title}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                  </a>
                );
              })}
            </nav>
          </div>

          {footerLinks?.map((section) => (
            <div
              key={section.title}
              className="col-span-1 md:col-span-1 flex flex-col items-start"
            >
              <span className="text-sm font-semibold uppercase">
                {section.title}
              </span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (item) =>
                    item.href && (
                      <li key={item.title}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:text-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
                          >
                            {item.title}
                          </a>
                        ) : (
                          <Link
                            to={item.href}
                            data-active={
                              item.href.includes('#')
                                ? undefined
                                : isLinkActive(item.href, pathname)
                                  ? 'true'
                                  : undefined
                            }
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:text-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
                          >
                            {item.title}
                          </Link>
                        )}
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* Subscribe + locale switcher — sticky */}
      <div className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm">
        <Container className="px-4 flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          {websiteConfig.newsletter?.enable && <FooterNewsletter />}
          <FooterLocaleSwitcher />
        </Container>
      </div>

      {/* Friend links — reciprocal badge marquee. Collapses if unconfigured. */}
      <FooterFriendLinks />

      {/* Copyright + theme switcher */}
      <div className="border-t">
        <Container className="px-4 flex items-center justify-between py-4">
          <span className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {websiteConfig.metadata?.name}.{' '}
            {m.footer_rights_reserved()}
          </span>
          <ModeSwitcher />
        </Container>
      </div>
    </footer>
  );
}
