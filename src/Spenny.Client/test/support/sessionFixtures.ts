import type { SessionState, SessionUser } from '@/api/authApi'

export const verifiedUser: SessionUser = {
  id: 'user-1',
  email: 'verified@example.com',
  displayName: 'Verified User',
  emailConfirmed: true,
  authProvider: 'Local',
  isAdmin: false,
}

export const googleUser: SessionUser = {
  ...verifiedUser,
  id: 'user-google',
  email: 'google@example.com',
  displayName: 'Google User',
  authProvider: 'Google',
}

export const unverifiedUser: SessionUser = {
  ...verifiedUser,
  id: 'user-2',
  email: 'unverified@example.com',
  displayName: 'Unverified User',
  emailConfirmed: false,
}

export const verifiedSession: SessionState = {
  authenticated: true,
  user: verifiedUser,
  domainAccess: true,
}

export const unverifiedSession: SessionState = {
  authenticated: true,
  user: unverifiedUser,
  domainAccess: false,
}

export const googleSession: SessionState = {
  authenticated: true,
  user: googleUser,
  domainAccess: true,
}

export const adminUser: SessionUser = {
  ...verifiedUser,
  id: 'user-admin',
  email: 'admin@example.com',
  displayName: 'Admin User',
  isAdmin: true,
}

export const adminSession: SessionState = {
  authenticated: true,
  user: adminUser,
  domainAccess: true,
}

export const guestSession: SessionState = { authenticated: false }
