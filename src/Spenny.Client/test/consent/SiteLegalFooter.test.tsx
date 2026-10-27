/**
 * In-flow legal footer: Privacy and Cookies only.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SiteLegalFooter } from '@/consent/SiteLegalFooter'
import { describe, expect, it, vi } from 'vitest'

describe('SiteLegalFooter', () => {
  it('renders centred Privacy, Cookies, and Contact links with separators', () => {
    render(
      <MemoryRouter>
        <SiteLegalFooter />
      </MemoryRouter>,
    )

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveStyle({ justifyContent: 'center' })
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Cookies' })).toHaveAttribute('href', '/cookies')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('navigation', { name: 'Legal' })).toHaveTextContent('|')
    expect(screen.queryByRole('button', { name: 'Cookie settings' })).not.toBeInTheDocument()
  })

  it('scrolls to the top of the page when a legal link is clicked', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <MemoryRouter>
        <SiteLegalFooter />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'Privacy' }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })

    await user.click(screen.getByRole('link', { name: 'Cookies' }))
    expect(scrollTo).toHaveBeenCalledTimes(2)

    scrollTo.mockRestore()
  })
})
