// Application routes: landing and the server time test.
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { TimePage } from '@/pages/TimePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/time" element={<TimePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
