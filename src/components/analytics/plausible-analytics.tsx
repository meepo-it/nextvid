import { ScriptInject } from './script-inject'

/**
 * Plausible Analytics
 * https://plausible.io
 * Set VITE_PLAUSIBLE_DOMAIN and VITE_PLAUSIBLE_SCRIPT in .env.production
 */
export function PlausibleAnalytics() {
  if (!import.meta.env.PROD) return null
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  const script = import.meta.env.VITE_PLAUSIBLE_SCRIPT
  if (!domain || !script) return null

  return (
    <ScriptInject
      src={script}
      defer
      dataAttributes={{ domain }}
    />
  )
}
