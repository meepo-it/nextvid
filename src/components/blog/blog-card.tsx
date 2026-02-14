import type { Blog } from 'content-collections'
import { Link } from '@tanstack/react-router'

type BlogWithMeta = Blog & { _meta: { path: string } }

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BlogCard({ post }: { post: BlogWithMeta }) {
  const slug = post._meta.path
  const dateFormatted = formatDate(post.date)

  return (
    <Link
      to="/blog/$slug"
      params={{ slug }}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary hover:shadow-md"
    >
      {/* Featured image (Achromatic / Mixus style card image) */}
      {post.image && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={post.image}
            alt=""
            className="object-cover transition-transform hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        {/* Category and date row */}
        <div className="flex shrink-0 items-center justify-between gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground text-xs font-medium capitalize">
            {post.category}
          </span>
          <time
            dateTime={post.date}
            className="text-muted-foreground text-xs"
          >
            {dateFormatted}
          </time>
        </div>
        {/* Title + description: flex-1 so author stays at bottom when description is 1 line */}
        <div className="mt-3 flex min-h-[4.5rem] flex-1 flex-col">
          <h3 className="line-clamp-2 text-lg font-semibold">{post.title}</h3>
          {post.description && (
            <p className="mt-2 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
              {post.description}
            </p>
          )}
        </div>
        {/* Author and avatar - always at bottom */}
        <div className="mt-4 flex shrink-0 items-center gap-2 border-t border-border pt-4">
          {post.avatar ? (
            <img
              src={post.avatar}
              alt=""
              className="size-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
              {post.author?.charAt(0) ?? '?'}
            </div>
          )}
          <span className="truncate text-muted-foreground text-sm">
            {post.author}
          </span>
        </div>
      </div>
    </Link>
  )
}
