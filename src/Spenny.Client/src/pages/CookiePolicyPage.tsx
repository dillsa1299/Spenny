/**
 * Cookie policy for Spenny: necessary auth cookies, consent storage, and preference controls.
 */
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_VERSION } from '@/consent/cookieConsentStorage'
import { useCookieConsent } from '@/consent/CookieConsentContext'
import { LegalDocumentLayout } from '@/layout/LegalDocumentLayout'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact'

const LAST_UPDATED = '27 October 2026'

export function CookiePolicyPage() {
  const { openSettings } = useCookieConsent()

  return (
    <LegalDocumentLayout>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Cookie policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last updated: {LAST_UPDATED}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          This policy explains how Spenny uses cookies and similar technologies in your browser. For
          how we handle personal data more broadly, see our{' '}
          <Link component={RouterLink} to="/privacy" underline="hover">
            privacy policy
          </Link>
          .
        </Typography>

        <Divider />

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            1. What cookies and similar storage are
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Cookies are small text files that a site stores on your device. Some are essential for
            sign-in and security; others can be used for analytics or marketing. Spenny also uses
            browser <strong>localStorage</strong> to remember your cookie preference. That is not a
            cookie, but we describe it here because it supports the same choice.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We tell you what we use, keep strictly necessary cookies available for the service to
            work, and ask before enabling non-essential cookies.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            2. How Spenny uses cookies
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spenny uses cookies to authenticate you and complete sign-in. We do not place advertising
            or analytics cookies in the client. If we add non-essential cookies or scripts later, they
            will not run unless you choose <strong>Accept all</strong>.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            3. Strictly necessary cookies
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            These cookies are required for signed-in use of Spenny. They remain available whether you
            accept or reject non-essential cookies. Rejecting non-essential cookies does not turn
            them off.
          </Typography>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              'th, td': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                textAlign: 'left',
                verticalAlign: 'top',
                py: 1.25,
                pr: 1.5,
                typography: 'body2',
                color: 'text.secondary',
              },
              th: { fontWeight: 700, color: 'text.primary' },
            }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>spenny.auth</code>
                </td>
                <td>Keeps you signed in so the app can call the API with your session.</td>
                <td>
                  HttpOnly; SameSite=Lax; Secure on HTTPS; sliding lifetime of about 14 days.
                </td>
              </tr>
              <tr>
                <td>
                  <code>spenny.auth.external</code>
                </td>
                <td>Used briefly during Google sign-in when that option is available.</td>
                <td>HttpOnly; SameSite=Lax; Secure on HTTPS.</td>
              </tr>
            </tbody>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            During Google sign-in, Google and the authentication flow may also set short-lived
            correlation or state cookies required to complete sign-in securely. Those cookies exist
            only to finish authentication.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            4. Consent preference (localStorage)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            When you choose <strong>Accept all</strong> or <strong>Reject non-essential</strong>, we
            store that decision in this browser under the localStorage key{' '}
            <code>{COOKIE_CONSENT_STORAGE_KEY}</code>, with policy version{' '}
            <code>{COOKIE_CONSENT_VERSION}</code>, a decision value, and a timestamp.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This record is used only to remember your choice and to gate future non-essential
            scripts. It is not used for advertising. It stays until you clear site data for this
            origin, or until we bump the policy version after a material change and ask again.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            5. Analytics and marketing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spenny does not load analytics, advertising, or marketing cookies or scripts in the
            client. Non-essential technology will not run unless you accept.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            6. Managing your preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            On your first visit we show a banner with <strong>Accept all</strong> and{' '}
            <strong>Reject non-essential</strong>. You can change that choice at any time by selecting{' '}
            <Link component="button" type="button" onClick={openSettings} underline="hover">
              change cookie settings
            </Link>
            , which reopens the banner.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can also clear cookies and site data in your browser settings. Clearing cookies will
            sign you out; clearing localStorage may cause the banner to appear again.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            7. Changes to this policy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If we change how cookies work in a material way, we will update this page and the "Last
            updated" date. We may also increase the consent policy version so returning visitors are
            asked again.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            8. Contact
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For questions about cookies, email{' '}
            <Link href={SUPPORT_MAILTO} underline="hover">
              {SUPPORT_EMAIL}
            </Link>
            , or visit the{' '}
            <Link component={RouterLink} to="/contact" underline="hover">
              contact
            </Link>{' '}
            page.
          </Typography>
        </section>

        <Divider />

        <Typography variant="body2" color="text.secondary">
          Related:{' '}
          <Link component="button" type="button" onClick={openSettings} underline="hover">
            Change cookie settings
          </Link>
          {' · '}
          <Link component={RouterLink} to="/privacy" underline="hover">
            Privacy policy
          </Link>
          {' · '}
          <Link component={RouterLink} to="/contact" underline="hover">
            Contact
          </Link>
          {' · '}
          <Link component={RouterLink} to="/" underline="hover">
            Home
          </Link>
        </Typography>
      </Stack>
    </LegalDocumentLayout>
  )
}
