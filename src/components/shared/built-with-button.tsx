import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function BuiltWithButton() {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://nextvid.ai"
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'border border-border px-4 py-4 rounded-md gap-2'
      )}
    >
      <span>Built with</span>
      <span className="font-semibold">NextVid</span>
    </a>
  );
}
