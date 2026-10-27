/**
 * Persists the user's cookie consent choice for the SPA (not an auth cookie).
 * Stored in localStorage until cleared or the policy version id changes; bump
 * COOKIE_CONSENT_VERSION when policy text materially changes so the banner re-prompts.
 */
export const COOKIE_CONSENT_STORAGE_KEY = 'spenny.cookieConsent.v1'

/** Bump when Cookie / Privacy disclosure text materially changes. */
export const COOKIE_CONSENT_VERSION = '1'

export type CookieConsentDecision = 'accepted' | 'rejected'

export type CookieConsentRecord = {
  version: string
  decision: CookieConsentDecision
  timestamp: string
}

function isDecision(value: unknown): value is CookieConsentDecision {
  return value === 'accepted' || value === 'rejected'
}

function parseRecord(raw: string): CookieConsentRecord | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') {
      return null
    }
    const record = parsed as Record<string, unknown>
    if (
      typeof record.version !== 'string' ||
      !isDecision(record.decision) ||
      typeof record.timestamp !== 'string'
    ) {
      return null
    }
    return {
      version: record.version,
      decision: record.decision,
      timestamp: record.timestamp,
    }
  } catch {
    return null
  }
}

/** Returns the stored consent when present and matching the current policy version. */
export function readCookieConsent(): CookieConsentRecord | null {
  if (typeof localStorage === 'undefined') {
    return null
  }
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (raw === null) {
      return null
    }
    const record = parseRecord(raw)
    if (record === null || record.version !== COOKIE_CONSENT_VERSION) {
      return null
    }
    return record
  } catch {
    return null
  }
}

export function writeCookieConsent(decision: CookieConsentDecision): CookieConsentRecord {
  const record: CookieConsentRecord = {
    version: COOKIE_CONSENT_VERSION,
    decision,
    timestamp: new Date().toISOString(),
  }
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Quota / private mode: in-memory callers still receive the record for this session.
  }
  return record
}

export function clearCookieConsent(): void {
  try {
    localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY)
  } catch {
    // Ignore storage failures when clearing.
  }
}

/** Gate for future non-essential cookies/scripts; false until the user accepts. */
export function canLoadNonEssential(): boolean {
  return readCookieConsent()?.decision === 'accepted'
}
