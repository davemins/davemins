import type { WhoData } from '../types/who'
import type { WorkItem, WorkCategory } from '../types/what'
import type { PostListItem, PostDetail } from '../types/how'

// 프로덕션에서 VITE_API_BASE_URL에 백엔드 도메인 설정 (예: https://api.davemins.com)
// 개발 시에는 비워두면 Vite proxy가 처리
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function fetchWho(lang = 'ko') {
  return get<WhoData>('/api/who', { lang })
}

export function fetchWorks(lang = 'ko', category?: WorkCategory) {
  const params: Record<string, string> = { lang }
  if (category) params.category = category
  return get<WorkItem[]>('/api/what', params)
}

export function fetchWork(id: number, lang = 'ko') {
  return get<WorkItem>(`/api/what/${id}`, { lang })
}

export function fetchPosts(lang = 'ko') {
  return get<PostListItem[]>('/api/how', { lang })
}

export function fetchPost(slug: string, lang = 'ko') {
  return get<PostDetail>(`/api/how/${slug}`, { lang })
}

export async function sendContact(name: string, email: string, message: string) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
