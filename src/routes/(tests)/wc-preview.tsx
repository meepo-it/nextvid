import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import {
  IconCheck,
  IconBuildingStore,
  IconLayoutGrid,
  IconVideo,
  IconMusic,
  IconCoins,
} from '@tabler/icons-react';

export const Route = createFileRoute('/(tests)/wc-preview')({
  component: WcPreview,
});

const ITEMS = [
  {
    icon: IconBuildingStore,
    title: 'Multi-model platform',
    desc: 'Wan 2.7, Kling v3, and Seedance — all in one place. Switch between models instantly without juggling accounts or learning new interfaces.',
    color: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800/50',
    },
  },
  {
    icon: IconLayoutGrid,
    title: 'Four modes, one workflow',
    desc: 'Text to Video, Image to Video, Reference to Video, and Video Edit all live in the same UI. No context switching, no friction.',
    color: {
      icon: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-200 dark:border-violet-800/50',
    },
  },
  {
    icon: IconVideo,
    title: 'Reference video replication',
    desc: 'Replicate camera trajectory, action pacing, and visual effects from any reference clip. No keyframing, no manual animation — upload and generate.',
    color: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
  },
  {
    icon: IconMusic,
    title: 'Synced audio generation',
    desc: 'Auto-generated sound effects and background music matched to on-screen action. Upload a reference track to guide tone and rhythm.',
    color: {
      icon: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800/50',
    },
  },
  {
    icon: IconCoins,
    title: 'Transparent credit pricing',
    desc: 'See the exact credit cost before every generation. No subscriptions, no surprise charges — pure pay-as-you-go.',
    color: {
      icon: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/50',
    },
  },
];

const TITLE = 'Why NextVid?';
const SUBTITLE =
  'All the top AI video models, unified into one intuitive workflow';

/* ─── V1: Checklist rows with title+desc (Linear/Notion style) ───────── */
function V1() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        <div className="space-y-3 max-w-3xl mx-auto">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card px-5 py-4 hover:border-border hover:shadow-sm transition-all"
              >
                <div
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border ${item.color.border} ${item.color.bg}`}
                >
                  <Icon className={`size-4 ${item.color.icon}`} />
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
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── V2: Asymmetric split (Stripe style) ────────────────────────────── */
function V2() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16 items-start">
          {/* Left: statement */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Why NextVid
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
              Every top AI
              <br />
              video model.
              <br />
              One platform.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              {SUBTITLE}
            </p>
            <Link
              to="/pricing"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
          {/* Right: checklist */}
          <div className="space-y-px divide-y divide-border/50">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border ${item.color.border} ${item.color.bg}`}
                  >
                    <Icon className={`size-4 ${item.color.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {item.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── V3: Numbered feature cards grid (Vercel style) ─────────────────── */
function V3() {
  return (
    <section className="px-4 py-20 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`relative rounded-2xl border bg-card p-6 hover:shadow-sm transition-all ${item.color.border}`}
              >
                <span className="absolute top-4 right-4 font-mono text-xs font-bold text-muted-foreground/30 select-none">
                  0{i + 1}
                </span>
                <div
                  className={`mb-4 inline-flex size-10 items-center justify-center rounded-xl border ${item.color.border} ${item.color.bg}`}
                >
                  <Icon className={`size-5 ${item.color.icon}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
          {/* CTA card */}
          <div className="rounded-2xl border border-foreground/10 bg-foreground p-6 flex flex-col justify-between">
            <div>
              <p className="text-lg font-bold text-background leading-snug">
                Ready to create?
              </p>
              <p className="mt-2 text-sm text-background/60 leading-relaxed">
                Start for free, no credit card required.
              </p>
            </div>
            <Link
              to="/pricing"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground hover:bg-background/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── V4: Icon row list with dividers (Raycast style) ────────────────── */
function V4() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {TITLE}
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-lg">
              {SUBTITLE}
            </p>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Get Started Free
          </Link>
        </div>
        <div className="divide-y divide-border">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-6 py-6">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border ${item.color.border} ${item.color.bg}`}
                >
                  <Icon className={`size-6 ${item.color.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <IconCheck className="size-4 shrink-0 text-muted-foreground/40 hidden sm:block" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── V5: Two-column compact grid (GitHub style) ─────────────────────── */
function V5() {
  return (
    <section className="px-4 py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {TITLE}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
            {SUBTITLE}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 rounded-2xl border bg-muted/40 px-5 py-5 hover:bg-muted/70 transition-colors ${item.color.border}`}
              >
                <div
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${item.color.bg}`}
                >
                  <Icon className={`size-5 ${item.color.icon}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Preview container ──────────────────────────────────────────────── */
const DESIGNS = [
  {
    label: 'V1 — 彩色 icon 卡片列表',
    sub: 'Linear / Notion 风格',
    component: V1,
  },
  { label: 'V2 — 不对称分栏布局', sub: 'Stripe 风格', component: V2 },
  { label: 'V3 — 编号特性卡片网格', sub: 'Vercel 风格', component: V3 },
  { label: 'V4 — 大 icon 行列 + 分割线', sub: 'Raycast 风格', component: V4 },
  { label: 'V5 — 双栏紧凑卡片', sub: 'GitHub 风格', component: V5 },
];

function WcPreview() {
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
