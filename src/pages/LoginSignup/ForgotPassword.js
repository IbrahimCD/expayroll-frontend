// src/pages/LoginSignup/ForgotPassword.js
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  keyframes
} from '@mui/material';
import api from '../../services/api';
import ResetCodeModal from './ResetCodeModal';

// A gentle fade-in animation for the card
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [openResetModal, setOpenResetModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setOpenResetModal(true);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Error requesting reset code');
    }
  };

  const handleResetModalClose = () => {
    setOpenResetModal(false);
    // Optionally clear the email or redirect to login here
  };

  return (
    // 1) Vintage radial background with a serif font
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #f8f0e1 0%, #e7dac8 100%)',
        fontFamily: `'Merriweather', serif`,
      }}
    >
      {/* 2) Faded card with gentle border and fade-in */}
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          px: 3,
          py: 2,
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          border: '1px solid #c1b099',
          backgroundColor: 'rgba(255, 250, 240, 0.9)',
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            sx={{
              color: '#5e4b33',
              mb: 2,
              letterSpacing: '0.5px',
            }}
          >
            Forgot Password
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />
            {message && (
              <Typography variant="body2" color="error" mt={1}>
                {message}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                bgcolor: '#c1a266',
                color: '#fff',
                fontWeight: 'bold',
                boxShadow: 'none',
                fontFamily: 'Merriweather, serif',
                ':hover': {
                  bgcolor: '#ae8e55',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              Send Reset Code
            </Button>
          </form>
        </CardContent>
      </Card>

      <ResetCodeModal
        open={openResetModal}
        email={email}
        onClose={handleResetModalClose}
      />
    </Box>
  );
}

export default ForgotPassword;
