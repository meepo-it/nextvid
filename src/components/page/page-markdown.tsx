import { MarkdownBody } from '@/components/page/markdown-body';
import { Card, CardContent } from '@/components/ui/card';

interface PageData {
  title: string;
  description: string;
  date?: string;
  content: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function PageMarkdown({ page }: { page: PageData }) {
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
        {date && (
          <p className="text-center text-sm text-muted-foreground">
            {formatDate(date)}
          </p>
        )}
      </div>
      <Card className="ring-0 border border-border">
        <CardContent className="pt-6">
          <div className="mt-0">
            <MarkdownBody content={content} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
