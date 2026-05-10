'use client';

import { IconBolt } from '@tabler/icons-react';

const MODELS = [
  { id: 'seedance', name: 'Seedance 2.0', logo: '/brands/seedance.svg' },
  { id: 'kling', name: 'Kling', logo: '/brands/kling.png' },
  { id: 'happyhorse', name: 'HappyHorse', logo: '/brands/happyhorse.png' },
  { id: 'wan', name: 'Wan', logo: '/brands/wan.svg' },
  { id: 'hailuo', name: 'Hailuo', logo: '/brands/hailuo.png' },
  { id: 'vidu', name: 'Vidu', logo: '/brands/vidu.png' },
  { id: 'veo', name: 'Veo 3', logo: '/brands/veo.png' },
  { id: 'skyreel', name: 'SkyReel', logo: '/brands/skyreel.png' },
];

export default function ModelLogos() {
  const locale =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'en'
      : 'en';
  const isZh = locale.startsWith('zh');

  return (
    <div className="border-b border-border/40 bg-background pt-3 pb-5">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          {/* Powered by label */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-1.5">
              <IconBolt
                className="size-6 text-violet-500"
                fill="currentColor"
                strokeWidth={0}
              />
              <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.12em] text-foreground/70">
                {isZh ? '模型支持' : 'Powered by'}
              </span>
            </div>
            <div className="h-4 w-px shrink-0 bg-border/70" />
          </div>

          {/* Logos — spread evenly across remaining width */}
          <div className="flex flex-1 items-center justify-between gap-4">
            {MODELS.map((model) => (
              <div
                key={model.id}
                className="flex shrink-0 items-center gap-2.5"
              >
                <img
                  src={model.logo}
                  alt={model.name}
                  width={32}
                  height={32}
                  className="size-8 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      'none';
                  }}
                />
                <span className="whitespace-nowrap text-base font-semibold text-foreground/80">
                  {model.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
