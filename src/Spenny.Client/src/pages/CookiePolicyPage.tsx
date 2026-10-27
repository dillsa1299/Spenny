/**
 * Minimal cookie disclosure for current Spenny use (auth session + consent preference).
 * Engineering stub only — not a counsel-approved privacy policy; flag for legal review.
 */
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VERSION } from '@/consent/cookieConsentStorage'
import { useCookieConsent } from '@/consent/CookieConsentContext'

export function CookiePolicyPage() {
  const { openSettings } = useCookieConsent()

  return (
    <Box component="article" sx={{ maxWidth: 640 }}>
      <Stack spacing={2.5}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          Cookie policy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page describes how Spenny uses cookies and similar storage today. It is a technical
          disclosure for the product as built; it is not legal advice and has not been reviewed by
          counsel.
        </Typography>

        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
          Strictly necessary cookies
        </Typography>
        <Typography variant="body2" color="text.secondary">
          These cookies are required for sign-in and stay available whether you accept or reject
          non-essential cookies:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
          <Typography component="li" variant="body2">
            <strong>spenny.auth</strong> — keeps you signed in so the app can call the API with your
            session. HttpOnly, SameSite=Lax, Secure when the site is served over HTTPS. Sliding
            lifetime of about 14 days.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mt: 1 }}>
            <strong>spenny.auth.external</strong> — used briefly during Google sign-in when that
            option is configured. Same HttpOnly / SameSite / Secure attributes as above.
          </Typography>
        </Box>

        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
          Consent preference
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your Accept or Reject choice is stored in this browser under the localStorage key{' '}
          <code>{COOKIE_CONSENT_STORAGE_KEY}</code> (policy version {COOKIE_CONSENT_VERSION}). It is
          not used for advertising or analytics. The preference stays until you clear site data or
          we bump the policy version and ask again.
        </Typography>

        <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
          Analytics and marketing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Spenny does not load analytics or marketing cookies or scripts today. If we add them later,
          they will not run unless you choose Accept all.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          You can{' '}
          <Link component="button" type="button" onClick={openSettings} underline="hover">
            change cookie settings
          </Link>{' '}
          at any time, or return to the{' '}
          <Link component={RouterLink} to="/" underline="hover">
            home page
          </Link>
          .
        </Typography>
      </Stack>
    </Box>
  )
}
