import { getFooterLinks } from '@/config/footer-config';
import { getSocialLinks } from '@/config/social-config';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { SocialIcon } from '@/components/layout/social-icons';
import { Link } from '@tanstack/react-router';
import { websiteConfig } from '@/config/website';
import { messages } from '@/config/messages';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
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
              {messages.footer.tagline}
            </p>
            <div className="flex items-center gap-4 py-2">
              {socialLinks?.map((link) => (
                <a
                  key={link.key}
                  href={link.href ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.title}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <SocialIcon iconKey={link.key} className="size-4" />
                </a>
              ))}
            </div>
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
                        <Link
                          to={item.href}
                          target={item.external ? '_blank' : undefined}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {item.title}
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t py-8">
        <Container className="px-4 flex items-center justify-between gap-x-4">
          <span className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {websiteConfig.metadata?.name}{' '}
            {messages.footer.rightsReserved}
          </span>
        </Container>
      </div>
    </footer>
  );
}
