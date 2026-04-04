import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function NotificationBar({ notification, onClose }) {
  if (!notification) return null;

  return (
    <Snackbar open={!!notification} autoHideDuration={5000} onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Alert onClose={onClose} severity={notification.severity || 'info'}
        variant="filled" sx={{ borderRadius: 2, minWidth: 300 }}>
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
