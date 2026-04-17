import { friendLinks } from '@/config/friend-links';
import Container from '@/components/layout/container';

/**
 * Horizontally-scrolling strip of reciprocal-backlink badges.
 * Returns null when no friends are configured so the row collapses entirely.
 */
export function FooterFriendLinks() {
  if (!friendLinks.length) return null;

  // Duplicate the list so the marquee can loop seamlessly.
  const items = [...friendLinks, ...friendLinks];

  return (
    <div className="group overflow-hidden py-3">
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
  );
}
