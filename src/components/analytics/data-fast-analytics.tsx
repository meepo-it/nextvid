import { ScriptInject } from './script-inject'

/**
 * DataFast Analytics
 * https://datafa.st
 * Set VITE_DATAFAST_DOMAIN and VITE_DATAFAST_WEBSITE_ID in .env.production
 */
export function DataFastAnalytics() {
  if (!import.meta.env.PROD) return null
  const domain = import.meta.env.VITE_DATAFAST_DOMAIN
  const websiteId = import.meta.env.VITE_DATAFAST_WEBSITE_ID
  if (!domain || !websiteId) return null

  return (
    <ScriptInject
      src="https://datafa.st/js/script.js"
      defer
      dataAttributes={{ websiteId, domain }}
    />
  )
}
