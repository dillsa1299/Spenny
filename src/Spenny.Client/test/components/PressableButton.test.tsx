import { render, screen } from '@testing-library/react'
import { PressableButton } from '@/components/PressableButton'
import { describe, expect, it } from 'vitest'

describe('PressableButton', () => {
  it('renders a button with the given label', () => {
    render(<PressableButton>Tap me</PressableButton>)
    expect(screen.getByRole('button', { name: 'Tap me' })).toBeInTheDocument()
  })
})
