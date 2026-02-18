/**
 * Website config types (no i18n). Used by website and other config modules.
 * Icon is React component (e.g. from @tabler/icons-react) for menu items.
 */
import type { ComponentType } from 'react';

/** Website config */
export interface WebsiteConfig {
  ui?: UiConfig;
  metadata?: MetadataConfig;
  social?: SocialConfig;
  features?: FeaturesConfig;
  routes?: RoutesConfig;
  analytics?: AnalyticsConfig;
  auth?: AuthConfig;
  blog?: BlogConfig;
  mail?: MailConfig;
  newsletter?: NewsletterConfig;
  storage?: StorageConfig;
  payment?: PaymentConfig;
  price?: PriceConfig;
}

/** UI configuration */
export interface UiConfig {
  mode?: {
    defaultMode?: 'light' | 'dark' | 'system';  // The default mode of the website
    enableSwitch?: boolean;                     // Whether to enable the mode switch
  };
}

/** Website metadata */
export interface MetadataConfig {
  images?: ImagesConfig;
}

/** Website metadata */
export interface ImagesConfig {
  ogImage?: string;     // The image as Open Graph image
  logoLight?: string;    // The light logo image
  logoDark?: string;    // The dark logo image
}

/** Social media configuration */
export interface SocialConfig {
  github?: string;
  twitter?: string;
  blueSky?: string;
  discord?: string;
  mastodon?: string;
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
}

/** Website features */
export interface FeaturesConfig {
  enableUpgradeCard?: boolean;      // Whether to enable the upgrade card in the sidebar
  enableUpdateAvatar?: boolean;     // Whether to enable the update avatar in settings
  enableCrispChat?: boolean;        // Whether to enable the crisp chat
  enableTurnstileCaptcha?: boolean; // Whether to enable turnstile captcha
}

/** Routes configuration */
export interface RoutesConfig {
  defaultLoginRedirect?: string;    // The default login redirect route
}

/** Analytics configuration */
export interface AnalyticsConfig {
  enable: boolean;                  // Whether to enable the analytics
}

/** Auth configuration */
export interface AuthConfig {
  enable: boolean;                // Whether to enable the auth
  enableGoogleLogin?: boolean;     // Whether to enable google login
  enableCredentialLogin?: boolean; // Whether to enable email/password login
}

/** Blog configuration */
export interface BlogConfig {
  enable: boolean;           // Whether to enable the blog
  paginationSize?: number;  // Number of posts per page
  relatedPostsSize?: number; // Number of related posts to show
}

/** Mail configuration */
export interface MailConfig {
  enable: boolean;         // Whether to enable the mail
  provider?: 'resend';       // The email provider, only resend is supported for now
  fromEmail?: string;       // The email address to send from
  supportEmail?: string;    // The email address to send support emails to
}

/** Newsletter configuration */
export interface NewsletterConfig {
  enable: boolean;                    // Whether to enable the newsletter
  provider?: 'resend' | 'beehiiv';    // The newsletter provider
  autoSubscribeAfterSignUp?: boolean; // Whether to automatically subscribe users after sign up
}

/** Storage configuration */
export interface StorageConfig {
  enable: boolean;   // Whether to enable the storage
  provider?: 'r2';   // The storage provider (e.g. R2)
}

/** Payment configuration */
export interface PaymentConfig {
  provider?: 'stripe';  // The payment provider, only stripe is supported for now
}

/** Price configuration - plans indexed by ID */
export interface PriceConfig {
  enable: boolean;   // Whether to enable the price
  plans: Record<string, PlanConfig>;
}

/** Plan config in websiteConfig.price.plans */
export interface PlanConfig {
  id: string;
  prices: PriceItemConfig[];
  isFree: boolean;
  isLifetime: boolean;
  popular?: boolean;
}

/** Price item for a plan (subscription or one-time) */
export interface PriceItemConfig {
  type: 'subscription' | 'one_time';
  priceId: string;
  amount: number;
  currency: string;
  interval?: 'month' | 'year';
  allowPromotionCode?: boolean;
}

/** Menu item for navbar links, sidebar links, footer links. */
export interface MenuItemConfig {
  title: string;                                   // The text to display
  description?: string;                             // The description of the item
  href?: string;                                    // The url to link to
  icon?: ComponentType<{ className?: string }>;     // The icon to display (e.g. from @tabler/icons-react)
  external?: boolean;                                // Whether the link is external
  authorizeOnly?: string[];                          // The roles that are authorized to see the item
  items?: MenuItemConfig[];                         // Nested items for dropdown/group
}
