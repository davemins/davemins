import { useEffect, useState } from 'react'
import { fetchPosts } from '../services/api'
import type { PostListItem } from '../types/how'

export function usePosts(lang = 'ko') {
  const [data, setData] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchPosts(lang)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [lang])

  return { data, loading, error }
}
