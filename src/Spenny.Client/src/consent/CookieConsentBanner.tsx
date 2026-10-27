/**
 * Full-width cookie bar fixed to the bottom of the viewport.
 * On signed-in routes it sits just above the primary bottom navigation.
 */
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useId, useRef } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { PressableButton } from '@/components/PressableButton'
import { AUTH_BOTTOM_NAV_OFFSET_PX, pathHasBottomNav } from '@/consent/cookieConsentLayout'
import { shellNavChromeSx } from '@/theme/surfaces'

type CookieConsentBannerProps = {
  onAccept: () => void
  onReject: () => void
}

export function CookieConsentBanner({ onAccept, onReject }: CookieConsentBannerProps) {
  const titleId = useId()
  const descriptionId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { pathname } = useLocation()
  const aboveBottomNav = pathHasBottomNav(pathname)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <Box
      component="div"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: aboveBottomNav ? AUTH_BOTTOM_NAV_OFFSET_PX : 0,
        zIndex: (theme) => theme.zIndex.snackbar + 1,
        ...shellNavChromeSx,
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
    >
      <Container maxWidth="sm" disableGutters sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1.5}>
          <Typography
            ref={headingRef}
            id={titleId}
            component="h2"
            variant="subtitle2"
            tabIndex={-1}
            sx={{ fontWeight: 700, outline: 'none' }}
          >
            Cookies
          </Typography>
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            We use strictly necessary cookies to keep you signed in. We do not use analytics or
            marketing cookies unless you accept. You can change this later.{' '}
            <Link component={RouterLink} to="/cookies" underline="hover">
              Cookies
            </Link>
            {' · '}
            <Link component={RouterLink} to="/privacy" underline="hover">
              Privacy
            </Link>
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            <PressableButton
              variant="outlined"
              color="inherit"
              onClick={onReject}
              sx={{ flex: 1, fontWeight: 600 }}
            >
              Reject non-essential
            </PressableButton>
            <PressableButton
              variant="outlined"
              color="inherit"
              onClick={onAccept}
              sx={{ flex: 1, fontWeight: 600 }}
            >
              Accept all
            </PressableButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
