import { createFileRoute } from '@tanstack/react-router';
import { getBaseUrl } from '@/lib/urls';
import { getSortedPosts } from '@/lib/blog';
import { websiteConfig } from '@/config/website';
import { locales, baseLocale } from '@/paraglide/runtime.js';

/**
 * Dynamic sitemap.xml with i18n support
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const base = getBaseUrl().replace(/\/$/, '');
        const staticUrls: {
          path: string;
          changefreq?: string;
          priority?: string;
        }[] = [
          { path: '/', changefreq: 'daily', priority: '1.0' },
          { path: '/about', changefreq: 'monthly' },
          { path: '/contact', changefreq: 'monthly' },
          { path: '/terms', changefreq: 'monthly' },
          { path: '/privacy', changefreq: 'monthly' },
          { path: '/cookie', changefreq: 'monthly' },
        ];

        if (websiteConfig.blog?.enable) {
          staticUrls.push({ path: '/blog', changefreq: 'weekly' });
        }
        if (websiteConfig.payment?.enable) {
          staticUrls.push({ path: '/pricing', changefreq: 'weekly' });
        }

        const localizedUrl = (path: string, locale: string) => {
          const prefix = locale === baseLocale ? '' : `/${locale}`;
          return `${base}${prefix}${path === '/' && prefix ? '' : path}`;
        };

        const hreflangLinks = (path: string) =>
          locales
            .map(
              (l) =>
                `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${localizedUrl(path, l)}" />`
            )
            .join('') +
          `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(path, baseLocale)}" />`;

        const urlEntry = (
          path: string,
          locale: string,
          opts?: { changefreq?: string; priority?: string; lastmod?: string }
        ) => {
          const loc = localizedUrl(path, locale);
          const lastmod = opts?.lastmod
            ? `\n    <lastmod>${opts.lastmod}</lastmod>`
            : '';
          const changefreq = opts?.changefreq
            ? `\n    <changefreq>${opts.changefreq}</changefreq>`
            : '';
          const priority = opts?.priority
            ? `\n    <priority>${opts.priority}</priority>`
            : '';
          return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}${hreflangLinks(path)}\n  </url>`;
        };

        // Generate entries for each locale
        const staticPart = staticUrls
          .flatMap((u) =>
            locales.map((locale) =>
              urlEntry(u.path, locale, {
                changefreq: u.changefreq,
                priority: u.priority,
              })
            )
          )
          .join('\n');

        let blogPart = '';
        if (websiteConfig.blog?.enable) {
          const posts = getSortedPosts();
          blogPart = posts
            .flatMap((p) =>
              locales.map((locale) =>
                urlEntry(`/blog/${p.slug}`, locale, {
                  changefreq: 'weekly',
                  lastmod: new Date(p.date).toISOString().slice(0, 10),
                })
              )
            )
            .join('\n');
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPart}
${blogPart ? `\n${blogPart}` : ''}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
          },
        });
      },
    },
  },
});
