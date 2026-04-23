export type WorkCategory = 'visual' | 'motion' | 'web' | 'audio' | 'game'

export interface WorkItem {
  id: number
  title: string
  description: string
  category: WorkCategory
  thumbnailUrl: string | null
  projectUrl: string | null
  year: number
  tags: string[]
  content: string
  coverImage: string | null
  images: string[]
}
