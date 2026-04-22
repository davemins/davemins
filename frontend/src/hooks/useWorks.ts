import { useEffect, useState } from 'react'
import { fetchWorks } from '../services/api'
import type { WorkItem, WorkCategory } from '../types/what'

export function useWorks(lang = 'ko', category?: WorkCategory) {
  const [data, setData] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchWorks(lang, category)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [lang, category])

  return { data, loading, error }
}
