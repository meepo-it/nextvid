/**
 * Friend links — reciprocal backlink badges shown in the footer.
 *
 * Each entry is the standard shields.io-style badge: a clickable anchor
 * wrapping an <img> of the partner site's badge art. Add new partners by
 * pasting the `href` they give you and the `imgSrc` of their badge.
 *
 * Leave the array empty to hide the entire footer row.
 */

export type FriendLink = {
  href: string;
  imgSrc: string;
  alt: string;
};

export const friendLinks: FriendLink[] = [
  {
    href: 'https://tanstack.com',
    imgSrc:
      'https://img.shields.io/badge/TanStack-Start-ef4444?style=for-the-badge&logo=react&logoColor=white',
    alt: 'TanStack',
  },
  {
    href: 'https://workers.cloudflare.com',
    imgSrc:
      'https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white',
    alt: 'Cloudflare Workers',
  },
];
