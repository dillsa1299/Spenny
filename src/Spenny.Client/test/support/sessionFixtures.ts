import type { SessionState, SessionUser } from '@/api/authApi'

export const verifiedUser: SessionUser = {
  id: 'user-1',
  email: 'verified@example.com',
  displayName: 'Verified User',
  emailConfirmed: true,
  authProvider: 'local',
  isAdmin: false,
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

export const guestSession: SessionState = { authenticated: false }
