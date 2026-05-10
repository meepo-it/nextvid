'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import * as m from '@/paraglide/messages.js';
import {
  IconLetterT,
  IconPhoto,
  IconVideo,
  IconBolt,
  IconMusic,
  IconAdjustmentsHorizontal,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { ComponentType } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Shape {
  w: string;
  h: string;
  rounded: string;
  rotate: string;
  top: string;
  right: string;
  bg: string;
}

interface Feature {
  id: number;
  icon: ComponentType<{ className?: string }>;
  labelEn: string;
  labelZh: string;
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
  ctaEn: string;
  ctaZh: string;
  cardBg: string;
  badgeBorder: string;
  shapes: Shape[];
}

// ── Feature data ───────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    id: 1,
    icon: IconLetterT,
    labelEn: 'Multimodal Input',
    labelZh: '多模态输入',
    titleEn: 'Multimodal Input',
    titleZh: '多模态输入',
    descEn:
      'Combine text, images, and video references in a single generation. Control composition, motion, and tone simultaneously for precise creative output.',
    descZh:
      '在单次生成中同时使用文本、图像和视频参考。精确掌控构图、动作和色调，实现你的创意意图。',
    ctaEn: 'Start Creating',
    ctaZh: '开始创作',
    cardBg: 'bg-orange-50 dark:bg-orange-950/25',
    badgeBorder: 'border-orange-200 dark:border-orange-800',
    shapes: [
      {
        w: 'w-36',
        h: 'h-36',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: '-top-10',
        right: '-right-10',
        bg: 'bg-gradient-to-br from-orange-300/90 to-orange-500/20 dark:from-orange-600/50 dark:to-orange-900/10',
      },
      {
        w: 'w-20',
        h: 'h-28',
        rounded: 'rounded-3xl',
        rotate: 'rotate-45',
        top: 'top-6',
        right: '-right-3',
        bg: 'bg-gradient-to-tl from-orange-200/75 to-orange-100/20 dark:from-orange-700/30 dark:to-transparent',
      },
      {
        w: 'w-10',
        h: 'h-24',
        rounded: 'rounded-full',
        rotate: '-rotate-12',
        top: 'top-2',
        right: 'right-18',
        bg: 'bg-gradient-to-b  from-orange-300/50 to-transparent dark:from-orange-500/25 dark:to-transparent',
      },
    ],
  },
  {
    id: 2,
    icon: IconPhoto,
    labelEn: 'Image to Video',
    labelZh: '图像生成视频',
    titleEn: 'Image to Video',
    titleZh: '图像生成视频',
    descEn:
      'Bring static images to life with AI-powered animation. Upload any photo and let AI create natural, fluid motion with customizable duration and style.',
    descZh:
      '用 AI 动画让静态图片动起来。上传任意照片，AI 生成自然流畅的动作，时长和风格均可自定义。',
    ctaEn: 'Try It Now',
    ctaZh: '立即尝试',
    cardBg: 'bg-blue-50 dark:bg-blue-950/25',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    shapes: [
      {
        w: 'w-28',
        h: 'h-28',
        rounded: 'rounded-3xl',
        rotate: 'rotate-45',
        top: '-top-6',
        right: '-right-6',
        bg: 'bg-gradient-to-br from-blue-300/90 to-blue-500/20 dark:from-blue-600/50 dark:to-blue-900/10',
      },
      {
        w: 'w-36',
        h: 'h-36',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: '-top-4',
        right: 'right-8',
        bg: 'bg-gradient-to-bl from-blue-200/70 to-blue-400/15 dark:from-blue-700/30 dark:to-transparent',
      },
      {
        w: 'w-8',
        h: 'h-24',
        rounded: 'rounded-full',
        rotate: 'rotate-20',
        top: 'top-16',
        right: 'right-20',
        bg: 'bg-gradient-to-b  from-blue-300/55 to-transparent dark:from-blue-500/25 dark:to-transparent',
      },
    ],
  },
  {
    id: 3,
    icon: IconVideo,
    labelEn: 'Camera & Motion Control',
    labelZh: '镜头与运动控制',
    titleEn: 'Camera & Motion Control',
    titleZh: '镜头与运动控制',
    descEn:
      'Replicate camera trajectory, action pacing, and visual effects from reference videos. Supports dolly, tracking, and handheld movements.',
    descZh:
      '从参考视频中复现镜头轨迹、动作节奏和视觉效果。支持推轨、跟踪和手持等多种运动方式。',
    ctaEn: 'Explore Modes',
    ctaZh: '了解模式',
    cardBg: 'bg-violet-50 dark:bg-violet-950/25',
    badgeBorder: 'border-violet-200 dark:border-violet-800',
    shapes: [
      {
        w: 'w-32',
        h: 'h-32',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: '-top-8',
        right: 'right-4',
        bg: 'bg-gradient-to-br from-violet-300/90 to-violet-500/20 dark:from-violet-600/50 dark:to-violet-900/10',
      },
      {
        w: 'w-24',
        h: 'h-32',
        rounded: 'rounded-3xl',
        rotate: 'rotate-45',
        top: 'top-4',
        right: '-right-10',
        bg: 'bg-gradient-to-tl from-violet-200/75 to-violet-400/15 dark:from-violet-700/30 dark:to-transparent',
      },
      {
        w: 'w-24',
        h: 'h-8',
        rounded: 'rounded-full',
        rotate: '-rotate-6',
        top: 'top-22',
        right: 'right-12',
        bg: 'bg-gradient-to-r  from-violet-300/45 to-transparent dark:from-violet-500/20 dark:to-transparent',
      },
    ],
  },
  {
    id: 4,
    icon: IconBolt,
    labelEn: 'Video Extension',
    labelZh: '视频续写',
    titleEn: 'Video Extension',
    titleZh: '视频续写',
    descEn:
      'Extend videos forward or backward with seamless continuation. Characters, lighting, and camera perspective remain consistent across extended clips.',
    descZh: '前向或后向无缝续写视频，人物、光线和镜头视角保持高度一致。',
    ctaEn: 'Get Started',
    ctaZh: '开始创作',
    cardBg: 'bg-emerald-50 dark:bg-emerald-950/25',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    shapes: [
      {
        w: 'w-40',
        h: 'h-40',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: '-top-12',
        right: '-right-12',
        bg: 'bg-gradient-to-br from-emerald-300/90 to-emerald-500/20 dark:from-emerald-600/50 dark:to-emerald-900/10',
      },
      {
        w: 'w-16',
        h: 'h-32',
        rounded: 'rounded-2xl',
        rotate: 'rotate-12',
        top: 'top-4',
        right: '-right-2',
        bg: 'bg-gradient-to-bl from-emerald-200/75 to-emerald-400/15 dark:from-emerald-700/30 dark:to-transparent',
      },
      {
        w: 'w-14',
        h: 'h-14',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: '-top-3',
        right: 'right-20',
        bg: 'bg-gradient-to-br from-emerald-400/50 to-transparent dark:from-emerald-500/25 dark:to-transparent',
      },
    ],
  },
  {
    id: 5,
    icon: IconMusic,
    labelEn: 'Sound Effects & Music',
    labelZh: '音效与背景音乐',
    titleEn: 'Sound Effects & Music',
    titleZh: '音效与背景音乐',
    descEn:
      'Auto-generated sound effects and background music matching on-screen action. Upload reference audio for tone and rhythm guidance.',
    descZh:
      '自动生成与画面同步的音效和背景音乐，支持上传参考音频引导音调和节奏。',
    ctaEn: 'Try Audio',
    ctaZh: '尝试音频',
    cardBg: 'bg-rose-50 dark:bg-rose-950/25',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    shapes: [
      {
        w: 'w-32',
        h: 'h-32',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: '-top-8',
        right: '-right-6',
        bg: 'bg-gradient-to-br from-rose-300/90 to-rose-500/20 dark:from-rose-600/50 dark:to-rose-900/10',
      },
      {
        w: 'w-12',
        h: 'h-36',
        rounded: 'rounded-3xl',
        rotate: 'rotate-20',
        top: 'top-0',
        right: 'right-8',
        bg: 'bg-gradient-to-b  from-rose-200/75 to-rose-400/15 dark:from-rose-700/30 dark:to-transparent',
      },
      {
        w: 'w-20',
        h: 'h-8',
        rounded: 'rounded-full',
        rotate: '-rotate-15',
        top: 'top-20',
        right: 'right-16',
        bg: 'bg-gradient-to-r  from-rose-300/45 to-transparent dark:from-rose-500/20 dark:to-transparent',
      },
    ],
  },
  {
    id: 6,
    icon: IconAdjustmentsHorizontal,
    labelEn: 'Output Control',
    labelZh: '输出控制',
    titleEn: 'Output Control',
    titleZh: '输出控制',
    descEn:
      'Configure aspect ratio, duration, and generation mode. Transparent credit costs displayed before generation. Iterative workflow for quick refinement.',
    descZh:
      '自由配置宽高比、时长和生成模式。生成前透明展示积分消耗，快速迭代打磨效果。',
    ctaEn: 'View Pricing',
    ctaZh: '查看定价',
    cardBg: 'bg-amber-50 dark:bg-amber-950/25',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    shapes: [
      {
        w: 'w-36',
        h: 'h-36',
        rounded: 'rounded-3xl',
        rotate: 'rotate-45',
        top: '-top-10',
        right: '-right-8',
        bg: 'bg-gradient-to-br from-amber-300/90 to-amber-500/20 dark:from-amber-600/50 dark:to-amber-900/10',
      },
      {
        w: 'w-28',
        h: 'h-28',
        rounded: 'rounded-full',
        rotate: 'rotate-0',
        top: 'top-10',
        right: '-right-4',
        bg: 'bg-gradient-to-tl from-amber-200/75 to-amber-400/15 dark:from-amber-700/30 dark:to-transparent',
      },
      {
        w: 'w-10',
        h: 'h-28',
        rounded: 'rounded-full',
        rotate: '-rotate-20',
        top: '-top-4',
        right: 'right-20',
        bg: 'bg-gradient-to-b  from-amber-300/50 to-transparent dark:from-amber-500/20 dark:to-transparent',
      },
    ],
  },
];

