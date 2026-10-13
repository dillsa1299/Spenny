// Intentional v1 teaser: Income tracking is planned, not a broken route.
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function IncomePage() {
  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Income
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          '@media (prefers-reduced-transparency: reduce)': {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.12em' }}>
          Coming soon
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mt: 1, letterSpacing: '-0.02em' }}>
          Money-in tracking is on the way
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Spenny v1 focuses on scheduled spending and your month burndown. Income will sit alongside
          that picture when it ships — this tab is here so you know it is planned, not missing.
        </Typography>
      </Paper>
    </Stack>
  )
}
