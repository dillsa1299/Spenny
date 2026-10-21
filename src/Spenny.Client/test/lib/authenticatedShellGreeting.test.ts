import {
  authenticatedShellGreeting,
  timeOfDayGreetingForHour,
} from '@/lib/authenticatedShellGreeting'
import { verifiedUser } from '@/test/sessionFixtures'
import { describe, expect, it } from 'vitest'

describe('timeOfDayGreetingForHour', () => {
  it('maps local hours to morning, afternoon, and evening buckets', () => {
    expect(timeOfDayGreetingForHour(4)).toBe('Good evening')
    expect(timeOfDayGreetingForHour(5)).toBe('Good morning')
    expect(timeOfDayGreetingForHour(11)).toBe('Good morning')
    expect(timeOfDayGreetingForHour(12)).toBe('Good afternoon')
    expect(timeOfDayGreetingForHour(16)).toBe('Good afternoon')
    expect(timeOfDayGreetingForHour(17)).toBe('Good evening')
    expect(timeOfDayGreetingForHour(23)).toBe('Good evening')
  })
})

describe('authenticatedShellGreeting', () => {
  it('combines time-of-day phrase with the welcome display name', () => {
    const atTenAm = new Date('2026-10-21T10:00:00')
    expect(authenticatedShellGreeting(verifiedUser, atTenAm)).toBe('Good morning, Verified User')
  })

  it('uses neutral name fallback when user is missing', () => {
    const atTenAm = new Date('2026-10-21T10:00:00')
    expect(authenticatedShellGreeting(null, atTenAm)).toBe('Good morning, there')
  })
})
