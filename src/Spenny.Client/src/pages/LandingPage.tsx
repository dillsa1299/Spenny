// Public landing: Apple-inspired hero, materials, and a static burndown preview (no API).
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { BlurText } from '@/components/BlurText'
import { PressableButton } from '@/components/PressableButton'
import { BurndownChart } from '@/components/spending/BurndownChart'
import { ComingUpList } from '@/components/spending/ComingUpList'
import { landingDemoMonth } from '@/landing/landingDemoMonth'
import { comingUpEmptyMessage } from '@/spending/comingUpCopy'

const demo = landingDemoMonth

const highlights = ["See what's left", "See what's next", 'Mobile-first'] as const

const demoSectionSx = {
  width: '100%',
  minWidth: 0,
  borderRadius: { xs: 2.5, sm: 3 },
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 28px 64px rgba(0, 0, 0, 0.45)',
  overflow: 'hidden',
}

const demoHeaderSurfaceSx = {
  p: { xs: 2.25, sm: 3 },
  pb: { xs: 2, sm: 2.25 },
  backgroundColor: 'rgba(22, 27, 34, 0.55)',
  backdropFilter: 'blur(28px) saturate(165%)',
  '@media (prefers-reduced-transparency: reduce)': {
    backdropFilter: 'none',
    backgroundColor: 'background.paper',
  },
}

const demoChartBlockSx = {
  p: { xs: 2.25, sm: 3 },
  pt: { xs: 2, sm: 2.25 },
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: 'background.paper',
  '@media (prefers-reduced-transparency: reduce)': {
    borderTopColor: 'divider',
  },
}

export function LandingPage() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 920,
        mx: 'auto',
        minWidth: 0,
      }}
    >
      <Stack spacing={{ xs: 5, md: 7 }} sx={{ position: 'relative' }}>
        <Stack
          component="header"
          spacing={{ xs: 2.5, sm: 3 }}
          sx={{ alignItems: 'center', textAlign: 'center', pt: { xs: 0.5, md: 1 } }}
        >
          <BlurText
            text="Spenny"
            as="h1"
            className="font-bold tracking-tight text-[#52b788] text-5xl sm:text-6xl md:text-7xl"
          />
          <Typography
            component="h2"
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.12,
              fontSize: { xs: '1.375rem', sm: '1.75rem', md: '2rem' },
              maxWidth: '22ch',
              color: 'text.primary',
            }}
          >
            What&apos;s left of this month?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.55,
              fontSize: { xs: '1.0625rem', sm: '1.1875rem' },
              maxWidth: '38ch',
              fontWeight: 500,
            }}
          >
            Your month in one place - what&apos;s committed, what&apos;s still ahead.
          </Typography>

          <Stack
            direction="row"
            useFlexGap
            spacing={0}
            sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 1, pt: 0.5 }}
          >
            {highlights.map((label) => (
              <Box
                key={label}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 999,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  color: 'text.primary',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  '@media (prefers-reduced-transparency: reduce)': {
                    backgroundColor: 'action.hover',
                    borderColor: 'divider',
                  },
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            sx={{ width: { xs: '100%', sm: 'auto' }, pt: 0.5 }}
          >
            <PressableButton
              component={RouterLink}
              to="/sign-up"
              variant="contained"
              size="large"
              sx={{
                px: 3,
                py: 1.25,
                fontSize: '1.0625rem',
                borderRadius: 999,
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 8px 24px rgba(82, 183, 136, 0.28)',
              }}
            >
              Join now
            </PressableButton>
            <PressableButton
              component={RouterLink}
              to="/sign-in"
              variant="outlined"
              size="large"
              sx={{
                px: 3,
                py: 1.25,
                fontSize: '1.0625rem',
                borderRadius: 999,
                width: { xs: '100%', sm: 'auto' },
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              Sign in
            </PressableButton>
          </Stack>
        </Stack>

        <Box component="section" aria-labelledby="landing-demo-heading" sx={demoSectionSx}>
          <Box sx={demoHeaderSurfaceSx}>
            <Stack spacing={0.75}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  color: 'primary.main',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  lineHeight: 1.2,
                }}
              >
                Preview
              </Typography>
              <Typography id="landing-demo-heading" variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                See it in action
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Example data — not your account.
              </Typography>
            </Stack>
          </Box>

          <Box sx={demoChartBlockSx}>
            <BurndownChart
              year={demo.year}
              month={demo.month}
              monthTotal={demo.monthTotal}
              burndownSteps={demo.burndownSteps}
              occurrences={demo.occurrences}
              showTodayMarker={demo.showTodayMarker}
              asOfDate={demo.asOfDate}
              remainingAtToday={demo.remainingAtToday}
            />

            <Stack spacing={0.75} sx={{ mt: 2.5 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' }, letterSpacing: '-0.02em' }}
              >
                Coming up
              </Typography>
              <ComingUpList
                occurrences={demo.occurrences}
                upcomingIds={demo.upcomingOccurrenceIds}
                emptyMessage={comingUpEmptyMessage(demo)}
              />
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}
