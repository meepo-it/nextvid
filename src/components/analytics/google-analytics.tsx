import { ScriptInject } from './script-inject'

/**
 * Google Analytics (GA4)
 * https://analytics.google.com
 * Set VITE_GOOGLE_ANALYTICS_ID in .env.production
 */
export function GoogleAnalytics() {
  if (!import.meta.env.PROD) return null
  const id = import.meta.env.VITE_GOOGLE_ANALYTICS_ID
  if (!id) return null

  const inlineHtml = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  `
  return (
    <>
      <ScriptInject
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        async
      />
      <ScriptInject id="google-analytics" inlineHtml={inlineHtml} />
    </>
  )
}
