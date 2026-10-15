import { render, screen } from '@testing-library/react'
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider'
import { describe, expect, it } from 'vitest'

describe('SmoothScrollProvider', () => {
  it('renders children when reduced motion is preferred', () => {
    render(
      <SmoothScrollProvider>
        <p>Scroll child</p>
      </SmoothScrollProvider>,
    )
    expect(screen.getByText('Scroll child')).toBeInTheDocument()
  })
})
