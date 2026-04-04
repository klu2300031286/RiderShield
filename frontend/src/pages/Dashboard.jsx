import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import NotificationBar from '../components/NotificationBar';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, Button,
  LinearProgress
} from '@mui/material';
import { Policy, Payment, WaterDrop, TrendingUp, Shield, Receipt } from '@mui/icons-material';

const statusColors = { approved: 'success', pending: 'warning', rejected: 'error', fraud_detected: 'error' };

export default function Dashboard() {
  const { user } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policyRes, claimsRes, paymentsRes, weatherRes] = await Promise.allSettled([
        API.get('/policies/active'),
        API.get('/claims/'),
        API.get('/payments/my-payments'),
        API.get(`/risk/weather?location=${user?.location || 'Mumbai'}`)
      ]);
      if (policyRes.status === 'fulfilled') setPolicy(policyRes.value.data);
      if (claimsRes.status === 'fulfilled') setClaims(claimsRes.value.data);
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value.data);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
  const approvedClaims = claims.filter(c => c.status === 'approved').length;

  if (loading) return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map(i => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <NotificationBar notification={notif} onClose={() => setNotif(null)} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Welcome, {user?.name} 👋</Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.platform} delivery partner · {user?.location}
        </Typography>
      </Box>

      {/* Weather Alert */}
      {weather?.is_disruption && (
        <Card sx={{ mb: 3, border: '1px solid #ffcdd2', bgcolor: '#fff5f5' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <WaterDrop sx={{ color: '#D32F2F', fontSize: 32 }} />
            <Box>
              <Typography fontWeight={600} color="#D32F2F">⚠️ Active Disruption Alert</Typography>
              <Typography variant="body2" color="text.secondary">
                {weather.weather_condition} detected in {weather.location} · AQI: {weather.aqi} · Risk: {weather.risk_level.toUpperCase()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)', color: '#fff' }}>
            <CardContent>
              <Shield sx={{ fontSize: 32, opacity: 0.8, mb: 1 }} />
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Active Policy</Typography>
              <Typography variant="h5" fontWeight={700}>{policy ? `₹${policy.coverage_amount}` : 'None'}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Coverage amount</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Payment sx={{ fontSize: 32, color: '#F57C00', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Weekly Premium</Typography>
              <Typography variant="h5" fontWeight={700}>₹{policy?.premium_weekly || '0'}</Typography>
              <Typography variant="caption" color="text.secondary">Risk score: {policy?.risk_score || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 32, color: '#2E7D32', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Earnings Protected</Typography>
              <Typography variant="h5" fontWeight={700} color="#2E7D32">₹{totalEarnings.toFixed(0)}</Typography>
              <Typography variant="caption" color="text.secondary">{approvedClaims} claim{approvedClaims !== 1 ? 's' : ''} paid</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Receipt sx={{ fontSize: 32, color: '#1565C0', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Total Claims</Typography>
              <Typography variant="h5" fontWeight={700}>{claims.length}</Typography>
              <Typography variant="caption" color="text.secondary">{claims.filter(c => c.status === 'pending').length} pending</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Risk Score Bar */}
      {policy && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Your Risk Profile</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>Risk Score</Typography>
              <LinearProgress variant="determinate" value={policy.risk_score}
                sx={{ flex: 1, height: 10, borderRadius: 5,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: policy.risk_score > 60 ? '#D32F2F' : policy.risk_score > 35 ? '#F57C00' : '#2E7D32'
                  }
                }} />
              <Typography fontWeight={600}>{policy.risk_score}%</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Based on weather patterns, pollution levels, and historical disruption data in {user?.location}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Claims History */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Recent Claims</Typography>
          {claims.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No claims yet. Claims are auto-triggered when disruptions are detected in your area.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.slice(0, 10).map((claim) => (
                    <TableRow key={claim.id} hover>
                      <TableCell>{new Date(claim.created_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip label={claim.trigger_type.replace('_', ' ')} size="small"
                          sx={{ textTransform: 'capitalize', bgcolor: '#fff5f5', color: '#D32F2F' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{claim.claim_amount}</TableCell>
                      <TableCell>{claim.location}</TableCell>
                      <TableCell>
                        <Chip label={claim.status.replace('_', ' ')} size="small"
                          color={statusColors[claim.status] || 'default'} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
