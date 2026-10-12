// Public landing with value prop and auth CTAs.
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { BlurText } from '@/components/BlurText'
import { PressableButton } from '@/components/PressableButton'

export function LandingPage() {
  return (
    <Stack spacing={4} sx={{ alignItems: 'flex-start', maxWidth: 640 }}>
      <BlurText text="Spenny" as="h1" className="text-4xl md:text-5xl font-bold text-[#52b788]" />
      <Typography variant="h5" color="text.secondary" sx={{ lineHeight: 1.4 }}>
        See what is still committed to bills and planned spending this month — without a bank-app feel.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <PressableButton component={RouterLink} to="/sign-up" variant="contained" size="large">
          Join now
        </PressableButton>
        <PressableButton component={RouterLink} to="/sign-in" variant="outlined" size="large">
          Sign in
        </PressableButton>
      </Stack>
    </Stack>
  )
}
