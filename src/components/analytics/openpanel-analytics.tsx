import { useEffect } from 'react';
import { clientEnv } from '@/env/client';

/**
 * OpenPanel Analytics (self-hosted)
 * https://openpanel.dev/docs/sdks/react
 */
export function OpenPanelAnalytics() {
  const clientId = clientEnv.VITE_OPENPANEL_CLIENT_ID;
  const apiUrl = clientEnv.VITE_OPENPANEL_API_URL;

  useEffect(() => {
    if (!import.meta.env.PROD || !clientId || !apiUrl) return;

    import('@openpanel/web').then(({ OpenPanel }) => {
      new OpenPanel({
        clientId,
        apiUrl,
        trackScreenViews: true,
        trackOutgoingLinks: true,
        trackAttributes: true,
      });
    });
  }, [clientId, apiUrl]);

  return null;
}
