import { render, screen } from '@testing-library/react'
import { BlurText } from '@/components/BlurText'
import { describe, expect, it } from 'vitest'

describe('BlurText', () => {
  it('renders headline text', () => {
    render(<BlurText text="Spenny" as="h1" />)
    expect(screen.getByRole('heading', { name: 'Spenny' })).toBeInTheDocument()
  })
})
