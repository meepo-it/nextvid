import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/** Social link key for UI to map to icon component */
export interface SocialLinkItem extends Pick<MenuItemConfig, 'title' | 'href'> {
  key:
    | 'github'
    | 'twitter'
    | 'blueSky'
    | 'mastodon'
    | 'discord'
    | 'youtube'
    | 'linkedin'
    | 'facebook'
    | 'instagram'
    | 'tiktok'
    | 'telegram'
    | 'email';
}

/**
 * Social links
 */
export function getSocialLinks(): SocialLinkItem[] {
  const social: SocialLinkItem[] = [];
  const config = websiteConfig.social;

  if (config?.github) {
    social.push({ title: 'GitHub', href: config.github, key: 'github' });
  }
  if (config?.twitter) {
    social.push({ title: 'Twitter', href: config.twitter, key: 'twitter' });
  }
  if (config?.blueSky) {
    social.push({ title: 'Bluesky', href: config.blueSky, key: 'blueSky' });
  }
  if (config?.mastodon) {
    social.push({ title: 'Mastodon', href: config.mastodon, key: 'mastodon' });
  }
  if (config?.discord) {
    social.push({ title: 'Discord', href: config.discord, key: 'discord' });
  }
  if (config?.youtube) {
    social.push({ title: 'YouTube', href: config.youtube, key: 'youtube' });
  }
  if (config?.linkedin) {
    social.push({ title: 'LinkedIn', href: config.linkedin, key: 'linkedin' });
  }
  if (config?.facebook) {
    social.push({ title: 'Facebook', href: config.facebook, key: 'facebook' });
  }
  if (config?.instagram) {
    social.push({ title: 'Instagram', href: config.instagram, key: 'instagram' });
  }
  if (config?.tiktok) {
    social.push({ title: 'TikTok', href: config.tiktok, key: 'tiktok' });
  }
  if (config?.telegram) {
    social.push({ title: 'Telegram', href: config.telegram, key: 'telegram' });
  }
  const supportEmail = websiteConfig.mail?.supportEmail;
  if (supportEmail) {
    const href = supportEmail.includes('<')
      ? supportEmail.replace(/^[^<]*<([^>]*)>.*$/, 'mailto:$1')
      : `mailto:${supportEmail}`;
    social.push({ title: 'Email', href, key: 'email' });
  }
  return social;
}
