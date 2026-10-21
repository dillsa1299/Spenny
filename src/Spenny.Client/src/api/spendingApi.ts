// Spending series CRUD and month projection API.
import { apiFetch, readApiError } from '@/api/apiClient'
import type {
  SpendingExceptionWrite,
  SpendingMonthDto,
  SpendingSeriesDto,
  SpendingSeriesWrite,
} from '@/api/spendingTypes'

async function ensureOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
}

export async function fetchSpendingMonth(year: number, month: number): Promise<SpendingMonthDto> {
  const response = await apiFetch(`/api/spending/months/${year}/${month}`)
  await ensureOk(response)
  return (await response.json()) as SpendingMonthDto
}

export async function listSpendingSeries(): Promise<SpendingSeriesDto[]> {
  const response = await apiFetch('/api/spending/series')
  await ensureOk(response)
  return (await response.json()) as SpendingSeriesDto[]
}

export async function createSpendingSeries(body: SpendingSeriesWrite): Promise<SpendingSeriesDto> {
  const response = await apiFetch('/api/spending/series', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  await ensureOk(response)
  return (await response.json()) as SpendingSeriesDto
}

export async function updateSpendingSeries(
  id: string,
  body: SpendingSeriesWrite,
): Promise<SpendingSeriesDto> {
  const response = await apiFetch(`/api/spending/series/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  await ensureOk(response)
  return (await response.json()) as SpendingSeriesDto
}

export async function deleteSpendingSeries(id: string): Promise<void> {
  const response = await apiFetch(`/api/spending/series/${id}`, { method: 'DELETE' })
  await ensureOk(response)
}

export async function upsertSpendingException(
  seriesId: string,
  occurrenceDate: string,
  body: SpendingExceptionWrite,
): Promise<void> {
  const response = await apiFetch(
    `/api/spending/series/${seriesId}/exceptions/${occurrenceDate}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
  await ensureOk(response)
}

export async function skipSpendingOccurrence(seriesId: string, occurrenceDate: string): Promise<void> {
  const response = await apiFetch(
    `/api/spending/series/${seriesId}/exceptions/${occurrenceDate}`,
    { method: 'DELETE' },
  )
  await ensureOk(response)
}
