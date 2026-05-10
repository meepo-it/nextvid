'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  blur?: string;
  duration?: number;
}

export function BlurFade({
  children,
  className,
  delay = 0,
  inView = false,
  direction = 'down',
  blur = '6px',
  duration = 0.4,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!inView);

  useEffect(() => {
    if (!inView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  const translate = {
    up: 'translateY(8px)',
    down: 'translateY(-8px)',
    left: 'translateX(8px)',
    right: 'translateX(-8px)',
  }[direction];

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? 'blur(0px)' : `blur(${blur})`,
        transform: visible ? 'translate(0,0)' : translate,
        transition: `opacity ${duration}s ease-out, filter ${duration}s ease-out, transform ${duration}s ease-out`,
        transitionDelay: `${delay + 0.04}s`,
      }}
    >
      {children}
    </div>
  );
}
