/**
 * Global cookie consent: first-visit banner, persisted choice, and a revisit control.
 * Mount once in AppProviders so public and authenticated shells share the same gate.
 */
import Button from '@mui/material/Button'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CookieConsentBanner } from '@/consent/CookieConsentBanner'
import {
  clearCookieConsent,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentDecision,
  type CookieConsentRecord,
} from '@/consent/cookieConsentStorage'

type CookieConsentContextValue = {
  consent: CookieConsentRecord | null
  bannerOpen: boolean
  accept: () => void
  reject: () => void
  openSettings: () => void
  canLoadNonEssential: boolean
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(() => readCookieConsent())
  const [bannerForcedOpen, setBannerForcedOpen] = useState(false)

  const bannerOpen = consent === null || bannerForcedOpen

  const persist = useCallback((decision: CookieConsentDecision) => {
    const record = writeCookieConsent(decision)
    setConsent(record)
    setBannerForcedOpen(false)
  }, [])

  const accept = useCallback(() => {
    persist('accepted')
  }, [persist])

  const reject = useCallback(() => {
    persist('rejected')
  }, [persist])

  const openSettings = useCallback(() => {
    clearCookieConsent()
    setConsent(null)
    setBannerForcedOpen(true)
  }, [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      bannerOpen,
      accept,
      reject,
      openSettings,
      canLoadNonEssential: consent?.decision === 'accepted',
    }),
    [accept, bannerOpen, consent, openSettings, reject],
  )

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {bannerOpen ? <CookieConsentBanner onAccept={accept} onReject={reject} /> : null}
      {!bannerOpen ? (
        <Button
          type="button"
          variant="text"
          size="small"
          onClick={openSettings}
          sx={{
            position: 'fixed',
            left: 8,
            bottom: { xs: 72, sm: 72 },
            zIndex: (theme) => theme.zIndex.appBar - 1,
            color: 'text.secondary',
            textTransform: 'none',
            fontSize: '0.75rem',
            minWidth: 0,
            px: 1,
            py: 0.5,
            opacity: 0.85,
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          Cookie settings
        </Button>
      ) : null}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return ctx
}
