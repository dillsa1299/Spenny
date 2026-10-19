// Application-wide body background; GlobalStyles in AppProviders.
// CSS paints the first background-image layer on top — keep radials/grid above a flat base color only.
import GlobalStyles from '@mui/material/GlobalStyles'

const bodyBackgroundImage = [
  'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 56px)',
  'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 56px)',
  'radial-gradient(ellipse 100% 75% at 50% -20%, rgba(82, 183, 136, 0.5), transparent 58%)',
  'radial-gradient(ellipse 60% 50% at 100% 95%, rgba(230, 57, 70, 0.24), transparent 55%)',
  'radial-gradient(ellipse 50% 45% at 0% 90%, rgba(82, 183, 136, 0.22), transparent 52%)',
].join(', ')

export const appBackgroundStyles = {
  html: {
    minHeight: '100%',
  },
  body: {
    margin: 0,
    minHeight: '100vh',
    backgroundColor: '#0d1117',
    backgroundImage: bodyBackgroundImage,
    backgroundAttachment: 'fixed',
    '@media (prefers-reduced-transparency: reduce)': {
      backgroundImage: 'linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)',
      backgroundAttachment: 'scroll',
    },
  },
  '#root': {
    backgroundColor: 'transparent',
  },
}

export function AppBackground() {
  return <GlobalStyles styles={appBackgroundStyles} />
}
