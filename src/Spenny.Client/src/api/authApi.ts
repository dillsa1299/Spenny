// Auth API client for local account flows (cookie session).
import { apiFetch, readApiError } from '@/api/apiClient'

export type SessionUser = {
  id: string
  email: string
  displayName: string
  emailConfirmed: boolean
  authProvider: string
  isAdmin: boolean
}

export type SessionState =
  | { authenticated: false }
  | { authenticated: true; user: SessionUser; domainAccess: boolean }

export type AuthProviders = {
  google: boolean
}

export async function fetchAuthProviders(): Promise<AuthProviders> {
  const response = await apiFetch('/api/auth/providers')
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as AuthProviders
}

export function startGoogleSignIn(returnPath = '/dashboard'): void {
  const path = returnPath.startsWith('/') ? returnPath : `/${returnPath}`
  const url = `/api/auth/google?returnUrl=${encodeURIComponent(path)}`
  window.location.assign(url)
}

export async function fetchSession(): Promise<SessionState> {
  const response = await apiFetch('/api/auth/session')
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  const body = (await response.json()) as SessionState
  return body
}

export async function registerLocal(
  email: string,
  password: string,
  displayName: string,
): Promise<{ message: string }> {
  const response = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as { message: string }
}

export type LoginResult =
  | { ok: true; user: SessionUser }
  | { ok: false; code: string; message: string }

export async function loginLocal(email: string, password: string): Promise<LoginResult> {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (response.ok) {
    const user = (await response.json()) as SessionUser
    return { ok: true, user }
  }

  const body = (await response.json()) as { code?: string; message?: string }
  return {
    ok: false,
    code: body.code ?? 'login_failed',
    message: body.message ?? 'Sign-in failed.',
  }
}

export async function logout(): Promise<void> {
  const response = await apiFetch('/api/auth/logout', { method: 'POST' })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const response = await apiFetch('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as { message: string }
}

export async function confirmEmail(userId: string, token: string): Promise<{ message: string }> {
  const response = await apiFetch('/api/auth/confirm-email', {
    method: 'POST',
    body: JSON.stringify({ userId, token }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as { message: string }
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string; devResetLink?: string }> {
  const response = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as { message: string; devResetLink?: string }
}

export async function resetPassword(
  userId: string,
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ userId, token, newPassword }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as { message: string }
}

export async function updateDisplayName(displayName: string): Promise<SessionUser> {
  const response = await apiFetch('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as SessionUser
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
  return (await response.json()) as { message: string }
}

export async function deleteAccount(confirmation: string): Promise<void> {
  const response = await apiFetch('/api/auth/account/delete', {
    method: 'POST',
    body: JSON.stringify({ confirmation }),
  })
  if (!response.ok) {
    throw new Error(await readApiError(response))
  }
}
