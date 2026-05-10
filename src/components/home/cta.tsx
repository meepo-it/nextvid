'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import { Link } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';
import { IconBolt, IconSparkles } from '@tabler/icons-react';

export default function Cta() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <BlurFade inView delay={0}>
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-12 text-center sm:px-20"
            style={{
              background: 'oklch(0.20 0.025 292)',
              backgroundImage: [
                'linear-gradient(oklch(1 0 0 / 0.055) 1px, transparent 1px)',
                'linear-gradient(90deg, oklch(1 0 0 / 0.055) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '36px 36px',
            }}
          >
            {/* Top edge glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, oklch(0.8 0.1 292 / 0.55) 50%, transparent)',
              }}
            />
            {/* Soft center light bloom */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-64 w-[640px] -translate-x-1/2"
              style={{
                background:
                  'radial-gradient(ellipse 80% 100% at 50% 0%, oklch(0.606 0.25 292 / 0.14) 0%, transparent 70%)',
              }}
            />

            <div className="relative">
              {/* Eyebrow */}
              <div className="mb-6 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-white/15" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  {isZh ? 'AI 视频生成' : 'AI Video Generation'}
                </span>
                <span className="h-px w-10 bg-white/15" />
              </div>

              {/* Headline */}
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                {isZh ? '下一个视频' : 'Your next video'}
                <br />
                <span
                  style={{
                    background:
                      'linear-gradient(90deg, oklch(0.75 0.22 292), oklch(0.78 0.25 322), oklch(0.85 0.2 60))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {isZh ? '从这里开始。' : 'starts here.'}
                </span>
              </h2>

              {/* Subtext */}
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/40">
                {isZh
                  ? 'Seedance 2.0、Kling v3、万相 2.7 全部就绪。一个工作台，搞定一切。'
                  : 'Seedance 2.0, Kling v3, Wan 2.7 — all in one workspace. No switching, no friction.'}
              </p>

              {/* CTA row */}
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={Routes.Login}
                  className="inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                  style={{
                    background:
                      'linear-gradient(135deg, oklch(0.606 0.25 292), oklch(0.667 0.295 322))',
                    boxShadow:
                      '0 0 0 1px oklch(0.75 0.2 292 / 0.3), 0 8px 32px oklch(0.606 0.25 292 / 0.5)',
                  }}
                >
                  <IconBolt className="size-4" />
                  {isZh ? '免费开始使用' : 'Start for Free'}
                </Link>
                <Link
                  to="/pricing"
                  className="text-sm font-medium text-white/40 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/70 hover:decoration-white/40"
                >
                  {isZh ? '查看定价方案 →' : 'View Pricing →'}
                </Link>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
