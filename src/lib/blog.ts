import { allBlogs } from 'content-collections'
import type { Blog } from 'content-collections'
import { websiteConfig } from '@/config/website'

const DEFAULT_PAGE_SIZE = 6

function getPageSize(): number {
  return websiteConfig.blog?.paginationSize ?? DEFAULT_PAGE_SIZE
}

export function getSortedPosts(): Blog[] {
  return [...allBlogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getPostBySlug(slug: string): Blog | undefined {
  return allBlogs.find((p) => (p as Blog & { _meta: { path: string } })._meta.path === slug)
}

export function getPaginatedPosts(page: number): {
  posts: Blog[]
  totalPages: number
  currentPage: number
} {
  const pageSize = getPageSize()
  const sorted = getSortedPosts()
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const start = (currentPage - 1) * pageSize
  const posts = sorted.slice(start, start + pageSize)
  return { posts, totalPages, currentPage }
}
