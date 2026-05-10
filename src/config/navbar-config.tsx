import { Routes } from '@/lib/routes';
import * as m from '@/paraglide/messages.js';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

// Flagship models shown in the nav dropdown (one per brand)
const MODEL_NAV_ITEMS: MenuItemConfig[] = [
  {
    title: 'Seedance 2.0',
    description: 'Text & image to video · fast & natural motion',
    href: '/?model=seedance-2.0',
    icon: () => (
      <img
        src="/brands/seedance.svg"
        alt="Seedance"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'Kling v3',
    description: 'Text & image to video · cinematic quality',
    href: '/?model=kling-v3',
    icon: () => (
      <img
        src="/brands/kling.png"
        alt="Kling"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'HappyHorse 1.0',
    description: 'All generation types · 1080p · audio support',
    href: '/?model=happyhorse-1.0',
    icon: () => (
      <img
        src="/brands/happyhorse.png"
        alt="HappyHorse"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'Wan 2.7',
    description: 'Text & image to video · open-source power',
    href: '/?model=wan2.7',
    icon: () => (
      <img
        src="/brands/wan.svg"
        alt="Wan"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'Hailuo 2.3',
    description: 'Text & image to video · ultra smooth',
    href: '/?model=hailuo-2.3',
    icon: () => (
      <img
        src="/brands/hailuo.png"
        alt="Hailuo"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'Vidu Q3 Pro',
    description: 'Text & image to video · reference support',
    href: '/?model=vidu-q3-pro',
    icon: () => (
      <img
        src="/brands/vidu.png"
        alt="Vidu"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'Veo 3 Fast',
    description: 'Text & image to video · Google DeepMind',
    href: '/?model=veo3-fast',
    icon: () => (
      <img
        src="/brands/veo.png"
        alt="Veo"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
  {
    title: 'SkyReels v4',
    description: 'Text & image to video · 1080p · film style',
    href: '/?model=skyreels-v4-fast',
    icon: () => (
      <img
        src="/brands/skyreel.png"
        alt="SkyReels"
        className="size-5 rounded object-contain"
      />
    ),
    external: false,
  },
];

/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  const links: MenuItemConfig[] = [
    {
      title: 'Models',
      items: MODEL_NAV_ITEMS,
    },
  ];

  if (websiteConfig.payment?.enable) {
    links.push({
      title: m.nav_pricing(),
      href: Routes.Pricing,
      external: false,
    });
  }

  return links;
}
