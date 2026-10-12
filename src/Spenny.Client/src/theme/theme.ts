// MUI theme for Spenny marketing and app shells.
import { createTheme } from '@mui/material/styles'

export const spennyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1b4332',
    },
    secondary: {
      main: '#d4a373',
    },
    background: {
      default: '#faf9f6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    h1: {
      fontWeight: 700,
    },
  },
})
