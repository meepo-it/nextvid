import { createAuthClient } from 'better-auth/react';
import { getBaseUrl } from '../lib/urls';

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});
