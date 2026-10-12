// Landing page with the animated hero and a link to the server time test.
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { BlurText } from '@/components/BlurText'

export function LandingPage() {
  return (
    <Stack spacing={4} sx={{ alignItems: 'flex-start', maxWidth: 640 }}>
      <BlurText text="Spenny" as="h1" className="text-4xl md:text-5xl font-bold text-[#1b4332]" />
      <Typography variant="h5" color="text.secondary">
        A simple, quirky bill tracker — see what is due and what is left to pay each month.
      </Typography>
      <Button component={RouterLink} to="/time" variant="contained" size="large">
        Check server time
      </Button>
    </Stack>
  )
}
