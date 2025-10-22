import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 5 },
  fontFamily:
    'Inter, "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'inherit',
    fontWeight: '600',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
  defaultRadius: 'md',
  breakpoints: {
    xs: '30em',
    sm: '36em',
    md: '48em',
    lg: '62em',
    xl: '75em',
  },
})
