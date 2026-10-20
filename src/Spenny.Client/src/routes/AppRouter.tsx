// Application routes: public marketing, auth flows, and authenticated app shell.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly } from '@/auth/GuestOnly'
import { RequireDomainAccessLayout } from '@/auth/RequireDomainAccessLayout'
import { AppShell } from '@/layout/AppShell'
import { AuthenticatedShell } from '@/layout/AuthenticatedShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { IncomePage } from '@/pages/IncomePage'
import { LandingPage } from '@/pages/LandingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SpendingPage } from '@/pages/SpendingPage'
import { CheckEmailPage } from '@/pages/auth/CheckEmailPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { SignInPage } from '@/pages/auth/SignInPage'
import { SignUpPage } from '@/pages/auth/SignUpPage'
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage'
import { RouteTitleLayout } from '@/routes/RouteTitleLayout'

/** Route tree shared by BrowserRouter (app) and MemoryRouter (tests). */
export function AppRouteTree() {
  return (
    <Route element={<RouteTitleLayout />}>
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
        </Route>

        <Route element={<RequireDomainAccessLayout />}>
          <Route element={<AuthenticatedShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/spending" element={<SpendingPage />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
    </Route>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>{AppRouteTree()}</Routes>
    </BrowserRouter>
  )
}
