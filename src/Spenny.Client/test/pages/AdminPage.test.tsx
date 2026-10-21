import { render, screen, waitFor } from '@testing-library/react'
import { fetchAdminStats } from '@/api/adminApi'
import { fetchSession } from '@/api/authApi'
import { AuthProvider } from '@/auth/AuthContext'
import { AdminPage } from '@/pages/AdminPage'
import { adminSession } from '@/test/sessionFixtures'
import { describe, expect, it, vi } from 'vitest'

describe('AdminPage', () => {
  it('renders aggregate stat cards', async () => {
    vi.mocked(fetchSession).mockResolvedValue(adminSession)
    vi.mocked(fetchAdminStats).mockResolvedValue({
      totalUsers: 10,
      signUpsLast24Hours: 1,
      signUpsLast7Days: 3,
      uniqueLoginsLast24Hours: 2,
      googleAccounts: 4,
      localAccounts: 6,
      totalSpendingSeries: 42,
    })

    render(
      <AuthProvider>
        <AdminPage />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Total registered users')).toBeInTheDocument()
    })
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
