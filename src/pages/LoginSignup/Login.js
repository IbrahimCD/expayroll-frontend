// src/pages/LoginSignup/Login.js

import React, { useState, useContext } from 'react';
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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

// A subtle fade-in to give the card a gentler entry
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

function Login() {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        // 1) Full-screen warm-toned background
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // A vintage-y radial gradient with muted browns/beiges
        background: 'radial-gradient(circle, #f8f0e1 0%, #e7dac8 100%)',
        fontFamily: `'Merriweather', serif`, // a classy, serif typeface
      }}
    >
      {/* 2) Centered card with an antique ledger style */}
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          px: 3,
          py: 2,
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          border: '1px solid #c1b099', // subtle border
          backgroundColor: 'rgba(255, 250, 240, 0.9)',
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        <CardContent>
          {/* 3) Icon in a warm gold color */}
          <Box display="flex" justifyContent="center" mb={1}>
            <AttachMoneyIcon
              sx={{
                color: '#c1a266',
                fontSize: 50,
              }}
            />
          </Box>

          {/* 4) Classy “Payroll Login” heading */}
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
            Payroll Login
          </Typography>

          {/* 5) The login form itself */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />
            <TextField
              fullWidth
              required
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />

            {/* 6) Error message */}
            {errorMsg && (
              <Typography color="error" variant="body2" mt={1}>
                {errorMsg}
              </Typography>
            )}

            {/* 7) Vintage accent button */}
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
              Log In
            </Button>
          </form>

          {/* 8) Links to sign up & forgot password */}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#5e4b33',
                  fontFamily: 'Merriweather, serif',
                  ':hover': { textDecoration: 'underline' },
                }}
              >
                Create Account
              </Typography>
            </Link>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#5e4b33',
                  fontFamily: 'Merriweather, serif',
                  ':hover': { textDecoration: 'underline' },
                }}
              >
                Forgot Password?
              </Typography>
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
