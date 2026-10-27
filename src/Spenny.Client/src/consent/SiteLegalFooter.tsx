/**
 * In-flow legal footer: Privacy, Cookies, and Contact links centred at the bottom of page content.
 */
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

const linkSx = {
  color: 'text.secondary',
  textTransform: 'none' as const,
  fontSize: '0.75rem',
  minWidth: 0,
  px: 1,
  py: 0.5,
  opacity: 0.9,
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}

function scrollToPageTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

function FooterSeparator() {
  return (
    <Typography
      component="span"
      aria-hidden
      variant="caption"
      color="text.secondary"
      sx={{ opacity: 0.5, userSelect: 'none' }}
    >
      |
    </Typography>
  )
}

export function SiteLegalFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 2,
        px: 1,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack
        component="nav"
        aria-label="Legal"
        direction="row"
        spacing={0.5}
        useFlexGap
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Button
          component={RouterLink}
          to="/privacy"
          variant="text"
          size="small"
          sx={linkSx}
          onClick={scrollToPageTop}
        >
          Privacy
        </Button>
        <FooterSeparator />
        <Button
          component={RouterLink}
          to="/cookies"
          variant="text"
          size="small"
          sx={linkSx}
          onClick={scrollToPageTop}
        >
          Cookies
        </Button>
        <FooterSeparator />
        <Button
          component={RouterLink}
          to="/contact"
          variant="text"
          size="small"
          sx={linkSx}
          onClick={scrollToPageTop}
        >
          Contact
        </Button>
      </Stack>
    </Box>
  )
}
