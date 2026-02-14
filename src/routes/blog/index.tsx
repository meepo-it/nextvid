import { createFileRoute } from '@tanstack/react-router'
import Container from '@/components/layout/container'
import { BlogGrid } from '@/components/blog/blog-grid'
import { BlogPagination } from '@/components/blog/blog-pagination'
import { getPaginatedPosts } from '@/lib/blog'
import { websiteConfig } from '@/config/website'

export const Route = createFileRoute('/blog/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === 'number' ? search.page : Number(search.page) || 1,
  }),
  component: BlogListPage,
})

function BlogListPage() {
  const { page } = Route.useSearch()
  const { posts, totalPages, currentPage } = getPaginatedPosts(page)

  if (!websiteConfig.blog?.enable) {
    return (
      <Container className="py-16">
        <p className="text-center text-muted-foreground">Blog is disabled.</p>
      </Container>
    )
  }

  return (
    <div className="mb-16">
      <div className="mt-8 flex w-full flex-col items-center justify-center gap-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground text-lg">
            Insights, updates and stories from our team.
          </p>
        </div>
      </div>
      <Container className="mt-8 px-4">
        <BlogGrid posts={posts as (typeof posts[0] & { _meta: { path: string } })[]} />
        <BlogPagination currentPage={currentPage} totalPages={totalPages} />
      </Container>
    </div>
  )
}
