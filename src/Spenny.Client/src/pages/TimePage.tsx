// Server time test page: fetches GET /api/time and shows loading, error and success states.
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { fetchServerTime, type ServerTimeResponse } from '@/api/timeApi'
import { BlurText } from '@/components/BlurText'

export function TimePage() {
  const [data, setData] = useState<ServerTimeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function load(attempt = 0) {
      try {
        setData(await fetchServerTime(controller.signal))
      } catch (err) {
        if (
          !controller.signal.aborted &&
          attempt < 4 &&
          err instanceof Error &&
          err.message.includes('Could not reach the API')
        ) {
          await new Promise((r) => setTimeout(r, 1500))
          if (!controller.signal.aborted) {
            return load(attempt + 1)
          }
        }
        if (controller.signal.aborted) return
        setError(err instanceof Error ? err.message : 'Failed to load server time.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => controller.abort()
  }, [])

  return (
    <Stack spacing={3} sx={{ maxWidth: 520 }}>
      <BlurText text="Server time" as="h1" className="text-3xl font-bold text-[#1b4332]" />
      <Typography color="text.secondary">
        This page calls the API and displays the server time.
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {data && !loading && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>UTC:</strong> {data.utc}
            </Typography>
            <Typography variant="body2">
              <strong>Local:</strong> {data.local}
            </Typography>
            <Typography variant="body2">
              <strong>Time zone:</strong> {data.timeZoneId}
            </Typography>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
