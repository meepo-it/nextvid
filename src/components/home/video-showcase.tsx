'use client';

import { BlurFade } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import * as m from '@/paraglide/messages.js';
import { IconPlayerPlay } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ShowcaseItem {
  id: number;
  videoUrl: string;
  thumbnailUrl: string;
  headline: string;
  headlineAccent?: string;
  description: string;
}

const CDN = 'https://cdn.happyhorsevideo.com/showcase';

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 1,
    videoUrl: `${CDN}/case_9.mp4`,
    thumbnailUrl: `${CDN}/case_9.jpg`,
    headline: 'VISUAL STORY',
    headlineAccent: 'STORY',
    description: 'Atmospheric narrative footage on demand',
  },
  {
    id: 2,
    videoUrl: `${CDN}/cherry-blossom.mp4`,
    thumbnailUrl: `${CDN}/cherry-blossom.jpg`,
    headline: 'ZEN GARDEN',
    headlineAccent: 'ZEN',
    description: 'Cherry blossoms drifting through soft cinematic light',
  },
  {
    id: 3,
    videoUrl: `${CDN}/case_4.mp4`,
    thumbnailUrl: `${CDN}/case_4.jpg`,
    headline: 'PORTRAIT MOTION',
    headlineAccent: 'MOTION',
    description: 'Bring still portraits to life with natural animation',
  },
  {
    id: 4,
    videoUrl: `${CDN}/case_6.mp4`,
    thumbnailUrl: `${CDN}/case_6.jpg`,
    headline: 'CINEMATIC SCENES',
    headlineAccent: 'CINEMATIC',
    description: 'Movie-quality storytelling from a single prompt',
  },
  {
    id: 5,
    videoUrl: `${CDN}/case_3.mp4`,
    thumbnailUrl: `${CDN}/case_3.jpg`,
    headline: 'DYNAMIC ACTION',
    headlineAccent: 'ACTION',
    description: 'Fluid motion and cinematic camera work',
  },
  {
    id: 6,
    videoUrl: `${CDN}/case_5.mp4`,
    thumbnailUrl: `${CDN}/case_5.jpg`,
    headline: 'CREATIVE WORLDS',
    headlineAccent: 'CREATIVE',
    description: 'Imagined scenes rendered in stunning detail',
  },
];

function HeadlineText({
  headline,
  accent,
}: {
  headline: string;
  accent?: string;
}) {
  if (!accent) return <span>{headline}</span>;
  const idx = headline.indexOf(accent);
  if (idx === -1) return <span>{headline}</span>;
  return (
    <>
      {headline.slice(0, idx) && <span>{headline.slice(0, idx)}</span>}
      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        {accent}
      </span>
      {headline.slice(idx + accent.length) && (
        <span>{headline.slice(idx + accent.length)}</span>
      )}
    </>
  );
}

function VideoCard({ item }: { item: ShowcaseItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isInView]);

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer transition-transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/10">
        <img
          src={item.thumbnailUrl}
          alt={item.description}
          width={600}
          height={338}
          className={cn(
            'absolute inset-0 size-full object-cover transition-all duration-500 group-hover:scale-105',
            isPlaying && isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          loading="lazy"
        />
        <video
          ref={videoRef}
          src={isInView || isPlaying ? item.videoUrl : undefined}
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setIsLoaded(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-300',
            isPlaying && isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <h3 className="font-extrabold text-white leading-none tracking-tight text-lg sm:text-xl lg:text-2xl drop-shadow-lg">
            <HeadlineText
              headline={item.headline}
              accent={item.headlineAccent}
            />
          </h3>
        </div>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            isPlaying ? 'bg-black/0' : 'bg-black/0 group-hover:bg-black/10'
          )}
        >
          {!isPlaying && (
            <div className="flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 scale-75 transition-all group-hover:opacity-100 group-hover:scale-100 shadow-xl sm:size-12">
              <IconPlayerPlay className="ml-0.5 size-4 sm:size-5" />
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground px-0.5 transition-colors duration-300 group-hover:text-foreground">
        {item.description}
      </p>
    </div>
  );
}

export default function VideoShowcase() {
  return (
    <section className="px-4 pt-6 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {m.home_showcase_title()}
          </h2>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {m.home_showcase_subtitle()}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE_ITEMS.map((item, i) => (
            <BlurFade key={item.id} delay={0.1 + i * 0.05} inView>
              <VideoCard item={item} />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
