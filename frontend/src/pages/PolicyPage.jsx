import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import NotificationBar from '../components/NotificationBar';
import {
  Box, Card, CardContent, Typography, Button, TextField, MenuItem, Grid,
  Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Divider
} from '@mui/material';
import { Shield, Add, Cancel, TrendingUp } from '@mui/icons-material';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur', 'Lucknow', 'Ahmedabad'];

export default function PolicyPage() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ coverage_amount: 2000, location: user?.location || 'Mumbai' });
  const [notif, setNotif] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await API.get('/policies/');
      setPolicies(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchRisk = async (location) => {
    try {
      const res = await API.get(`/risk/assess?location=${location}`);
      setRiskData(res.data);
    } catch (e) { console.error(e); }
  };

  const handleOpenCreate = () => {
    setDialogOpen(true);
    fetchRisk(form.location);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await API.post('/policies/', form);
      setNotif({ message: 'Policy created successfully! ✅', severity: 'success' });
      setDialogOpen(false);
      fetchPolicies();
    } catch (err) {
      setNotif({ message: err.response?.data?.detail || 'Failed to create policy', severity: 'error' });
    }
    setCreating(false);
  };

  const handleCancel = async (policyId) => {
    try {
      await API.delete(`/policies/${policyId}`);
      setNotif({ message: 'Policy cancelled', severity: 'info' });
      fetchPolicies();
    } catch (err) {
      setNotif({ message: 'Failed to cancel policy', severity: 'error' });
    }
  };

  const activePolicy = policies.find(p => p.status === 'active');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <NotificationBar notification={notif} onClose={() => setNotif(null)} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>My Policy</Typography>
          <Typography variant="body2" color="text.secondary">Manage your income protection coverage</Typography>
        </Box>
        {!activePolicy && (
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate} size="large">
            Get Coverage
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : activePolicy ? (
        <Card sx={{ border: '2px solid #D32F2F', mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield sx={{ fontSize: 40, color: '#D32F2F' }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>Income Protection Plan</Typography>
                  <Chip label="ACTIVE" color="success" size="small" sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Button variant="outlined" color="error" size="small" startIcon={<Cancel />}
                onClick={() => handleCancel(activePolicy.id)}>Cancel Policy</Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Coverage Amount</Typography>
                <Typography variant="h6" fontWeight={700}>₹{activePolicy.coverage_amount}</Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Weekly Premium</Typography>
                <Typography variant="h6" fontWeight={700} color="#D32F2F">₹{activePolicy.premium_weekly}</Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                <Typography variant="h6" fontWeight={700}>{activePolicy.risk_score}%</Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" color="text.secondary">Valid Until</Typography>
                <Typography variant="h6" fontWeight={700}>
                  {activePolicy.end_date ? new Date(activePolicy.end_date).toLocaleDateString('en-IN') : 'Ongoing'}
                </Typography>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              Claims are automatically triggered when disruptions are detected in your area. No manual filing needed!
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Shield sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No Active Policy</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get coverage to protect yourself from income loss due to weather disruptions.
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>Get Coverage Now</Button>
          </CardContent>
        </Card>
      )}

      {/* Past Policies */}
      {policies.filter(p => p.status !== 'active').length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>Policy History</Typography>
            {policies.filter(p => p.status !== 'active').map((p) => (
              <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <Box>
                  <Typography variant="body2">₹{p.coverage_amount} coverage · ₹{p.premium_weekly}/week</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(p.start_date).toLocaleDateString('en-IN')} — {p.end_date ? new Date(p.end_date).toLocaleDateString('en-IN') : 'N/A'}
                  </Typography>
                </Box>
                <Chip label={p.status} size="small" color={p.status === 'expired' ? 'default' : 'warning'}
                  sx={{ textTransform: 'capitalize' }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create Policy Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Get Income Protection</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField select fullWidth label="Your City" value={form.location}
              onChange={(e) => { setForm({ ...form, location: e.target.value }); fetchRisk(e.target.value); }}
              sx={{ mb: 2.5 }}>
              {CITIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Coverage Amount (₹)" value={form.coverage_amount}
              onChange={(e) => setForm({ ...form, coverage_amount: Number(e.target.value) })} sx={{ mb: 3 }}>
              {[1000, 1500, 2000, 2500, 3000, 4000, 5000].map(v => (
                <MenuItem key={v} value={v}>₹{v.toLocaleString()}</MenuItem>
              ))}
            </TextField>

            {riskData && (
              <Card sx={{ bgcolor: '#fafafa', border: '1px solid #eee' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    <TrendingUp sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    AI Risk Assessment — {riskData.location}
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Weather</Typography>
                      <Typography variant="body2" fontWeight={500}>{riskData.weather_condition}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">AQI</Typography>
                      <Typography variant="body2" fontWeight={500}>{riskData.aqi}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                      <Typography variant="body2" fontWeight={700} color="#D32F2F">{riskData.risk_score}%</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Suggested Premium</Typography>
                      <Typography variant="body2" fontWeight={700} color="#D32F2F">₹{riskData.suggested_premium}/week</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={creating}>
            {creating ? <CircularProgress size={22} color="inherit" /> : 'Purchase Policy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
