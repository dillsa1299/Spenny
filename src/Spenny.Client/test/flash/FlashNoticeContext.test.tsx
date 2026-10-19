import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FlashNoticeProvider, useFlashNotice } from '@/flash/FlashNoticeContext'
import { describe, expect, it } from 'vitest'

function FlashTrigger() {
  const { showFlash } = useFlashNotice()
  return (
    <button type="button" onClick={() => showFlash({ severity: 'success', message: 'Done.' })}>
      Flash
    </button>
  )
}

describe('FlashNoticeProvider', () => {
  it('shows a snackbar when showFlash is called', async () => {
    const user = userEvent.setup()
    render(
      <FlashNoticeProvider>
        <FlashTrigger />
      </FlashNoticeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Flash' }))

    await waitFor(() => {
      expect(screen.getByText('Done.')).toBeInTheDocument()
    })
  })
})
