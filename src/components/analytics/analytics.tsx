import { AhrefsAnalytics } from './ahrefs-analytics'
import { ClarityAnalytics } from './clarity-analytics'
import { DataFastAnalytics } from './data-fast-analytics'
import { GoogleAnalytics } from './google-analytics'
import { PlausibleAnalytics } from './plausible-analytics'
import { UmamiAnalytics } from './umami-analytics'

/**
 * Unified analytics: renders all script-based analytics (only in production, when env vars are set).
 *
 * For Vercel Analytics / Speed Insights, install @vercel/analytics and @vercel/speed-insights
 * and add them here when needed.
 */
export function Analytics({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {import.meta.env.PROD && (
        <>
          <GoogleAnalytics />
          <UmamiAnalytics />
          <PlausibleAnalytics />
          <AhrefsAnalytics />
          <DataFastAnalytics />
          <ClarityAnalytics />
        </>
      )}
    </>
  )
}
