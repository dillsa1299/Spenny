/**
 * Privacy policy for Spenny: accounts, spending data, email, OAuth, and contact.
 */
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { LegalDocumentLayout } from '@/layout/LegalDocumentLayout'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact'

const LAST_UPDATED = '27 October 2026'

export function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Privacy policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last updated: {LAST_UPDATED}
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          This privacy policy explains what personal data Spenny collects, why we collect it, how we
          use it, and the choices you have. For cookies and similar technologies, see our{' '}
          <Link component={RouterLink} to="/cookies" underline="hover">
            cookie policy
          </Link>
          .
        </Typography>

        <Divider />

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            1. Who we are
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Spenny is a personal bill and spending tracker. You create an individual account and keep
            your own scheduled spending (bills, subscriptions, and planned payments) so you can see
            what remains for a given calendar month.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spenny is a single-user product: each account is private to the signed-in person. There
            are no household or shared-budget features.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            2. What data we collect
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Depending on how you use Spenny, we may process:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
              <strong>Account details</strong>: email address, password (stored only as a secure
              hash for local accounts), display name, registration time, and whether the account is
              local or signed in with Google.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
              <strong>Authentication metadata</strong>: session information needed to keep you
              signed in, email verification and password-reset tokens for local accounts, and, when
              you use Google sign-in, the identifiers Google returns to complete that sign-in.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
              <strong>Spending data you enter</strong>: names, amounts (GBP), dates, recurrence,
              categories, optional descriptions, and any one-off exceptions you create for a single
              date.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
              <strong>Sign-in activity for admin metrics</strong>: successful sign-ins record your
              user id and a UTC timestamp so we can produce aggregate usage statistics (for example
              how many unique logins occurred recently). These records are not a full activity log of
              what you do inside the app.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Technical request data</strong>: IP address and standard HTTP metadata used
              for security, rate limiting, and reliability. We do not run advertising or analytics
              trackers in the client.
            </Typography>
          </Box>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            3. Why we use your data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            We use personal data to:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
            <Typography component="li" variant="body2">
              Create and secure your account, verify email for local sign-up, and reset passwords
            </Typography>
            <Typography component="li" variant="body2">
              Keep you signed in and authorise access only to your own data
            </Typography>
            <Typography component="li" variant="body2">
              Provide the Dashboard, Spending, and related product features you request
            </Typography>
            <Typography component="li" variant="body2">
              Send transactional email (verification and password reset), not marketing newsletters
            </Typography>
            <Typography component="li" variant="body2">
              Protect the service (rate limiting, abuse prevention, and operational monitoring)
            </Typography>
            <Typography component="li" variant="body2">
              Produce anonymised or aggregated admin statistics where an administrator role exists
            </Typography>
          </Box>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            4. Legal bases
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Where UK GDPR / EU GDPR apply, we rely on <strong>performance of a contract</strong>{' '}
            (providing the Spenny service you signed up for), <strong>legitimate interests</strong>{' '}
            (securing the service, understanding aggregate usage, and improving reliability), and, for
            non-essential cookies or similar technology if we add them later,{' '}
            <strong>consent</strong>. Strictly necessary session cookies are used to deliver the
            signed-in service and are described in our{' '}
            <Link component={RouterLink} to="/cookies" underline="hover">
              cookie policy
            </Link>
            .
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            5. How we store and protect data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Account and spending data are stored in a PostgreSQL database operated as part of the
            Spenny service. Passwords for local accounts are hashed by ASP.NET Core Identity and are
            never stored in plain text. Session cookies used for sign-in are HttpOnly and use
            SameSite=Lax; they are marked Secure when the site is served over HTTPS.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access to domain features (Dashboard, Spending, and similar) requires a verified session.
            We apply rate limiting at the API. No security measure is perfect; please choose a strong
            unique password for local accounts and protect access to your devices.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            6. Sharing and third parties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            We do not sell your personal data. We share data only as needed to run the service:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary' }}>
            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
              <strong>Google</strong>: if you choose Google sign-in, Google authenticates you and we
              receive the information required to create or link your Spenny session. Google's privacy
              policy applies to Google's processing.
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1.5 }}>
              <strong>Email delivery</strong>: verification and password-reset messages are sent
              through our email delivery provider.
            </Typography>
            <Typography component="li" variant="body2">
              <strong>Hosting and infrastructure</strong>: servers, databases, and related platform
              providers process data as needed to host Spenny. We do not load third-party advertising
              or analytics scripts in the client application.
            </Typography>
          </Box>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            7. Retention
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We keep your account and spending data while your account remains open so the product can
            work for you. Session cookies use a sliding lifetime of about 14 days. Consent preferences
            stored in your browser remain until you clear site data or we ask again after a material
            policy change. If you delete your account or ask us to erase data, we remove or anonymise
            personal data we no longer need, except where we must retain limited records for security,
            dispute, or legal obligations.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            8. Your choices and rights
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            You can update your display name and related profile details in the app, change your
            password for local accounts, and manage cookie preferences from the{' '}
            <Link component={RouterLink} to="/cookies" underline="hover">
              cookie policy
            </Link>{' '}
            page.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Depending on where you live, you may have rights to access, correct, delete, or restrict
            processing of your personal data, and to object or complain to a supervisory authority
            (for example the ICO in the UK). Contact us using the details below to exercise these
            rights.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            9. Children
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spenny is not directed at children. Do not create an account if you are below the age at
            which you can consent to online services in your country.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            10. Changes to this policy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We may update this page when our practices change. The "Last updated" date at the top will
            change when we do. Material changes to cookie use may also bump the consent policy version
            so the cookie banner can ask again.
          </Typography>
        </section>

        <section>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            11. Contact
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For privacy questions, email{' '}
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
          <Link component={RouterLink} to="/cookies" underline="hover">
            Cookie policy
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
