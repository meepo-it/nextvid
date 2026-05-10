import { createFileRoute } from '@tanstack/react-router';
import { IconApps, IconAdjustments, IconPhotoVideo } from '@tabler/icons-react';

export const Route = createFileRoute('/(tests)/hiw-preview')({
  component: HiwPreview,
});

const STEPS = [
  {
    icon: IconApps,
    number: '01',
    title: 'Pick Your Mode',
    titleZh: '选择创作模式',
    desc: 'Three modes to fit any workflow — Text/Image to Video, Reference to Video, or Video Edit.',
    descZh: '三种模式随需切换——文字/图像生成视频、参考视频生成和视频编辑。',
  },
  {
    icon: IconAdjustments,
    number: '02',
    title: 'Configure & Generate',
    titleZh: '配置并生成',
    desc: 'Choose a model (Wan 2.7, Kling v3, Seedance), set resolution up to 1080p, then generate.',
    descZh:
      '选择模型（万相 2.7、Kling v3、Seedance），设定分辨率（最高 1080p），一键生成。',
  },
  {
    icon: IconPhotoVideo,
    number: '03',
    title: 'Preview & Download',
    titleZh: '预览并下载',
    desc: 'Track progress in real time. Video lands in your Creations library — preview and download instantly.',
    descZh: '实时追踪进度，完成后视频自动进入创作库，即刻预览并一键下载。',
  },
];

/* ─── V1: 纯排版·Ghost Numbers ─────────────────────────────────────── */
function V1() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Three steps to your video
          </h2>
        </div>
        <div className="grid gap-12 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                <div className="absolute -top-4 -left-2 text-8xl font-black text-foreground/[0.06] select-none leading-none pointer-events-none">
                  {step.number}
                </div>
                <div className="relative">
                  <Icon className="size-5 text-foreground mb-4" />
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V2: 细描边卡片 ────────────────────────────────────────────────── */
function V2() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            How it works
          </h2>
          <p className="text-sm text-muted-foreground">
            From idea to video in minutes
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-border bg-card p-6 hover:border-foreground/20 transition-colors"
              >
                <span className="absolute top-4 right-4 font-mono text-xs text-muted-foreground/30 select-none">
                  {step.number}
                </span>
                <div className="mb-4 inline-flex size-9 items-center justify-center rounded-xl border border-border bg-muted">
                  <Icon className="size-4 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V3: 横向时间轴 ────────────────────────────────────────────────── */
function V3() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
            How it works
          </h2>
          <p className="text-sm text-muted-foreground">
            Simple. Fast. Powerful.
          </p>
        </div>
        <div className="relative">
          <div
            aria-hidden
            className="absolute top-5 hidden h-px bg-border sm:block"
            style={{ left: 'calc(100% / 6)', right: 'calc(100% / 6)' }}
          />
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-6 flex size-10 items-center justify-center rounded-full border-2 border-border bg-background">
                    <Icon className="size-4 text-foreground" />
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {parseInt(step.number)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── V4: 编辑行列 (Superhuman 风格) ───────────────────────────────── */
function V4() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            How it works
          </h2>
        </div>
        <div className="divide-y divide-border">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex gap-8 py-8">
                <div className="w-16 shrink-0 select-none text-5xl font-black text-foreground/[0.07] leading-none pt-0.5">
                  {step.number}
                </div>
                <div className="flex flex-1 min-w-0 gap-4">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    <Icon className="size-4 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V5: 高对比 Icon (Raycast/Arc 风格) ───────────────────────────── */
function V5() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            How it works
          </h2>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Takes less than a minute
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-foreground">
                    <Icon className="size-5 text-background" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground/40 select-none">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── 预览容器 ──────────────────────────────────────────────────────── */
const DESIGNS = [
  {
    label: 'V1 — 纯排版 · Ghost Numbers',
    sub: 'Vercel / Linear 风格',
    component: V1,
  },
  { label: 'V2 — 细描边卡片', sub: 'Notion / Craft 风格', component: V2 },
  { label: 'V3 — 横向时间轴', sub: 'Stripe / GitHub 风格', component: V3 },
  { label: 'V4 — 编辑行列', sub: 'Superhuman / Readwise 风格', component: V4 },
  { label: 'V5 — 高对比 Icon', sub: 'Raycast / Arc 风格', component: V5 },
];

function HiwPreview() {
  return (
    <div className="min-h-screen bg-background">
      {DESIGNS.map(({ label, sub, component: Comp }) => (
        <div key={label} className="border-b border-border last:border-0">
          <div className="border-b border-border bg-muted/50 px-6 py-3 flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-foreground">
              {label}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {sub}
            </span>
          </div>
          <Comp />
        </div>
      ))}
    </div>
  );
}
