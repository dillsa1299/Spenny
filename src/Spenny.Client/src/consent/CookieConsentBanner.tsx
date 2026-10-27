/**
 * Fixed bottom cookie consent dialog: equal-weight Accept / Reject and a policy link.
 * Sits above authenticated bottom nav via safe bottom offset; does not gate auth cookies.
 */
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useId, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { PressableButton } from '@/components/PressableButton'
import { glassPanelSx } from '@/theme/surfaces'

type CookieConsentBannerProps = {
  onAccept: () => void
  onReject: () => void
}

export function CookieConsentBanner({ onAccept, onReject }: CookieConsentBannerProps) {
  const titleId = useId()
  const descriptionId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.snackbar + 1,
        px: 2,
        pb: { xs: 10, sm: 10 },
        pt: 1,
        pointerEvents: 'none',
      }}
    >
      <Paper
        component="div"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        elevation={0}
        sx={{
          pointerEvents: 'auto',
          maxWidth: 720,
          mx: 'auto',
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          ...glassPanelSx,
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Stack spacing={2}>
          <Typography
            ref={headingRef}
            id={titleId}
            component="h2"
            variant="subtitle1"
            tabIndex={-1}
            sx={{ fontWeight: 700, outline: 'none' }}
          >
            Cookies
          </Typography>
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            We use strictly necessary cookies to keep you signed in. We do not use analytics or
            marketing cookies unless you accept. You can change this later.{' '}
            <Link component={RouterLink} to="/cookies" underline="hover">
              Cookie policy
            </Link>
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: '100%' }}
          >
            <PressableButton
              variant="outlined"
              color="inherit"
              onClick={onReject}
              sx={{ flex: 1, fontWeight: 600, py: 1.25 }}
            >
              Reject non-essential
            </PressableButton>
            <PressableButton
              variant="outlined"
              color="primary"
              onClick={onAccept}
              sx={{ flex: 1, fontWeight: 600, py: 1.25 }}
            >
              Accept all
            </PressableButton>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
