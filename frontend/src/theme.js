import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#B71C1C',
      contrastText: '#fff',
    },
    secondary: {
      main: '#424242',
      light: '#616161',
      dark: '#212121',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    success: { main: '#2E7D32' },
    warning: { main: '#F57C00' },
    error: { main: '#D32F2F' },
    info: { main: '#1565C0' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(211,47,47,0.3)',
          '&:hover': { boxShadow: '0 4px 16px rgba(211,47,47,0.4)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } },
    },
  },
});

export default theme;
