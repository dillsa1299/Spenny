import { render, screen } from '@testing-library/react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { ShellStickyHeader } from '@/layout/ShellStickyHeader'
import { describe, expect, it } from 'vitest'

describe('ShellStickyHeader', () => {
  it('renders children inside the sticky header stack', () => {
    render(
      <ShellStickyHeader>
        <AppBar position="static">
          <Toolbar>Nav</Toolbar>
        </AppBar>
      </ShellStickyHeader>,
    )
    expect(screen.getByText('Nav')).toBeInTheDocument()
  })
})
