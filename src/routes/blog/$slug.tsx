import { createFileRoute, Link } from '@tanstack/react-router'
import Container from '@/components/layout/container'
import { MarkdownBody } from '@/components/blog/markdown-body'
import { getPostBySlug } from '@/lib/blog'
import { websiteConfig } from '@/config/website'
import { ArrowLeftIcon } from 'lucide-react'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function BlogPostPage() {
  const { slug } = Route.useParams()
  const post = getPostBySlug(slug)

  if (!websiteConfig.blog?.enable) {
    return (
      <Container className="py-16">
        <p className="text-center text-muted-foreground">Blog is disabled.</p>
      </Container>
    )
  }

  if (!post) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Link
            to="/blog"
            search={{ page: 1 }}
            className="mt-4 inline-flex text-primary hover:underline"
          >
            Back to Blog
          </Link>
        </div>
      </Container>
    )
  }

  const dateFormatted = formatDate(post.date)

  return (
    <div className="flex flex-col gap-8 pb-16">
      <Container className="px-4">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/blog"
            search={{ page: 1 }}
            className="mb-6 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            All posts
          </Link>

          <article>
            {/* Metadata: category, date */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium capitalize">
                {post.category}
              </span>
              <time dateTime={post.date}>{dateFormatted}</time>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            {post.description && (
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                {post.description}
              </p>
            )}

            {/* Author and avatar - small avatar aligned with name */}
            <div className="mt-6 flex items-center gap-2 border-b border-border pb-6">
              {post.avatar ? (
                <img
                  src={post.avatar}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover align-middle"
                />
              ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium align-middle">
                  {post.author?.charAt(0) ?? '?'}
                </div>
              )}
              <span className="text-muted-foreground text-sm leading-none">
                {post.author}
              </span>
            </div>

            <div className="mt-8">
              <MarkdownBody content={post.content} />
            </div>
          </article>
        </div>
      </Container>
    </div>
  )
}
