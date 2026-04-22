import { useEffect, useState } from 'react'
import { fetchWho } from '../services/api'
import type { WhoData } from '../types/who'

export function useWho(lang = 'ko') {
  const [data, setData] = useState<WhoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchWho(lang)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [lang])

  return { data, loading, error }
}
