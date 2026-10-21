// Operator dashboard: site-wide aggregate counts only (no PII in v1).
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { fetchAdminStats, type AdminStats } from '@/api/adminApi'
import { glassPanelSx } from '@/theme/surfaces'

type StatCardProps = {
  label: string
  value: number
  detail?: string
}

function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, ...glassPanelSx }}>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em' }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mt: 0.5 }}>
        {value.toLocaleString('en-GB')}
      </Typography>
      {detail ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {detail}
        </Typography>
      ) : null}
    </Paper>
  )
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchAdminStats()
        if (!cancelled) {
          setStats(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load admin statistics.')
          setStats(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ width: '100%', minWidth: 0 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
      >
        Admin
      </Typography>
      <Typography color="text.secondary">
        Aggregate site health metrics. Rolling windows use Europe/London time.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Typography color="text.secondary">Loading statistics…</Typography>
      ) : stats ? (
        <Stack spacing={2}>
          <StatCard label="Total registered users" value={stats.totalUsers} />
          <StatCard label="New sign-ups (24 hours)" value={stats.signUpsLast24Hours} />
          <StatCard label="New sign-ups (7 days)" value={stats.signUpsLast7Days} />
          <StatCard
            label="Unique logins (24 hours)"
            value={stats.uniqueLoginsLast24Hours}
            detail="Distinct users with at least one successful sign-in"
          />
          <StatCard
            label="Auth provider split"
            value={stats.googleAccounts + stats.localAccounts}
            detail={`Google ${stats.googleAccounts.toLocaleString('en-GB')} · Local ${stats.localAccounts.toLocaleString('en-GB')}`}
          />
          <StatCard label="Total Spending series" value={stats.totalSpendingSeries} />
        </Stack>
      ) : null}
    </Stack>
  )
}
