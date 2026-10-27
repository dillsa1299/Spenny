// Shared bottom-sheet handle and header chrome.
import { render, screen } from '@testing-library/react'
import { BottomSheetHandle, BottomSheetHeader } from '@/components/BottomSheetChrome'
import { describe, expect, it } from 'vitest'

describe('BottomSheetChrome', () => {
  it('renders handle and titled header', () => {
    const { container } = render(
      <>
        <BottomSheetHandle />
        <BottomSheetHeader icon={<span aria-hidden>+</span>} title="Sheet title" subtitle="Details" />
      </>,
    )

    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Sheet title' })).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })
})
