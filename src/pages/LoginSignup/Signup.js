// src/pages/LoginSignup/Signup.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import VerificationModal from './VerificationModal';

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

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: ''
  });
  const [message, setMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/auth/signup', formData);
      setMessage(res.data.message);
      // Open verification modal after successful signup
      setOpenModal(true);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Signup failed');
    }
  };

  // When modal verifies successfully, redirect to dashboard
  const handleVerificationSuccess = () => {
    setOpenModal(false);
    navigate('/dashboard');
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
      {/* 2) Faded card with gentle border and a fade-in animation */}
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
            Admin Signup
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              variant="outlined"
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />
            <TextField
              fullWidth
              label="Organization Name"
              name="organizationName"
              variant="outlined"
              margin="normal"
              value={formData.organizationName}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />
            {message && (
              <Typography color="error" variant="body2" mt={1}>
                {message}
              </Typography>
            )}

            {/* 3) Vintage accent button */}
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
              Sign Up
            </Button>
          </form>

          <Box textAlign="center" mt={2}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#5e4b33',
                  fontFamily: 'Merriweather, serif',
                  ':hover': { textDecoration: 'underline' },
                }}
              >
                Back to Login
              </Typography>
            </Link>
          </Box>
        </CardContent>
      </Card>

      <VerificationModal
        open={openModal}
        email={formData.email}
        onClose={() => setOpenModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </Box>
  );
}

export default Signup;
