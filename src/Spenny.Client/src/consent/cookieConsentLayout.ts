/**
 * Shared layout offsets so the cookie bar and Cookie settings sit above the signed-in tab nav.
 */
export const AUTH_BOTTOM_NAV_OFFSET_PX = 72

/** Extra main padding so fixed cookie bar does not cover the last lines of content. */
export const COOKIE_BANNER_CLEARANCE_PX = 280

const BOTTOM_NAV_PATH_PREFIXES = [
  '/dashboard',
  '/spending',
  '/income',
  '/profile',
  '/admin',
] as const

export function pathHasBottomNav(pathname: string): boolean {
  return BOTTOM_NAV_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}
