'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import * as m from '@/paraglide/messages.js';
import {
  IconLetterT,
  IconPhoto,
  IconVideo,
  IconBolt,
  IconShieldCheck,
  IconWorld,
} from '@tabler/icons-react';

const FEATURES = [
  {
    id: 1,
    icon: IconLetterT,
    titleEn: 'Multimodal Input',
    titleZh: '多模态输入',
    descEn:
      'Combine text, images, and video references in a single generation. Control composition, motion, and tone simultaneously for precise creative output.',
    descZh:
      '在单次生成中同时使用文本、图像和视频参考。精确掌控构图、动作和色调，实现你的创意意图。',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/25',
  },
  {
    id: 2,
    icon: IconPhoto,
    titleEn: 'Image to Video',
    titleZh: '图像生成视频',
    descEn:
      'Bring static images to life with AI-powered animation. Upload any photo and let AI create natural, fluid motion with customizable duration and style.',
    descZh:
      '用 AI 动画让静态图片动起来。上传任意照片，AI 生成自然流畅的动作，时长和风格均可自定义。',
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-950/25',
  },
  {
    id: 3,
    icon: IconVideo,
    titleEn: 'Camera & Motion Control',
    titleZh: '镜头与运动控制',
    descEn:
      'Replicate camera trajectory, action pacing, and visual effects from reference videos. Supports dolly, tracking, and handheld movements.',
    descZh:
      '从参考视频中复现镜头轨迹、动作节奏和视觉效果。支持推轨、跟踪和手持等多种运动方式。',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/25',
  },
  {
    id: 4,
    icon: IconBolt,
    titleEn: 'Video Extension',
    titleZh: '视频续写',
    descEn:
      'Extend videos forward or backward with seamless continuation. Characters, lighting, and camera perspective remain consistent across extended clips.',
    descZh: '前向或后向无缝续写视频，人物、光线和镜头视角保持高度一致。',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-950/25',
  },
  {
    id: 5,
    icon: IconShieldCheck,
    titleEn: 'Sound Effects & Music',
    titleZh: '音效与背景音乐',
    descEn:
      'Auto-generated sound effects and background music matching on-screen action. Upload reference audio for tone and rhythm guidance.',
    descZh:
      '自动生成与画面同步的音效和背景音乐，支持上传参考音频引导音调和节奏。',
    iconColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-50 dark:bg-rose-950/25',
  },
  {
    id: 6,
    icon: IconWorld,
    titleEn: 'Output Control',
    titleZh: '输出控制',
    descEn:
      'Configure aspect ratio, duration, and generation mode. Transparent credit costs displayed before generation. Iterative workflow for quick refinement.',
    descZh:
      '自由配置宽高比、时长和生成模式。生成前透明展示积分消耗，快速迭代打磨效果。',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/25',
  },
];

export default function FeaturesVideo() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <section className="px-4 py-20 bg-muted/30">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <BlurFade
                key={feature.id}
                inView
                delay={0.15 + index * 0.05}
                className="h-full"
              >
                <div className="h-full rounded-2xl border border-border bg-card p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div
                    className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl ${feature.iconBg}`}
                  >
                    <Icon className={`size-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {isZh ? feature.titleZh : feature.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isZh ? feature.descZh : feature.descEn}
                  </p>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
