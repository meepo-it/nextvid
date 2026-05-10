import {
  IconArrowRight,
  IconCheck,
  IconCloudUpload,
  IconDeviceDesktopAnalytics,
  IconPhoto,
  IconPlayerPlayFilled,
  IconSparkles,
  IconSquareLetterT,
  IconVideo,
} from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import * as m from '@/paraglide/messages.js';

export const Route = createFileRoute('/(tests)/home-design-drafts')({
  head: () =>
    seo('/home-design-drafts', {
      title: `${websiteConfig.metadata?.name ?? 'NextVid'} ${m.home_features_title()}`,
      description: m.home_why_choose_subtitle(),
    }),
  component: HomeDesignDrafts,
});

const previewImages = [
  {
    src: 'https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&w=900',
    title: '01',
  },
  {
    src: 'https://images.pexels.com/videos/2795173/free-video-2795173.jpg?auto=compress&w=900',
    title: '02',
  },
  {
    src: 'https://images.pexels.com/videos/1526909/free-video-1526909.jpg?auto=compress&w=900',
    title: '03',
  },
  {
    src: 'https://images.pexels.com/videos/1448735/free-video-1448735.jpg?auto=compress&w=900',
    title: '04',
  },
] as const;

const draftComponents = [
  StudioDraft,
  CinemaDraft,
  EditorialDraft,
  WorkspaceDraft,
  PosterDraft,
] as const;

