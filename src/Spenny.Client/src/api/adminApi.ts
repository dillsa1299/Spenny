// Admin aggregate metrics (no PII); requires operator session.
import { apiFetch, readApiError } from '@/api/apiClient'

export type AdminStats = {
  totalUsers: number
  signUpsLast24Hours: number
  signUpsLast7Days: number
  uniqueLoginsLast24Hours: number
  googleAccounts: number
  localAccounts: number
  totalSpendingSeries: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await apiFetch('/api/admin/stats')
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as AdminStats
}
