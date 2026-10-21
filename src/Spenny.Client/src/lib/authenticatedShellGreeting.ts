// Time-of-day line for the signed-in app bar: local hour bucket plus welcomeDisplayName.
import type { SessionUser } from '@/api/authApi'
import { welcomeDisplayName } from '@/lib/welcomeDisplayName'

export function timeOfDayGreetingForHour(hour: number): string {
  if (hour >= 5 && hour <= 11) {
    return 'Good morning'
  }
  if (hour >= 12 && hour <= 16) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

export function authenticatedShellGreeting(
  user: SessionUser | null | undefined,
  referenceDate: Date = new Date(),
): string {
  const phrase = timeOfDayGreetingForHour(referenceDate.getHours())
  return `${phrase}, ${welcomeDisplayName(user)}`
}