function HomeDesignDrafts() {
  const [active, setActive] = useState(0);
  const ActiveDraft = useMemo(() => draftComponents[active], [active]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-[64px] z-30 border-y border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {draftComponents.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors',
                  active === index
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {m.not_found_back_to_home()}
            <IconArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <ActiveDraft />
    </div>
  );
}

function EditorPreview({ className }: { className?: string }) {
  const modeItems = [
    {
      icon: IconSquareLetterT,
      label: m.video_mode_text_to_video(),
    },
    {
      icon: IconPhoto,
      label: m.video_mode_reference_to_video(),
    },
    {
      icon: IconVideo,
      label: m.video_mode_video_edit(),
    },
  ];

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-background p-4 shadow-[0_22px_70px_rgb(15_23_42/0.14)] sm:p-5',
        className
      )}
    >
      <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-muted/50 p-1">
        {modeItems.map(({ icon: Icon, label }, index) => (
          <button
            key={label}
            type="button"
            className={cn(
              'flex min-h-10 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-semibold transition-colors',
              index === 0
                ? 'bg-background text-violet-600 shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold text-foreground">
          {m.video_prompt_label()}
        </div>
        <div className="mt-2 min-h-[132px] rounded-md border border-input bg-background p-3">
          <p className="text-sm text-muted-foreground/55">
            {m.video_prompt_placeholder_text_to_video()}
          </p>
          <div className="flex h-20 items-end justify-end text-xs tabular-nums text-muted-foreground/55">
            0/1500
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 flex w-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-4 py-6 text-center transition-colors hover:bg-muted/40"
      >
        <IconCloudUpload className="size-7 text-muted-foreground" />
        <span className="mt-2 text-sm font-semibold text-foreground">
          {m.video_upload_image()}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          {m.video_upload_image_formats()}
        </span>
      </button>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {m.video_params_model()}
          </span>
          <span className="font-semibold text-foreground">Wan 2.7</span>
        </div>
        <SegmentedRow
          label={m.video_params_duration()}
          options={['2s', '5s', '10s', '15s']}
          active="5s"
        />
        <SegmentedRow
          label={m.video_params_resolution()}
          options={['720p', '1080p']}
          active="720p"
        />
        <SegmentedRow
          label={m.video_params_aspect_ratio()}
          options={['16:9', '9:16', '1:1', '4:3']}
          active="16:9"
        />
      </div>

      <button
        type="button"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-semibold text-background transition-transform active:scale-[0.99]"
      >
        <IconSparkles className="size-4" />
        {m.video_generate()}
      </button>
    </div>
  );
}

function SegmentedRow({
  label,
  options,
  active,
}: {
  label: string;
  options: string[];
  active: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[112px_1fr] sm:items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="grid grid-cols-4 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={cn(
              'min-h-9 rounded-md border px-2 text-xs font-semibold transition-colors',
              active === option
                ? 'border-violet-400 bg-violet-50 text-violet-700'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProofPoints({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-2 text-sm sm:grid-cols-3',
        dark ? 'text-white/76' : 'text-muted-foreground'
      )}
    >
      {[
        m.home_why_choose_subtitle(),
        m.home_showcase_subtitle(),
        m.home_features_description(),
      ].map((item) => (
        <span key={item} className="flex items-start gap-2">
          <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

function VideoTiles({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
      )}
    >
      {previewImages.map((image) => (
        <div
          key={image.src}
          className="group relative aspect-video overflow-hidden rounded-md bg-muted"
        >
          <img
            src={image.src}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/0" />
          <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
            {image.title}
          </span>
        </div>
      ))}
    </div>
  );
}

function ModuleGrid({ dark = false }: { dark?: boolean }) {
  const modules = [
    {
      icon: IconVideo,
      title: m.home_showcase_title(),
      text: m.home_showcase_subtitle(),
    },
    {
      icon: IconDeviceDesktopAnalytics,
      title: m.home_features_title(),
      text: m.home_features_description(),
    },
    {
      icon: IconPlayerPlayFilled,
      title: m.home_how_it_works_title(),
      text: m.home_how_it_works_subtitle(),
    },
    {
      icon: IconSparkles,
      title: m.home_why_choose_title(),
      text: m.home_why_choose_subtitle(),
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {modules.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className={cn(
            'rounded-lg border p-4',
            dark
              ? 'border-white/12 bg-white/[0.06] text-white'
              : 'border-border bg-card text-foreground'
          )}
        >
          <Icon
            className={cn(
              'mb-5 size-5',
              dark ? 'text-lime-300' : 'text-violet-600'
            )}
          />
          <h3 className="text-base font-semibold">{title}</h3>
          <p
            className={cn(
              'mt-2 text-sm leading-6',
              dark ? 'text-white/65' : 'text-muted-foreground'
            )}
          >
            {text}
          </p>
        </div>
      ))}
    </div>
  );
}

function DraftHeroCopy({ dark = false }: { dark?: boolean }) {
  return (
    <div className={cn(dark ? 'text-white' : 'text-foreground')}>
      <p
        className={cn(
          'mb-5 inline-flex items-center gap-2 text-sm font-semibold',
          dark ? 'text-lime-300' : 'text-violet-700'
        )}
      >
        <IconSparkles className="size-4" />
        {websiteConfig.metadata?.name ?? 'NextVid'}
      </p>
      <h1 className="max-w-4xl text-5xl font-bold leading-[1.03] sm:text-6xl lg:text-7xl">
        {m.home_hero_title1()} {m.home_hero_title2()}
      </h1>
      <p
        className={cn(
          'mt-5 max-w-2xl text-lg leading-8',
          dark ? 'text-white/72' : 'text-muted-foreground'
        )}
      >
        {m.home_why_choose_subtitle()}
      </p>
    </div>
  );
}

function StudioDraft() {
  return (
    <section className="bg-[#fbfaf6] text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-end">
          <div>
            <DraftHeroCopy />
            <div className="mt-8 max-w-4xl">
              <ProofPoints />
            </div>
          </div>
          <EditorPreview />
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <VideoTiles />
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-violet-700">
              {m.home_use_cases_title()}
            </p>
            <h2 className="mt-6 text-3xl font-bold leading-tight">
              {m.home_use_cases_subtitle()}
            </h2>
            <Link
              to="/pricing"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              {m.home_why_choose_cta()}
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <ModuleGrid />
        </div>
      </div>
    </section>
  );
}

function CinemaDraft() {
  return (
    <section className="bg-[#080908] text-white">
      <div className="relative min-h-[760px] overflow-hidden">
        <img
          src="https://images.pexels.com/videos/1526909/free-video-1526909.jpg?auto=compress&w=1600"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_9_8)_0%,rgb(8_9_8/0.86)_38%,rgb(8_9_8/0.34)_100%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.9fr_460px] lg:items-center lg:py-24">
          <div>
            <DraftHeroCopy dark />
            <div className="mt-9">
              <ProofPoints dark />
            </div>
          </div>
          <EditorPreview className="shadow-[0_32px_90px_rgb(0_0_0/0.42)]" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <VideoTiles />
        <div className="mt-4">
          <ModuleGrid dark />
        </div>
      </div>
    </section>
  );
}

function EditorialDraft() {
  return (
    <section className="bg-[#f7f1e8] text-[#17130f]">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="grid gap-8 border-y border-[#17130f] py-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-bold">{websiteConfig.metadata?.name}</p>
            <h1 className="text-5xl font-bold leading-[0.98] sm:text-6xl lg:text-7xl">
              {m.home_hero_title1()}
              <br />
              {m.home_hero_title2()}
            </h1>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
            <div className="aspect-[5/4] overflow-hidden rounded-md bg-[#17130f]">
              <img
                src="https://images.pexels.com/videos/2795173/free-video-2795173.jpg?auto=compress&w=1200"
                alt=""
                className="size-full object-cover opacity-88"
              />
            </div>
            <div className="flex flex-col justify-between gap-6">
              <p className="text-lg leading-8 text-[#5f554b]">
                {m.home_showcase_subtitle()}
              </p>
              <ProofPoints />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[440px_1fr] lg:items-start">
          <EditorPreview className="lg:sticky lg:top-32" />
          <div className="grid gap-4">
            <ModuleGrid />
            <VideoTiles compact />
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkspaceDraft() {
  return (
    <section className="bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <div className="grid min-h-[760px] overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-950 p-5 text-white lg:border-b-0 lg:border-r">
            <p className="text-lg font-bold">{websiteConfig.metadata?.name}</p>
            <div className="mt-10 space-y-2">
              {[
                m.home_showcase_title(),
                m.home_features_title(),
                m.home_how_it_works_title(),
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/76"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_430px] lg:p-8">
            <main>
              <DraftHeroCopy />
              <div className="mt-7">
                <ProofPoints />
              </div>
              <div className="mt-8">
                <ModuleGrid />
              </div>
              <div className="mt-4">
                <VideoTiles />
              </div>
            </main>
            <EditorPreview className="lg:sticky lg:top-32" />
          </div>
        </div>
      </div>
    </section>
  );
}

function PosterDraft() {
  return (
    <section className="bg-[#f3442e] text-[#12110f]">
      <div className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-center">
          <div>
            <div className="relative overflow-hidden rounded-lg bg-[#ffe85b] p-6">
              <img
                src="https://images.pexels.com/videos/1448735/free-video-1448735.jpg?auto=compress&w=1300"
                alt=""
                className="absolute inset-0 size-full object-cover mix-blend-multiply opacity-45"
              />
              <div className="relative">
                <p className="text-sm font-bold">
                  {websiteConfig.metadata?.name}
                </p>
                <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.96] sm:text-7xl">
                  {m.home_hero_title1()} {m.home_hero_title2()}
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-semibold leading-8">
                  {m.home_features_description()}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                m.home_showcase_title(),
                m.home_use_cases_title(),
                m.home_why_choose_title(),
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border-2 border-[#12110f] bg-white p-4 text-base font-bold"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <EditorPreview className="border-[#12110f] shadow-[12px_12px_0_rgb(18_17_15)]" />
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-lg border-2 border-[#12110f] bg-white p-5">
            <h2 className="text-3xl font-black leading-tight">
              {m.home_why_choose_title()}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              {m.home_why_choose_subtitle()}
            </p>
          </div>
          <VideoTiles />
        </div>
      </div>
    </section>
  );
}
