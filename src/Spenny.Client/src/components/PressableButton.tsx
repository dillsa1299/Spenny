// MUI button with pointer-down scale feedback (apple-design: respond on press, not release).
import Button, { type ButtonProps } from '@mui/material/Button'

export function PressableButton<C extends React.ElementType = 'button'>(
  props: ButtonProps<C, { component?: C }>,
) {
  const { sx, ...rest } = props
  return (
    <Button
      {...rest}
      sx={{
        transition: 'transform 100ms ease-out',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        '&:active': {
          transform: 'scale(0.97)',
        },
        ...sx,
      }}
    />
  )
}
