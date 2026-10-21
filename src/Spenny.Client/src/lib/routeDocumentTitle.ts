// Maps app paths to browser tab titles (marketing home uses the product name only).
export const APP_DOCUMENT_TITLE = 'Spenny'

const PAGE_TITLES: Record<string, string> = {
  '/sign-in': 'Sign in',
  '/sign-up': 'Join Spenny',
  '/check-email': 'Check your email',
  '/verify-email': 'Email verification',
  '/forgot-password': 'Reset password',
  '/reset-password': 'Choose a new password',
  '/dashboard': 'Dashboard',
  '/spending': 'Spending',
  '/income': 'Income',
  '/profile': 'Profile',
  '/admin': 'Admin',
}

export function documentTitleForPath(pathname: string): string {
  if (pathname === '/') {
    return APP_DOCUMENT_TITLE
  }
  const page = PAGE_TITLES[pathname]
  return page ? `${page} · ${APP_DOCUMENT_TITLE}` : APP_DOCUMENT_TITLE
}
