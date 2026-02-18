import { Markdown } from '@/components/markdown/markdown';
import { Card, CardContent } from '@/components/ui/card';
import type { PageDoc } from '@/lib/pages';
import { formatDate } from '@/lib/formatter';

export function MarkdownPage({ page }: { page: PageDoc }) {
  const { title, description, date, content } = page;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-center text-lg text-muted-foreground">
            {description}
          </p>
        )}
        {date != null && (
          <p className="text-center text-sm text-muted-foreground">
            {formatDate(new Date(date))}
          </p>
        )}
      </div>
      <Card className="ring-0 border border-border">
        <CardContent className="pt-6">
          <div className="mt-0">
            <Markdown content={content} className='prose' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
