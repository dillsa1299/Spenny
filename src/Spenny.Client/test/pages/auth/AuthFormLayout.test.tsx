import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthFormLayout } from '@/pages/auth/AuthFormLayout'
import { describe, expect, it } from 'vitest'

describe('AuthFormLayout', () => {
  it('renders title and children', () => {
    render(
      <MemoryRouter>
        <AuthFormLayout title="Test title" subtitle="Subtitle copy">
          <p>Form body</p>
        </AuthFormLayout>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 5, name: 'Test title' })).toBeInTheDocument()
    expect(screen.getByText('Subtitle copy')).toBeInTheDocument()
    expect(screen.getByText('Form body')).toBeInTheDocument()
  })
})
