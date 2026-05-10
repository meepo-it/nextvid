'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import {
  IconTarget,
  IconVideo,
  IconShoppingBag,
  IconBriefcase,
  IconMovie,
  IconHash,
} from '@tabler/icons-react';

// ── Color tokens: light tinted icon box + colored icon ───────────────────────

const COLOR = {
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    category: 'text-violet-600 dark:text-violet-400',
    shadow: 'hover:shadow-[0_16px_40px_-12px_rgb(124_58_237/0.18)]',
    border: 'hover:border-violet-200 dark:hover:border-violet-800',
  },
  sky: {
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
    category: 'text-sky-600 dark:text-sky-400',
    shadow: 'hover:shadow-[0_16px_40px_-12px_rgb(14_165_233/0.18)]',
    border: 'hover:border-sky-200 dark:hover:border-sky-800',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    category: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'hover:shadow-[0_16px_40px_-12px_rgb(5_150_105/0.18)]',
    border: 'hover:border-emerald-200 dark:hover:border-emerald-800',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    category: 'text-amber-600 dark:text-amber-400',
    shadow: 'hover:shadow-[0_16px_40px_-12px_rgb(245_158_11/0.18)]',
    border: 'hover:border-amber-200 dark:hover:border-amber-800',
  },
  fuchsia: {
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
    iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
    category: 'text-fuchsia-600 dark:text-fuchsia-400',
    shadow: 'hover:shadow-[0_16px_40px_-12px_rgb(192_38_211/0.18)]',
    border: 'hover:border-fuchsia-200 dark:hover:border-fuchsia-800',
  },
  indigo: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    category: 'text-indigo-600 dark:text-indigo-400',
    shadow: 'hover:shadow-[0_16px_40px_-12px_rgb(79_70_229/0.18)]',
    border: 'hover:border-indigo-200 dark:hover:border-indigo-800',
  },
} as const;

// ── Use case data ─────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    id: 1,
    icon: IconTarget,
    colorKey: 'violet' as const,
    categoryEn: 'Advertising',
    categoryZh: '广告投放',
    titleEn: 'Video Ad Creative',
    titleZh: '视频广告创意',
    descEn: 'From brief to launch-ready creative — no production team needed.',
    descZh: '从需求到可投放素材，无需外包团队，全程 AI 生成。',
    tagsEn: ['A/B Test', 'Multi-platform', 'Low cost'],
    tagsZh: ['A/B测试', '多平台适配', '低成本'],
  },
  {
    id: 2,
    icon: IconVideo,
    colorKey: 'sky' as const,
    categoryEn: 'Content Creation',
    categoryZh: '内容创作',
    titleEn: 'Short-Form Content',
    titleZh: '短视频内容',
    descEn:
      'Keep your feed alive with a steady stream of scroll-stopping clips.',
    descZh: '持续产出高质量短视频，让你的主页始终保持活跃。',
    tagsEn: ['B-roll', 'Fast', 'Multi-style'],
    tagsZh: ['B-roll素材', '极速产出', '风格多样'],
  },
  {
    id: 3,
    icon: IconShoppingBag,
    colorKey: 'emerald' as const,
    categoryEn: 'E-commerce',
    categoryZh: '电子商务',
    titleEn: 'Product Showcase',
    titleZh: '产品展示视频',
    descEn: 'Every product deserves a video — now possible at any scale.',
    descZh: '每件产品都值得有展示视频，AI 让这变得唾手可得。',
    tagsEn: ['Image→Video', 'Conversion', 'Scale'],
    tagsZh: ['图转视频', '提升转化', '规模化'],
  },
  {
    id: 4,
    icon: IconBriefcase,
    colorKey: 'amber' as const,
    categoryEn: 'Brand Marketing',
    categoryZh: '品牌营销',
    titleEn: 'Brand Content',
    titleZh: '品牌内容营销',
    descEn: 'Build a consistent visual identity across every campaign, fast.',
    descZh: '在每一次营销活动中，快速建立统一有质感的品牌视觉。',
    tagsEn: ['Brand', 'Campaign', 'In-house'],
    tagsZh: ['品牌一致性', '快速响应', '独立制作'],
  },
  {
    id: 5,
    icon: IconMovie,
    colorKey: 'fuchsia' as const,
    categoryEn: 'Film & Creative',
    categoryZh: '影视创作',
    titleEn: 'Film & Music Videos',
    titleZh: '短片与音乐视频',
    descEn: 'Turn your vision into moving images — no crew, no budget ceiling.',
    descZh: '把脑海中的画面变成真实影像，无需摄制组，没有预算上限。',
    tagsEn: ['Storyboard', 'MV', 'No limits'],
    tagsZh: ['故事板', '音乐视频', '创意无限'],
  },
  {
    id: 6,
    icon: IconHash,
    colorKey: 'indigo' as const,
    categoryEn: 'Social Media',
    categoryZh: '社交媒体运营',
    titleEn: 'Social Media Ops',
    titleZh: '社媒内容运营',
    descEn:
      'Stay relevant on every platform — produce content at the speed of trends.',
    descZh: '紧跟每个平台节奏，以热点速度产出优质内容。',
    tagsEn: ['TikTok', 'Reels', 'Trending'],
    tagsZh: ['抖音', 'Reels', '热点'],
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function UseCases() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <BlurFade inView delay={0}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {isZh ? '适用场景' : 'Use Cases'}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isZh ? '适用于每一种视频场景' : 'Built for every video use case'}
            </h2>
          </BlurFade>
          <BlurFade inView delay={0.08}>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              {isZh
                ? '从广告创意到艺术创作，各类视频需求，一站解决'
                : 'From ad creatives to artistic films — every video use case, one tool'}
            </p>
          </BlurFade>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((item, i) => {
            const Icon = item.icon;
            const c = COLOR[item.colorKey];
            return (
              <BlurFade key={item.id} inView delay={0.1 + i * 0.04}>
                <div
                  className={cn(
                    'group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5',
                    c.shadow,
                    c.border
                  )}
                >
                  {/* Icon — light tinted bg, colored icon */}
                  <div
                    className={cn(
                      'mb-5 flex size-11 items-center justify-center rounded-xl',
                      c.iconBg
                    )}
                  >
                    <Icon
                      className={cn('size-5', c.iconText)}
                      strokeWidth={1.75}
                    />
                  </div>

                  {/* Category */}
                  <p
                    className={cn(
                      'mb-1.5 text-xs font-semibold uppercase tracking-widest',
                      c.category
                    )}
                  >
                    {isZh ? item.categoryZh : item.categoryEn}
                  </p>

                  {/* Title */}
                  <h3 className="mb-3 text-lg font-bold leading-snug text-foreground">
                    {isZh ? item.titleZh : item.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {isZh ? item.descZh : item.descEn}
                  </p>

                  {/* Tags */}
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {(isZh ? item.tagsZh : item.tagsEn).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
