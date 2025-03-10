// src/pages/LoginSignup/ResetPassword.js
import React, { useState } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box } from '@mui/material';
import api from '../../services/api';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword
      });
      setMessage(res.data.message);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card sx={{ maxWidth: 400, width: '100%', p: 2 }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>
            Reset Password
          </Typography>
          <form onSubmit={handleReset}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Reset Code"
              variant="outlined"
              margin="normal"
              value={resetCode}
              onChange={e => setResetCode(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            {message && (
              <Typography variant="body2" mt={1}>
                {message}
              </Typography>
            )}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ResetPassword;
