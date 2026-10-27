import { APP_DOCUMENT_TITLE, documentTitleForPath } from '@/lib/routeDocumentTitle'
import { describe, expect, it } from 'vitest'

describe('documentTitleForPath', () => {
  it('uses the product name alone on the marketing home route', () => {
    expect(documentTitleForPath('/')).toBe(APP_DOCUMENT_TITLE)
  })

  it('prefixes known routes with the page label', () => {
    expect(documentTitleForPath('/dashboard')).toBe(`Dashboard · ${APP_DOCUMENT_TITLE}`)
    expect(documentTitleForPath('/sign-in')).toBe(`Sign in · ${APP_DOCUMENT_TITLE}`)
    expect(documentTitleForPath('/cookies')).toBe(`Cookie policy · ${APP_DOCUMENT_TITLE}`)
    expect(documentTitleForPath('/privacy')).toBe(`Privacy policy · ${APP_DOCUMENT_TITLE}`)
    expect(documentTitleForPath('/contact')).toBe(`Contact · ${APP_DOCUMENT_TITLE}`)
  })

  it('falls back to the product name for unknown paths', () => {
    expect(documentTitleForPath('/not-a-route')).toBe(APP_DOCUMENT_TITLE)
  })
})
