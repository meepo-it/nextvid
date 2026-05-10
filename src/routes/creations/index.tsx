import { VideoHistoryList } from '@/components/creations/video-history-list';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/creations/')({
  component: CreationsPage,
});

function CreationsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <CreationsHeader />
      <VideoHistoryList />
    </main>
  );
}

function CreationsHeader() {
  return (
    <div className="mb-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
            My Creations
          </p>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            每一帧画面，
            <br className="sm:hidden" />
            <span
              style={{
                background:
                  'linear-gradient(90deg, oklch(0.606 0.25 292), oklch(0.667 0.295 322), oklch(0.769 0.188 70))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              都始于你输入的那句话。
            </span>
          </h1>
        </div>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground sm:mt-0 sm:text-right">
          Every idea you typed,
          <br />
          rendered into motion.
        </p>
      </div>
      <div className="mt-6 h-px bg-gradient-to-r from-border via-border/40 to-transparent" />
    </div>
  );
}
