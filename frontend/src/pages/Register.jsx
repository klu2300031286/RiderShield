import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton, MenuItem
} from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff, Phone, LocationOn, Shield } from '@mui/icons-material';

const PLATFORMS = ['Zomato', 'Swiggy', 'Amazon', 'Dunzo', 'BigBasket', 'Blinkit', 'Other'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', location: 'Mumbai', platform: 'Zomato' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const upd = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 50%, #fff5f5 100%)', p: 2
    }}>
      <Card sx={{ maxWidth: 480, width: '100%', p: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Shield sx={{ fontSize: 44, color: '#D32F2F', mb: 1 }} />
            <Typography variant="h5" fontWeight={700} color="#D32F2F">Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join GigShield for income protection</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" required value={form.name} onChange={upd('name')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment> }}
              sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" required value={form.email} onChange={upd('email')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment> }}
              sx={{ mb: 2 }} />
            <TextField fullWidth label="Phone Number" value={form.phone} onChange={upd('phone')}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone color="action" /></InputAdornment> }}
              sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type={showPw ? 'text' : 'password'} required
              value={form.password} onChange={upd('password')}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                endAdornment: <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw(!showPw)}>{showPw ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              }}
              sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
              <TextField select fullWidth label="City" value={form.location} onChange={upd('location')}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn color="action" /></InputAdornment> }}>
                {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Platform" value={form.platform} onChange={upd('platform')}>
                {PLATFORMS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Box>
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ height: 48 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#D32F2F', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
