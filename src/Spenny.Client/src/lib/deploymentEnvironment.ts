import { useEffect, useState } from 'react'
import { apiFetch } from '@/api/apiClient'

type HealthPayload = {
  status?: string
  environment?: string
}

/** True when the API reports ASP.NET Core Development; false when Production or health is unavailable. */
export function useShowDevelopmentBanner(): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const response = await apiFetch('/api/health')
        if (!response.ok) {
          return
        }
        const body = (await response.json()) as HealthPayload
        if (!cancelled && body.environment === 'Development') {
          setShow(true)
        }
      } catch {
        // Anonymous health probe; ignore network errors (banner stays hidden).
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return show
}
