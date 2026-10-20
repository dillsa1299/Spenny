import { useEffect, useState } from 'react'
import { apiFetch } from '@/api/apiClient'

const environmentHeader = 'X-Spenny-Environment'

type HealthPayload = {
  status?: string
  environment?: string
}

function isDevelopmentResponse(response: Response): boolean {
  if (response.headers.get(environmentHeader) === 'Development') {
    return true
  }

  return false
}

async function isDevelopmentFromHealthJson(response: Response): Promise<boolean> {
  if (!response.ok) {
    return false
  }

  try {
    const body = (await response.json()) as HealthPayload
    return body.environment === 'Development'
  } catch {
    return false
  }
}

/** True when the API reports ASP.NET Core Development; false when Production or probes fail. */
export function useShowDevelopmentBanner(): boolean {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const session = await apiFetch('/api/auth/session')
        if (!cancelled && isDevelopmentResponse(session)) {
          setShow(true)
          return
        }

        const health = await apiFetch('/api/health')
        if (!cancelled && (isDevelopmentResponse(health) || await isDevelopmentFromHealthJson(health))) {
          setShow(true)
        }
      } catch {
        // Ignore network errors; banner stays hidden.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return show
}
