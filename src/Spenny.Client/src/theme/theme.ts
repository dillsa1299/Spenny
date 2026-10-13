// MUI theme: dark-first with green (positive) and red (spending) accents per site spec.
import { createTheme } from '@mui/material/styles'

export const spennyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#52b788',
    },
    secondary: {
      main: '#e63946',
    },
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    success: {
      main: '#52b788',
    },
    error: {
      main: '#e63946',
    },
  },
  typography: {
    fontFamily: 'system-ui, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          // Browsers force a light autofill background; inset shadow matches dark paper.
          '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
            WebkitBoxShadow: '0 0 0 100px #161b22 inset',
            WebkitTextFillColor: '#e6edf3',
            caretColor: '#e6edf3',
            transition: 'background-color 5000s ease-in-out 0s',
          },
        },
      },
    },
  },
})
