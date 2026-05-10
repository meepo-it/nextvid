'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import * as m from '@/paraglide/messages.js';
import { IconApps, IconAdjustments, IconPhotoVideo } from '@tabler/icons-react';

const STEPS = [
  {
    icon: IconApps,
    number: '01',
    titleEn: 'Pick Your Mode',
    titleZh: '选择创作模式',
    descEn:
      'Three modes to fit any workflow — Text/Image to Video, Reference to Video, or Video Edit. Each unlocks a dedicated set of models and inputs.',
    descZh:
      '三种模式随需切换——文本/图像生成视频、参考视频生成和视频编辑，每种模式对应专属模型和输入方式。',
    iconBg: 'bg-blue-50 dark:bg-blue-950/25',
    iconBorder: 'border-blue-200 dark:border-blue-800/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-500 dark:bg-blue-600',
  },
  {
    icon: IconAdjustments,
    number: '02',
    titleEn: 'Configure & Generate',
    titleZh: '配置并生成',
    descEn:
      'Choose a model (Seedance 2.0, Kling v3, Wan 2.7), set resolution up to 1080p, duration, and aspect ratio — then generate with one click.',
    descZh:
      '选择模型（Seedance 2.0、Kling v3、万相 2.7），设定分辨率（最高 1080p）、时长和宽高比，一键开始生成。',
    iconBg: 'bg-violet-50 dark:bg-violet-950/25',
    iconBorder: 'border-violet-200 dark:border-violet-800/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
    badgeBg: 'bg-violet-500 dark:bg-violet-600',
  },
  {
    icon: IconPhotoVideo,
    number: '03',
    titleEn: 'Preview & Download',
    titleZh: '预览并下载',
    descEn:
      'Track your generation progress in real time. Once complete, your video lands in the Creations library — preview and download instantly.',
    descZh: '实时跟踪生成进度，完成后视频自动进入创作库，即刻预览并一键下载。',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/25',
    iconBorder: 'border-emerald-200 dark:border-emerald-800/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500 dark:bg-emerald-600',
  },
];

export default function HowItWorks() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <section className="bg-muted/30 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <BlurFade inView delay={0}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {m.home_how_it_works_title()}
            </h2>
          </BlurFade>
          <BlurFade inView delay={0.1}>
            <p className="mt-3 text-lg text-muted-foreground">
              {m.home_how_it_works_subtitle()}
            </p>
          </BlurFade>
        </div>

        <div className="relative">
          {/* connecting dashed line — centered between the three circle nodes */}
          <div
            aria-hidden
            className="absolute top-8 hidden h-px border-t border-dashed border-border sm:block"
            style={{ left: 'calc(100% / 6)', right: 'calc(100% / 6)' }}
          />

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <BlurFade key={step.number} inView delay={0.15 + i * 0.1}>
                  <div className="flex flex-col items-center text-center">
                    {/* icon circle with color accent */}
                    <div className="relative z-10 mb-7">
                      <div
                        className={`flex size-16 items-center justify-center rounded-2xl border-2 ${step.iconBorder} ${step.iconBg}`}
                      >
                        <Icon className={`size-7 ${step.iconColor}`} />
                      </div>
                      <div
                        className={`absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${step.badgeBg}`}
                      >
                        {parseInt(step.number)}
                      </div>
                    </div>

                    <h3 className="mb-2.5 text-xl font-semibold text-foreground">
                      {isZh ? step.titleZh : step.titleEn}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {isZh ? step.descZh : step.descEn}
                    </p>
                  </div>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
