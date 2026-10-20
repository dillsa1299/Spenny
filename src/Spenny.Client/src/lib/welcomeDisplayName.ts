// Greeting label for the signed-in shell: display name, then email local-part, then neutral fallback.
import type { SessionUser } from '@/api/authApi'

export function welcomeDisplayName(user: SessionUser | null | undefined): string {
  const trimmed = user?.displayName?.trim()
  if (trimmed) {
    return trimmed
  }
  const email = user?.email?.trim()
  if (email) {
    const local = email.split('@')[0]?.trim()
    if (local) {
      return local
    }
  }
  return 'there'
}
