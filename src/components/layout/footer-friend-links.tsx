import { friendLinks } from '@/config/friend-links';
import Container from '@/components/layout/container';
import { IconChevronDown } from '@tabler/icons-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Horizontally-scrolling strip of reciprocal-backlink badges.
 * Returns null when no friends are configured so the row collapses entirely.
 */
export function FooterFriendLinks() {
  const [expanded, setExpanded] = useState(false);

  if (!friendLinks.length) return null;

  // Duplicate the list so the marquee can loop seamlessly.
  const items = [...friendLinks, ...friendLinks];

  return (
    <div>
      <Container className="px-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Friend Links</span>
          <IconChevronDown
            className={cn(
              'size-3.5 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </button>
      </Container>
      {expanded && (
        <div className="group overflow-hidden pb-3">
          <Container className="px-4">
            <div
              className="flex w-max items-center gap-4 animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]"
              aria-label="Friend links"
            >
              {items.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
                  aria-hidden={i >= friendLinks.length ? true : undefined}
                  tabIndex={i >= friendLinks.length ? -1 : undefined}
                >
                  <img
                    src={link.imgSrc}
                    alt={link.alt}
                    loading="lazy"
                    className="h-7"
                  />
                </a>
              ))}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
