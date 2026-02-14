import { ScriptInject } from './script-inject'

/**
 * Umami Analytics
 * https://umami.is
 * Set VITE_UMAMI_WEBSITE_ID and VITE_UMAMI_SCRIPT in .env.production
 */
export function UmamiAnalytics() {
  if (!import.meta.env.PROD) return null
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
  const script = import.meta.env.VITE_UMAMI_SCRIPT
  if (!websiteId || !script) return null

  return (
    <ScriptInject
      src={script}
      async
      dataAttributes={{ websiteId }}
    />
  )
}