// ── Decorative shapes ──────────────────────────────────────────────────────────

function Shapes({ feature }: { feature: Feature }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 w-2/5 overflow-hidden"
    >
      {feature.shapes.map((s, i) => (
        <div
          key={i}
          className={`absolute ${s.rounded} ${s.w} ${s.h} ${s.rotate} ${s.top} ${s.right} ${s.bg}`}
        />
      ))}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  isZh,
  delay,
}: {
  feature: Feature;
  isZh: boolean;
  delay: number;
}) {
  const Icon = feature.icon;
  return (
    <BlurFade inView delay={delay}>
      <div
        className={`relative h-full overflow-hidden rounded-3xl p-8 ${feature.cardBg}`}
      >
        <Shapes feature={feature} />

        {/* Badge */}
        <div
          className={`relative z-10 mb-6 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs ${feature.badgeBorder}`}
        >
          <Icon className="size-3.5 shrink-0" />
          {isZh ? feature.labelZh : feature.labelEn}
        </div>

        {/* Title */}
        <h3 className="relative z-10 mb-3 max-w-[60%] text-2xl font-bold leading-snug tracking-tight text-foreground">
          {isZh ? feature.titleZh : feature.titleEn}
        </h3>

        {/* Description */}
        <p className="relative z-10 mb-8 max-w-[65%] text-sm leading-relaxed text-foreground/60">
          {isZh ? feature.descZh : feature.descEn}
        </p>

        {/* CTA link */}
        <a
          href="/#pricing"
          className="relative z-10 inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
        >
          {isZh ? feature.ctaZh : feature.ctaEn} →
        </a>
      </div>
    </BlurFade>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

export default function FeaturesVideoV2() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <BlurFade inView delay={0}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {m.home_features_title()}
            </h2>
          </BlurFade>
          <BlurFade inView delay={0.1}>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              {m.home_features_description()}
            </p>
          </BlurFade>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isZh={isZh}
              delay={0.12 + i * 0.06}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
