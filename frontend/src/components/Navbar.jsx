import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem,
  ListItemIcon, ListItemText, Box, Avatar, Menu, MenuItem, Divider,
  useMediaQuery, useTheme
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Policy, Receipt, AdminPanelSettings,
  Logout, Person, Shield
} from '@mui/icons-material';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const workerNav = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'My Policy', path: '/policy', icon: <Policy /> },
    { label: 'Claims', path: '/claims', icon: <Receipt /> },
  ];

  const adminNav = [
    { label: 'Admin Panel', path: '/admin', icon: <AdminPanelSettings /> },
  ];

  const navItems = user?.role === 'admin' ? [...workerNav, ...adminNav] : workerNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: '#fff', color: '#333', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Shield sx={{ color: '#D32F2F', mr: 1, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#D32F2F', cursor: 'pointer', flexGrow: isMobile ? 1 : 0, mr: 4 }}
            onClick={() => navigate('/dashboard')}>
            GigShield
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navItems.map((item) => (
                <Button key={item.path} startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? '#D32F2F' : '#666',
                    fontWeight: location.pathname === item.path ? 700 : 400,
                    borderBottom: location.pathname === item.path ? '2px solid #D32F2F' : 'none',
                    borderRadius: 0, px: 2
                  }}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: '#D32F2F', fontSize: 14 }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1 } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: '#D32F2F' }}>
                <ListItemIcon><Logout fontSize="small" sx={{ color: '#D32F2F' }} /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
            <Shield sx={{ color: '#D32F2F', mr: 1 }} />
            <Typography variant="h6" fontWeight={700} color="#D32F2F">GigShield</Typography>
          </Box>
          <Divider />
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} button onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                sx={{ bgcolor: location.pathname === item.path ? '#FFF0F0' : 'transparent',
                  color: location.pathname === item.path ? '#D32F2F' : '#333' }}>
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
