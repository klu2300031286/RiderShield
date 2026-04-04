import { useState, useEffect } from 'react';
import API from '../api';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Tabs, Tab, Paper
} from '@mui/material';
import {
  People, Policy, Receipt, Warning, Payment, TrendingUp, LocationOn
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const statusColors = { approved: 'success', pending: 'warning', rejected: 'error', fraud_detected: 'error' };
const PIE_COLORS = ['#D32F2F', '#F57C00', '#2E7D32', '#1565C0'];
const RISK_COLORS = { low: '#2E7D32', medium: '#F57C00', high: '#EF5350', critical: '#B71C1C' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [riskData, setRiskData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, claimsRes, fraudRes, riskRes, usersRes] = await Promise.allSettled([
        API.get('/admin/stats'),
        API.get('/admin/claims'),
        API.get('/admin/fraud-alerts'),
        API.get('/admin/risk-analytics'),
        API.get('/admin/users')
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (claimsRes.status === 'fulfilled') setClaims(claimsRes.value.data);
      if (fraudRes.status === 'fulfilled') setFraudAlerts(fraudRes.value.data);
      if (riskRes.status === 'fulfilled') setRiskData(riskRes.value.data);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  const claimsByType = claims.reduce((acc, c) => {
    const type = c.trigger_type.replace('_', ' ');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(claimsByType).map(([name, count]) => ({ name, count }));

  const pieData = [
    { name: 'Approved', value: stats?.approved_claims || 0 },
    { name: 'Pending', value: stats?.pending_claims || 0 },
    { name: 'Fraud', value: stats?.fraud_alerts || 0 },
  ].filter(d => d.value > 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1300, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Platform overview & analytics</Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <People />, label: 'Total Users', value: stats?.total_users, color: '#1565C0', sub: `${stats?.total_workers} workers` },
          { icon: <Policy />, label: 'Active Policies', value: stats?.active_policies, color: '#2E7D32', sub: `${stats?.total_policies} total` },
          { icon: <Receipt />, label: 'Total Claims', value: stats?.total_claims, color: '#F57C00', sub: `${stats?.approved_claims} approved` },
          { icon: <Warning />, label: 'Fraud Alerts', value: stats?.fraud_alerts, color: '#D32F2F', sub: 'flagged claims' },
          { icon: <Payment />, label: 'Total Payouts', value: `₹${stats?.total_payouts?.toFixed(0) || 0}`, color: '#2E7D32', sub: 'processed' },
        ].map((s, i) => (
          <Grid size={{ xs: 6, md: 2.4 }} key={i}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ color: s.color, mb: 1 }}>{s.icon}</Box>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Claims by Trigger Type</Typography>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#D32F2F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Claim Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={270}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} label dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #eee', px: 2 }}
          textColor="primary" indicatorColor="primary">
          <Tab label="All Claims" />
          <Tab label={`Fraud Alerts (${fraudAlerts.length})`} />
          <Tab label="Risk Analytics" />
          <Tab label="Users" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((c) => (
                    <TableRow key={c.id} hover sx={{ bgcolor: c.fraud_flag ? '#fff5f5' : 'transparent' }}>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.user_id}</TableCell>
                      <TableCell>
                        <Chip label={c.trigger_type.replace('_', ' ')} size="small" sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{c.claim_amount}</TableCell>
                      <TableCell>{c.location}</TableCell>
                      <TableCell>
                        <Chip label={c.status.replace('_', ' ')} size="small"
                          color={statusColors[c.status] || 'default'} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            fraudAlerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                No fraud alerts detected. The system is clean! ✅
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trigger</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fraudAlerts.map((f) => (
                      <TableRow key={f.id} sx={{ bgcolor: '#fff5f5' }}>
                        <TableCell>{f.id}</TableCell>
                        <TableCell>{f.user_id}</TableCell>
                        <TableCell>{f.trigger_type.replace('_', ' ')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>₹{f.claim_amount}</TableCell>
                        <TableCell><Typography variant="body2" color="error">{f.fraud_reason}</Typography></TableCell>
                        <TableCell>{new Date(f.created_at).toLocaleDateString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}

          {tab === 2 && (
            <Grid container spacing={2}>
              {riskData.map((r) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
                  <Card sx={{ border: `1px solid ${RISK_COLORS[r.risk_level] || '#eee'}22`, bgcolor: r.is_disruption ? '#fff5f5' : '#fff' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ color: RISK_COLORS[r.risk_level], fontSize: 20 }} />
                          <Typography fontWeight={600}>{r.location}</Typography>
                        </Box>
                        <Chip label={r.risk_level} size="small"
                          sx={{ bgcolor: RISK_COLORS[r.risk_level], color: '#fff', textTransform: 'uppercase', fontSize: '0.7rem' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{r.weather_condition}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.temperature}°C · {r.humidity}% humidity · AQI: {r.aqi}
                      </Typography>
                      {r.is_disruption && (
                        <Chip label="ACTIVE DISRUPTION" size="small" color="error" sx={{ mt: 1, display: 'block', width: 'fit-content' }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {tab === 3 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Chip label={u.role} size="small" color={u.role === 'admin' ? 'error' : 'default'} /></TableCell>
                      <TableCell>{u.location}</TableCell>
                      <TableCell>{u.platform}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
