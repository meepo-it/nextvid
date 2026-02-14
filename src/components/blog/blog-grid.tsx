import type { Blog } from 'content-collections'
import { BlogCard } from './blog-card'

type BlogWithMeta = Blog & { _meta: { path: string } }

export function BlogGrid({ posts }: { posts: BlogWithMeta[] }) {
  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No posts yet.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={(post as BlogWithMeta)._meta.path} post={post as BlogWithMeta} />
      ))}
    </div>
  )
}
