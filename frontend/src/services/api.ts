import type { WhoData } from '../types/who'
import type { WorkItem, WorkCategory } from '../types/what'
import type { PostListItem, PostDetail } from '../types/how'

const BASE = '/api'

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function fetchWho(lang = 'ko') {
  return get<WhoData>(`${BASE}/who`, { lang })
}

export function fetchWorks(lang = 'ko', category?: WorkCategory) {
  const params: Record<string, string> = { lang }
  if (category) params.category = category
  return get<WorkItem[]>(`${BASE}/what`, params)
}

export function fetchWork(id: number, lang = 'ko') {
  return get<WorkItem>(`${BASE}/what/${id}`, { lang })
}

export function fetchPosts(lang = 'ko') {
  return get<PostListItem[]>(`${BASE}/how`, { lang })
}

export function fetchPost(slug: string, lang = 'ko') {
  return get<PostDetail>(`${BASE}/how/${slug}`, { lang })
}

export async function sendContact(name: string, email: string, message: string) {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
