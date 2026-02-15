import { marked } from 'marked';
import { cn } from '@/lib/utils';

/**
 * Renders markdown string as HTML using Tailwind Typography (prose).
 * Same approach as Tailwind/Shadcn docs: prose classes style Markdown output.
 */
export function MarkdownBody({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const html = marked.parse(content, { async: false }) as string;
  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-p:leading-relaxed',
        'prose-a:text-primary prose-img:rounded-lg',
        'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-code:text-foreground',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-foreground prose-pre:shadow-none',
        'prose-pre_code:bg-transparent prose-pre_code:px-0 prose-pre_code:py-0 prose-pre_code:text-foreground prose-pre_code:before:content-none prose-pre_code:after:content-none',
        '[&_pre]:text-foreground [&_pre_code]:text-foreground',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
