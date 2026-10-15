import { render, screen } from '@testing-library/react'
import { AppProviders } from '@/providers/AppProviders'
import { describe, expect, it } from 'vitest'

describe('AppProviders', () => {
  it('renders children', () => {
    render(
      <AppProviders>
        <p>Child content</p>
      </AppProviders>,
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
