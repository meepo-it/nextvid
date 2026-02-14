import { env } from 'cloudflare:workers';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDb } from '@/db';
import { sendEmail } from '@/mail';
import { getBaseUrl } from '../lib/urls';

/**
 * Better Auth Drizzle Adapter
 * https://www.better-auth.com/docs/adapters/drizzle
 * https://www.better-auth.com/docs/reference/options
 */
export const auth = betterAuth({
  baseURL: getBaseUrl(),
  database: drizzleAdapter(getDb(env.DB), {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        template: 'forgotPassword',
        context: { url, name: user.name ?? '' },
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        template: 'verifyEmail',
        context: { url, name: user.name ?? '' },
      });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [tanstackStartCookies()],
});
