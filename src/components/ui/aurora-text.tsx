'use client';

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AuroraText({
  children,
  className = '',
  colors = ['oklch(0.65 0.2 145)', 'oklch(0.7 0.18 165)', 'oklch(0.6 0.2 155)', 'oklch(0.65 0.15 170)'],
  speed = 1,
}: AuroraTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
        className="animate-aurora relative bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animationDuration: `${10 / speed}s`,
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
}
