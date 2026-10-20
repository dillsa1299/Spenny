import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RouteTitleLayout } from '@/routes/RouteTitleLayout'
import { APP_DOCUMENT_TITLE } from '@/lib/routeDocumentTitle'
import { describe, expect, it } from 'vitest'

describe('RouteTitleLayout', () => {
  it('updates document.title when the route changes', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<RouteTitleLayout />}>
            <Route path="/dashboard" element={<p>Dashboard</p>} />
            <Route path="/" element={<p>Home</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(document.title).toBe(`Dashboard · ${APP_DOCUMENT_TITLE}`)
    })
  })
})
