import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Analytics } from '@/components/analytics/analytics';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { TailwindIndicator } from '@/integrations/tailwindcss/tailwind-indicator';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { NotFound } from '@/components/layout/not-found';
import { Toaster } from '@/components/layout/toaster';
import { messages } from '@/config/messages';
import { websiteConfig } from '@/config/website';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';
import { DefaultCatchBoundary } from '@/components/layout/default-catch-boundary';

/**
 * https://github.com/backpine/tanstack-start-on-cloudflare/blob/main/src/routes/__root.tsx
 */
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: messages.site.title,
      },
      {
        name: 'description',
        content: messages.site.description,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  // shellComponent automatically wraps root component, errorComponent, and notFoundComponent
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: DefaultCatchBoundary,
});

const DEFAULT_THEME = websiteConfig.ui?.mode?.defaultMode ?? 'system';

/**
 * Root component (wrapped by shellComponent: RootDocument)
 * Only marketing pages get Navbar + Footer; auth/dashboard pages don't.
 */
function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname }) ?? '';
  const isAuth = pathname.startsWith('/auth');
  const isDashboard = pathname.startsWith('/dashboard');

  if (isAuth || isDashboard) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar scroll />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Root document
 */
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-default-theme={DEFAULT_THEME}
      className={DEFAULT_THEME === 'dark' ? 'dark' : undefined}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" offset={64} />
        </ThemeProvider>
        <TailwindIndicator />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}
