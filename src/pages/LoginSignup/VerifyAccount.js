// src/pages/LoginSignup/VerifyAccount.js
import React, { useState } from 'react';
import { Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function VerifyAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState(''); // so we can auto-login

  const handleVerify = async () => {
    try {
      // verify
      await api.post('/auth/verify', { email, verificationCode: code });
      // auto-login
      const loginRes = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', loginRes.data.token);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" textAlign="center" mb={2}>Verify Account</Typography>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Verification Code"
            margin="normal"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password (to auto-login)"
            type="password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleVerify}>
            Verify
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default VerifyAccount;
