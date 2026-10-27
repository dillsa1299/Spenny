import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CookieConsentProvider } from '@/consent/CookieConsentContext'
import { LegalDocumentLayout } from '@/layout/LegalDocumentLayout'
import { beforeEach, describe, expect, it } from 'vitest'

describe('LegalDocumentLayout', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders article children', () => {
    render(
      <MemoryRouter>
        <CookieConsentProvider>
          <LegalDocumentLayout>
            <h1>Policy</h1>
          </LegalDocumentLayout>
        </CookieConsentProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('article')).toContainElement(screen.getByRole('heading', { name: 'Policy' }))
  })
})
