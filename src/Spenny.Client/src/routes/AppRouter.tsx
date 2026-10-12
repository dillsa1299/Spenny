// Application routes: public marketing, auth flows, and authenticated app shell.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/auth/GuestOnly'
import { RequireDomainAccess } from '@/auth/RequireDomainAccess'
import { AppShell } from '@/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { LandingPage } from '@/pages/LandingPage'
import { CheckEmailPage } from '@/pages/auth/CheckEmailPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            path="/"
            element={
              <GuestOnly>
                <LandingPage />
              </GuestOnly>
            }
          />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/check-email" element={<CheckEmailPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireDomainAccess>
                <DashboardPage />
              </RequireDomainAccess>
            }
          />
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
