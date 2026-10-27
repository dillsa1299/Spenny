/**
 * Shared chrome for public legal pages: readable article width and banner clearance.
 */
import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import { COOKIE_BANNER_CLEARANCE_PX } from '@/consent/cookieConsentLayout'
import { useCookieConsent } from '@/consent/CookieConsentContext'

type LegalDocumentLayoutProps = {
  children: ReactNode
}

export function LegalDocumentLayout({ children }: LegalDocumentLayoutProps) {
  const { bannerOpen } = useCookieConsent()

  return (
    <Box
      component="article"
      sx={{
        maxWidth: 720,
        // Fixed cookie bar sits over the viewport; leave room to scroll the closing copy clear.
        pb: bannerOpen ? `${COOKIE_BANNER_CLEARANCE_PX}px` : 4,
      }}
    >
      {children}
    </Box>
  )
}
