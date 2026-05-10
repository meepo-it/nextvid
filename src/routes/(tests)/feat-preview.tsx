import { createFileRoute } from '@tanstack/react-router';
import {
  IconLetterT,
  IconPhoto,
  IconVideo,
  IconBolt,
  IconShieldCheck,
  IconWorld,
} from '@tabler/icons-react';

export const Route = createFileRoute('/(tests)/feat-preview')({
  component: FeatPreview,
});

const FEATURES = [
  {
    icon: IconLetterT,
    title: 'Multimodal Input',
    desc: 'Combine text, images, and video references in a single generation. Control composition, motion, and tone simultaneously for precise creative output.',
    color: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/25',
      border: 'border-blue-200 dark:border-blue-800/50',
    },
  },
  {
    icon: IconPhoto,
    title: 'Image to Video',
    desc: 'Bring static images to life with AI-powered animation. Upload any photo and let AI create natural, fluid motion with customizable duration and style.',
    color: {
      icon: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/25',
      border: 'border-violet-200 dark:border-violet-800/50',
    },
  },
  {
    icon: IconVideo,
    title: 'Camera & Motion Control',
    desc: 'Replicate camera trajectory, action pacing, and visual effects from reference videos. Supports dolly, tracking, and handheld movements.',
    color: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/25',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
  },
  {
    icon: IconBolt,
    title: 'Video Extension',
    desc: 'Extend videos forward or backward with seamless continuation. Characters, lighting, and camera perspective remain consistent across extended clips.',
    color: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/25',
      border: 'border-orange-200 dark:border-orange-800/50',
    },
  },
  {
    icon: IconShieldCheck,
    title: 'Sound Effects & Music',
    desc: 'Auto-generated sound effects and background music matching on-screen action. Upload reference audio for tone and rhythm guidance.',
    color: {
      icon: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/25',
      border: 'border-rose-200 dark:border-rose-800/50',
    },
  },
  {
    icon: IconWorld,
    title: 'Output Control',
    desc: 'Configure aspect ratio, duration, and generation mode. Transparent credit costs displayed before generation. Iterative workflow for quick refinement.',
    color: {
      icon: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/25',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
  },
];

const TITLE = 'Features & Capabilities';
const SUBTITLE =
  'A multimodal AI video generator that accepts images, videos, audio, and text as inputs';

/* ─── V1: 2-large + 4-small bento grid ──────────────────────────────── */
function V1() {
  const [f1, f2, ...rest] = FEATURES;
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          {[f1, f2].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.color.border} bg-card p-8 hover:shadow-sm transition-all`}
              >
                <div
                  className={`mb-5 inline-flex size-12 items-center justify-center rounded-2xl border ${f.color.border} ${f.color.bg}`}
                >
                  <Icon className={`size-6 ${f.color.icon}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {rest.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.color.border} bg-card p-5 hover:shadow-sm transition-all`}
              >
                <div
                  className={`mb-3 inline-flex size-9 items-center justify-center rounded-xl border ${f.color.border} ${f.color.bg}`}
                >
                  <Icon className={`size-4 ${f.color.icon}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V2: Uniform 3-col equal grid ───────────────────────────────────── */
function V2() {
  return (
    <section className="px-4 py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
              >
                <div
                  className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl ${f.color.bg}`}
                >
                  <Icon className={`size-5 ${f.color.icon}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V3: Bento masonry — 1 wide + 2 narrow, repeated ───────────────── */
function V3() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        {/* Row 1: 1 wide (col-span-2) + 1 narrow */}
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          {FEATURES.slice(0, 2).map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.color.border} bg-card p-6 hover:shadow-sm transition-all ${i === 0 ? 'sm:col-span-2' : ''}`}
              >
                <div
                  className={`mb-4 inline-flex size-11 items-center justify-center rounded-2xl border ${f.color.border} ${f.color.bg}`}
                >
                  <Icon className={`size-5 ${f.color.icon}`} />
                </div>
                <h3
                  className={`font-semibold text-foreground mb-2 ${i === 0 ? 'text-xl' : 'text-base'}`}
                >
                  {f.title}
                </h3>
                <p
                  className={`text-muted-foreground leading-relaxed ${i === 0 ? 'text-base' : 'text-sm'}`}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
        {/* Row 2: 1 narrow + 1 wide (col-span-2) */}
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.slice(2, 4).map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.color.border} bg-card p-6 hover:shadow-sm transition-all ${i === 1 ? 'sm:col-span-2' : ''}`}
              >
                <div
                  className={`mb-4 inline-flex size-11 items-center justify-center rounded-2xl border ${f.color.border} ${f.color.bg}`}
                >
                  <Icon className={`size-5 ${f.color.icon}`} />
                </div>
                <h3
                  className={`font-semibold text-foreground mb-2 ${i === 1 ? 'text-xl' : 'text-base'}`}
                >
                  {f.title}
                </h3>
                <p
                  className={`text-muted-foreground leading-relaxed ${i === 1 ? 'text-base' : 'text-sm'}`}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
          {FEATURES.slice(4).map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.color.border} bg-card p-6 hover:shadow-sm transition-all`}
              >
                <div
                  className={`mb-4 inline-flex size-11 items-center justify-center rounded-2xl border ${f.color.border} ${f.color.bg}`}
                >
                  <Icon className={`size-5 ${f.color.icon}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V4: Two-column feature rows (editorial) ────────────────────────── */
function V4() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Capabilities
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl">
            {SUBTITLE}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-2xl border border-border/50 bg-muted/30 px-5 py-5 hover:bg-muted/60 hover:border-border transition-all"
              >
                <div
                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border ${f.color.border} ${f.color.bg}`}
                >
                  <Icon className={`size-5 ${f.color.icon}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
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

/* ─── V5: High-contrast icon + numbered rows (Raycast style) ─────────── */
function V5() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl border ${f.color.border} ${f.color.bg}`}
                  >
                    <Icon className={`size-6 ${f.color.icon}`} />
                  </div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground/40 select-none">
                    0{i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
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

/* ─── Preview container ──────────────────────────────────────────────── */
const DESIGNS = [
  {
    label: 'V1 — 2大+4小 Bento',
    sub: '当前布局升级版（彩色描边）',
    component: V1,
  },
  {
    label: 'V2 — 均等 3 列卡片',
    sub: 'Vercel / Tailwind UI 风格',
    component: V2,
  },
  { label: 'V3 — 宽窄交替 Bento', sub: '杂志/大稿风格', component: V3 },
  { label: 'V4 — 双列行卡片', sub: 'Notion / GitHub 风格', component: V4 },
  { label: 'V5 — 编号 Icon 网格', sub: 'Raycast / Arc 风格', component: V5 },
];

function FeatPreview() {
  return (
    <div className="min-h-screen bg-background">
      {DESIGNS.map(({ label, sub, component: Comp }) => (
        <div key={label} className="border-b border-border last:border-0">
          <div className="flex items-baseline gap-3 border-b border-border bg-muted/50 px-6 py-3">
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
