import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layout/AppShell'
import { describe, expect, it } from 'vitest'

describe('AppShell', () => {
  it('renders marketing chrome and outlet content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<h1>Page body</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Spenny' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page body' })).toBeInTheDocument()
  })
})
