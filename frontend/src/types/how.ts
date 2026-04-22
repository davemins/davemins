export interface PostListItem {
  id: number
  slug: string
  title: string
  summary: string
  publishedAt: string
}

export interface PostDetail extends PostListItem {
  content: string
}
