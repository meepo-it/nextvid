'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import * as m from '@/paraglide/messages.js';
import {
  IconBuildingStore,
  IconLayoutGrid,
  IconVideo,
  IconMusic,
  IconCoins,
} from '@tabler/icons-react';

const HIGHLIGHTS_EN = [
  {
    icon: IconBuildingStore,
    title: 'Multi-model platform',
    desc: 'Seedance 2.0, Kling v3, and Wan 2.7 — all in one place. Switch between models instantly without juggling accounts or learning new interfaces.',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBorder: 'border-blue-200 dark:border-blue-800/50',
  },
  {
    icon: IconLayoutGrid,
    title: 'Four modes, one workflow',
    desc: 'Text to Video, Image to Video, Reference to Video, and Video Edit all live in the same UI. No context switching, no friction.',
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconBorder: 'border-violet-200 dark:border-violet-800/50',
  },
  {
    icon: IconVideo,
    title: 'Reference video replication',
    desc: 'Replicate camera trajectory, action pacing, and visual effects from any reference clip. No keyframing, no manual animation — upload and generate.',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBorder: 'border-emerald-200 dark:border-emerald-800/50',
  },
  {
    icon: IconMusic,
    title: 'Synced audio generation',
    desc: 'Auto-generated sound effects and background music matched to on-screen action. Upload a reference track to guide tone and rhythm.',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-950/30',
    iconBorder: 'border-orange-200 dark:border-orange-800/50',
  },
  {
    icon: IconCoins,
    title: 'Transparent credit pricing',
    desc: 'See the exact credit cost before every generation. No subscriptions, no surprise charges — pure pay-as-you-go.',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBorder: 'border-amber-200 dark:border-amber-800/50',
  },
];

const HIGHLIGHTS_ZH = [
  {
    icon: IconBuildingStore,
    title: '多模型一站聚合',
    desc: 'Seedance 2.0、Kling v3、万相 2.7 尽在一个平台。无需切换账号或重新学习界面，模型间随时切换。',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBorder: 'border-blue-200 dark:border-blue-800/50',
  },
  {
    icon: IconLayoutGrid,
    title: '四种模式，一套工作流',
    desc: '文本/图像转视频、参考视频生成、视频编辑，同一界面无缝切换，零摩擦，零门槛。',
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconBorder: 'border-violet-200 dark:border-violet-800/50',
  },
  {
    icon: IconVideo,
    title: '参考视频精准复现',
    desc: '从任意参考片段复现镜头轨迹、动作节奏和视觉效果，无需手动关键帧，上传即可生成。',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBorder: 'border-emerald-200 dark:border-emerald-800/50',
  },
  {
    icon: IconMusic,
    title: '画面同步音频生成',
    desc: '自动生成与画面内容匹配的音效和背景音乐，支持上传参考音轨引导风格和节奏。',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-950/30',
    iconBorder: 'border-orange-200 dark:border-orange-800/50',
  },
  {
    icon: IconCoins,
    title: '透明积分定价',
    desc: '每次生成前清晰展示积分消耗，无订阅绑定，按需付费，所见即所得。',
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBorder: 'border-amber-200 dark:border-amber-800/50',
  },
];

export default function WhyChoose() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');
  const highlights = isZh ? HIGHLIGHTS_ZH : HIGHLIGHTS_EN;

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <BlurFade inView delay={0}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {m.home_why_choose_title()}
            </h2>
          </BlurFade>
          <BlurFade inView delay={0.1}>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              {m.home_why_choose_subtitle()}
            </p>
          </BlurFade>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {highlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <BlurFade key={item.title} inView delay={0.15 + i * 0.07}>
                <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card px-5 py-4 hover:border-border hover:shadow-sm transition-all">
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border ${item.iconBorder} ${item.iconBg}`}
                  >
                    <Icon className={`size-4 ${item.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
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
