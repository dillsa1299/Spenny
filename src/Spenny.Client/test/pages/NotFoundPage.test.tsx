import { render, screen } from '@testing-library/react'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { describe, expect, it } from 'vitest'

describe('NotFoundPage', () => {
  it('shows non-revealing copy', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
