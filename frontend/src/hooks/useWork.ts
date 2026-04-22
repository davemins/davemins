import { useEffect, useState } from 'react'
import { fetchWork } from '../services/api'
import type { WorkItem } from '../types/what'

export function useWork(id: number, lang = 'ko') {
  const [data, setData] = useState<WorkItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchWork(id, lang)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id, lang])

  return { data, loading, error }
}
