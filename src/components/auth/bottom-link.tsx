import { Link } from '@tanstack/react-router';

interface BottomLinkProps {
  href: string;
  label: string;
}

export function BottomLink({ href, label }: BottomLinkProps) {
  // Split "Hint text? Action" or "提示文字？动作" into two parts
  const match = label.match(/^(.+[?？])\s*(.+)$/);

  if (match) {
    return (
      <p className="text-sm text-center">
        <span className="text-muted-foreground">{match[1]} </span>
        <Link
          to={href}
          className="font-semibold text-foreground underline underline-offset-4 hover:text-primary transition-colors"
        >
          {match[2]}
        </Link>
      </p>
    );
  }

  return (
    <Link
      to={href}
      className="text-sm font-medium text-foreground/80 hover:text-primary hover:underline underline-offset-4 transition-colors"
    >
      {label}
    </Link>
  );
}
