import { render, screen } from '@testing-library/react'
import { IncomePage } from '@/pages/IncomePage'
import { describe, expect, it } from 'vitest'

describe('IncomePage', () => {
  it('shows coming soon teaser', () => {
    render(<IncomePage />)
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })
})
