import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import NotificationBar from '../components/NotificationBar';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import { WaterDrop, Whatshot, Air, Gavel, Flood, Thunderstorm, Warning } from '@mui/icons-material';

const triggerIcons = {
  heavy_rain: <WaterDrop />, extreme_heat: <Whatshot />, pollution: <Air />,
  curfew: <Gavel />, flood: <Flood />, storm: <Thunderstorm />
};
const statusColors = { approved: 'success', pending: 'warning', rejected: 'error', fraud_detected: 'error' };

const TRIGGER_TYPES = [
  { value: 'heavy_rain', label: '🌧️ Heavy Rain' },
  { value: 'extreme_heat', label: '🔥 Extreme Heat' },
  { value: 'pollution', label: '💨 Pollution' },
  { value: 'curfew', label: '🚫 Curfew' },
  { value: 'flood', label: '🌊 Flood' },
  { value: 'storm', label: '⛈️ Storm' },
];

export default function ClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [form, setForm] = useState({ location: user?.location || 'Mumbai', trigger_type: 'heavy_rain' });
  const [notif, setNotif] = useState(null);
  const [lastClaim, setLastClaim] = useState(null);

  useEffect(() => { fetchClaims(); }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await API.get('/claims/');
      setClaims(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      // First simulate the disruption
      await API.post('/risk/simulate-disruption', form);
      // Then trigger the claim
      const res = await API.post('/claims/trigger', form);
      setLastClaim(res.data);
      if (res.data.fraud_flag) {
        setNotif({ message: `⚠️ Fraud detected: ${res.data.fraud_reason}`, severity: 'error' });
      } else {
        setNotif({ message: `✅ Claim approved! ₹${res.data.claim_amount} payout initiated.`, severity: 'success' });
      }
      setDialogOpen(false);
      fetchClaims();
    } catch (err) {
      setNotif({ message: err.response?.data?.detail || 'Failed to trigger claim', severity: 'error' });
    }
    setTriggering(false);
  };

  const approvedTotal = claims.filter(c => c.status === 'approved').reduce((s, c) => s + c.claim_amount, 0);
  const fraudCount = claims.filter(c => c.fraud_flag).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <NotificationBar notification={notif} onClose={() => setNotif(null)} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Claims</Typography>
          <Typography variant="body2" color="text.secondary">Auto-triggered claims & payout history</Typography>
        </Box>
        <Button variant="contained" startIcon={<Warning />} onClick={() => setDialogOpen(true)} size="large">
          Simulate Disruption
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Claims</Typography>
              <Typography variant="h4" fontWeight={700}>{claims.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Payouts</Typography>
              <Typography variant="h4" fontWeight={700} color="#2E7D32">₹{approvedTotal.toFixed(0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Fraud Alerts</Typography>
              <Typography variant="h4" fontWeight={700} color="#D32F2F">{fraudCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Last Claim Result */}
      {lastClaim && (
        <Alert severity={lastClaim.fraud_flag ? 'error' : 'success'} sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setLastClaim(null)}>
          <Typography fontWeight={600}>
            {lastClaim.fraud_flag ? 'Fraud Detected' : 'Claim Approved'} — ₹{lastClaim.claim_amount}
          </Typography>
          <Typography variant="body2">
            {lastClaim.trigger_type.replace('_', ' ')} in {lastClaim.location}
            {lastClaim.fraud_reason && ` · Reason: ${lastClaim.fraud_reason}`}
          </Typography>
        </Alert>
      )}

      {/* Claims Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>Claims History</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : claims.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No claims yet. Use "Simulate Disruption" to test the auto-claim system.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Fraud</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((c) => (
                    <TableRow key={c.id} hover sx={{ bgcolor: c.fraud_flag ? '#fff5f5' : 'transparent' }}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell>
                        <Chip icon={triggerIcons[c.trigger_type]} label={c.trigger_type.replace('_', ' ')}
                          size="small" sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{c.claim_amount}</TableCell>
                      <TableCell>{c.location}</TableCell>
                      <TableCell>
                        <Chip label={c.status.replace('_', ' ')} size="small"
                          color={statusColors[c.status] || 'default'} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>
                        {c.fraud_flag ? (
                          <Chip label="⚠️ Flagged" size="small" color="error" variant="outlined" />
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Simulate Disruption Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>🌪️ Simulate Disruption</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Simulate a real-world disruption to test the auto-claim system. This will trigger a claim on your active policy.
          </Typography>
          <TextField select fullWidth label="Disruption Type" value={form.trigger_type}
            onChange={(e) => setForm({ ...form, trigger_type: e.target.value })} sx={{ mb: 2 }}>
            {TRIGGER_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Location" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTrigger} disabled={triggering}>
            {triggering ? <CircularProgress size={22} color="inherit" /> : 'Trigger Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
