import Typography from 'typography'
import typographyTheme from 'typography-theme-noriega'
import { theme } from 'util/style'

typographyTheme.overrideThemeStyles = () => ({
  html: {
    overflowY: 'hidden',
    height: '100%',
  },
  body: {
    height: '100%',
    width: '100%',
  },
  'a, a:visited, a:active': {
    textDecoration: 'none',
    color: theme.colors.primary[600],
  },
  // Set height on containing notes to 100% so that full screen map layouts work
  '#___gatsby': {
    height: '100%',
  },
  '#___gatsby > *': {
    height: '100%',
  },
  button: {
    outline: 'none',
    cursor: 'pointer',
  },
})

const typography = new Typography(typographyTheme)

export default typography
