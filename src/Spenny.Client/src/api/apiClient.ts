// Shared fetch wrapper: same-origin /api proxy in dev, credentials for auth cookies.
function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.replace(/\/$/, '')
  }
  return ''
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const base = apiBaseUrl()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`

  return fetch(url, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

export async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string; title?: string; detail?: string }
    return body.message ?? body.title ?? body.detail ?? response.statusText
  } catch {
    return response.statusText
  }
}
