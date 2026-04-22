import { useEffect, useState } from 'react'
import { fetchPost } from '../services/api'
import type { PostDetail } from '../types/how'

export function usePost(slug: string, lang = 'ko') {
  const [data, setData] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchPost(slug, lang)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [slug, lang])

  return { data, loading, error }
}
