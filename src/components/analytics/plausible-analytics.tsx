import { ClientScript } from '@/components/shared/client-script';
import { clientEnv } from '@/env/client';

/**
 * Plausible Analytics
 * https://plausible.io
 */
export function PlausibleAnalytics() {
  if (!import.meta.env.PROD) return null;
  const script = clientEnv.VITE_PLAUSIBLE_SCRIPT;
  if (!script) return null;

  return <ClientScript src={script} defer async />;
}
