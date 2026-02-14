import { ScriptInject } from './script-inject'

/**
 * Ahrefs Analytics
 * https://ahrefs.com
 * Set VITE_AHREFS_WEBSITE_ID in .env.production
 */
export function AhrefsAnalytics() {
  if (!import.meta.env.PROD) return null
  const websiteId = import.meta.env.VITE_AHREFS_WEBSITE_ID
  if (!websiteId) return null

  return (
    <ScriptInject
      src="https://analytics.ahrefs.com/analytics.js"
      async
      dataAttributes={{ key: websiteId }}
    />
  )
}
