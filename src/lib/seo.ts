import { websiteConfig } from '@/config/website';
import { getCanonicalUrl, getBaseUrl, getOgImage, twitterHandleFromUrl } from '@/lib/urls';
import { locales, baseLocale } from '@/paraglide/runtime.js';

/**
 * Build metadata + canonical link for a page
 * @param path - The path of the page
 * @param options - The options for the page
 * @returns The metadata and canonical link
 */
export function seo(
  path: string,
  options: {
    title: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'article';
  }
) {
  const url = getCanonicalUrl(path);
  const image = options.image ?? getOgImage();
  return {
    meta: metadata({ ...options, url, image, type: options.type ?? 'website' }),
    links: [
      { rel: 'canonical', href: url },
      ...getHreflangLinks(path),
    ],
  };
}

export const metadata = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  type?: 'website' | 'article';
}) => {
  const twitterSite = websiteConfig.social?.twitter
    ? twitterHandleFromUrl(websiteConfig.social.twitter)
    : null;
  const metadata: Array<{
    title?: string;
    name?: string;
    property?: string;
    content?: string;
  }> = [
    { title },
    ...(description ? [{ name: 'description', content: description }] : []),
    ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
    // OG metadata
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    ...(description
      ? [{ property: 'og:description', content: description }]
      : []),
    ...(url ? [{ property: 'og:url', content: url }] : []),
    ...(image ? [{ property: 'og:image', content: image }] : []),
    // Twitter metadata (twitter:site = site's @username, not domain)
    { name: 'twitter:title', content: title },
    ...(twitterSite ? [{ name: 'twitter:site', content: twitterSite }] : []),
    ...(description
      ? [{ name: 'twitter:description', content: description }]
      : []),
    ...(url ? [{ name: 'twitter:url', content: url }] : []),
    ...(image
      ? [
          { name: 'twitter:card', content: 'summary_large_image' as const },
          { name: 'twitter:image', content: image },
        ]
      : []),
  ];
  return metadata;
};

/**
 * Generate hreflang alternate links for i18n SEO
 */
export function getHreflangLinks(path: string) {
  const base = getBaseUrl().replace(/\/$/, '');
  return [
    ...locales.map((locale) => ({
      rel: 'alternate' as const,
      hrefLang: locale,
      href: `${base}${locale === baseLocale ? '' : `/${locale}`}${path}`,
    })),
    {
      rel: 'alternate' as const,
      hrefLang: 'x-default',
      href: `${base}${path}`,
    },
  ];
}
