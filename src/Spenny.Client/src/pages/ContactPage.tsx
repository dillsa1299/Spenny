/**
 * Contact page: how to reach Spenny support by email.
 */
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { LegalDocumentLayout } from '@/layout/LegalDocumentLayout'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/supportContact'

export function ContactPage() {
  return (
    <LegalDocumentLayout>
      <Stack spacing={3}>
        <Box>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            Contact
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          For questions about Spenny, including your account, privacy, or cookies, email us at{' '}
          <Link href={SUPPORT_MAILTO} underline="hover">
            {SUPPORT_EMAIL}
          </Link>
          .
        </Typography>

        <Typography variant="body2" color="text.secondary">
          We aim to reply as soon as we can. Please include enough detail for us to help (for example
          the email on your account, and what you were trying to do).
        </Typography>

        <Divider />

        <Typography variant="body2" color="text.secondary">
          Related:{' '}
          <Link component={RouterLink} to="/privacy" underline="hover">
            Privacy policy
          </Link>
          {' · '}
          <Link component={RouterLink} to="/cookies" underline="hover">
            Cookie policy
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
