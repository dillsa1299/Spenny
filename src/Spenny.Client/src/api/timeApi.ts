// Calls the anonymous GET /api/time endpoint and maps failures to user-presentable errors.
function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.replace(/\/$/, '')
  }
  // Dev default: same-origin /api via Vite proxy (see vite.config.ts).
  return ''
}

export type ServerTimeResponse = {
  utc: string
  local: string
  timeZoneId: string
}

export async function fetchServerTime(signal?: AbortSignal): Promise<ServerTimeResponse> {
  const base = apiBaseUrl()
  const url = `${base}/api/time`

  let response: Response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    const hint = base === '' ? 'http://localhost:5050 (via Vite proxy)' : base
    throw new Error(
      `Could not reach the API at ${hint}. Use the Spenny (API + Client) startup profile (not the client alone), then open http://localhost:5050/api/time — you should see JSON.`,
      { cause: error },
    )
  }

  if (response.status === 429) {
    throw new Error('Too many requests. Try again shortly.')
  }

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error(
      'API returned HTML instead of JSON. Is Spenny.Api running on port 5050? In dev you can omit VITE_API_BASE_URL and use the Vite /api proxy.',
    )
  }

  return (await response.json()) as ServerTimeResponse
}
