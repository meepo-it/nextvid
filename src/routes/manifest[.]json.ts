import { createFileRoute } from '@tanstack/react-router';
import { messages } from '@/config/messages';

/**
 * Dynamic Web App Manifest (PWA)
 * Serves /manifest.json with name/description from config instead of a static file
 * @see https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 * @see https://web.dev/add-manifest/
 */
export const Route = createFileRoute('/manifest.json')({
  server: {
    handlers: {
      GET: async () => {
        const body = {
          name: messages.site.title,
          short_name: messages.site.name,
          description: messages.site.description,
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#ffffff',
          icons: [
            { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        };
        return new Response(JSON.stringify(body), {
          headers: {
            'Content-Type': 'application/manifest+json',
          },
        });
      },
    },
  },
});
