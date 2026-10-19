// App-level transient notices (snackbar) that survive route changes; set before navigate.
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type FlashNotice = {
  message: string
  severity: 'success' | 'info' | 'warning' | 'error'
}

type FlashNoticeContextValue = {
  showFlash: (notice: FlashNotice) => void
}

const FlashNoticeContext = createContext<FlashNoticeContextValue | null>(null)

export function FlashNoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<FlashNotice | null>(null)
  const [open, setOpen] = useState(false)

  const showFlash = useCallback((next: FlashNotice) => {
    setNotice(next)
    setOpen(true)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(() => ({ showFlash }), [showFlash])

  return (
    <FlashNoticeContext.Provider value={value}>
      {children}
      <Snackbar
        open={open && notice !== null}
        autoHideDuration={8000}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notice ? (
          <Alert severity={notice.severity} variant="filled" onClose={close} sx={{ width: '100%' }}>
            {notice.message}
          </Alert>
        ) : null}
      </Snackbar>
    </FlashNoticeContext.Provider>
  )
}

export function useFlashNotice(): FlashNoticeContextValue {
  const ctx = useContext(FlashNoticeContext)
  if (!ctx) {
    throw new Error('useFlashNotice must be used within FlashNoticeProvider')
  }
  return ctx
}
