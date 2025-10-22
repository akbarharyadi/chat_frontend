import { createTheme, rem } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'violet',
  primaryShade: { light: 6, dark: 5 },
  fontFamily:
    'Inter, "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'inherit',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(32), lineHeight: 1.2 },
      h2: { fontSize: rem(26), lineHeight: 1.25 },
      h3: { fontSize: rem(22), lineHeight: 1.3 },
      h4: { fontSize: rem(20), lineHeight: 1.35 },
    },
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      styles: {
        root: {
          borderRadius: '24px',
        },
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
