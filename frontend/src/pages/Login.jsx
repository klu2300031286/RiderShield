import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, Shield } from '@mui/icons-material';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff5f5 100%)', p: 2
    }}>
      <Card sx={{ maxWidth: 440, width: '100%', p: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Shield sx={{ fontSize: 48, color: '#D32F2F', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="#D32F2F">GigShield</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Protecting gig workers from income loss
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
              sx={{ mb: 2.5 }} />
            <TextField fullWidth label="Password" type={showPw ? 'text' : 'password'} required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }} />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ height: 48, fontSize: '1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#D32F2F', fontWeight: 600, textDecoration: 'none' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#fafafa', borderRadius: 2, fontSize: '0.75rem' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Demo Credentials:</Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Admin: admin@gigshield.in / admin123
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Worker: raj@example.com / worker123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
