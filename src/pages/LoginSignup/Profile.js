// src/pages/LoginSignup/Profile.jsx

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  keyframes
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';

// Import default avatars from your folder (adjust path as needed)
import avatar1 from '../../avatarimg/avatar1.png';
import avatar2 from '../../avatarimg/avatar2.png';
import avatar3 from '../../avatarimg/avatar3.png';

const defaultAvatars = [avatar1, avatar2, avatar3];

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

function Profile() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile'); // Ensure your backend endpoint returns user data
        const user = res.data.user;
        if (user) {
          setName(user.name || '');
          setProfilePic(user.profilePic || '');
          setSelectedAvatar(user.profilePic || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleAvatarSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setProfilePic(avatarUrl);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { name, profilePic });
      setMessage(res.data.message);
      // If the backend returns a new token, update context + localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    // 1) Vintage radial background + serif font
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)',
        fontFamily: `'Merriweather', serif`,
      }}
    >
      {/* 2) Faded card with subtle border, fade-in animation */}
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          px: 3,
          py: 2,
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          border: 'rgb(255, 255, 255)',
          backgroundColor: 'rgb(255, 255, 255)',
          animation: `${fadeIn} 0.6s ease-out`,
          m: 2
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
            Update Profile
          </Typography>

          <form onSubmit={handleUpdate}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Merriweather, serif',
                },
              }}
            />

            <Typography variant="subtitle1" mt={2} sx={{ fontFamily: 'Merriweather, serif' }}>
              Select a default avatar:
            </Typography>
            <Grid container spacing={2} mt={1}>
              {defaultAvatars.map((avatarUrl, index) => (
                <Grid item xs={4} key={index}>
                  <Box
                    sx={{
                      border:
                        selectedAvatar === avatarUrl ? '2px solid #1976d2' : '2px solid transparent',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: 0.5,
                    }}
                    onClick={() => handleAvatarSelect(avatarUrl)}
                  >
                    <Avatar src={avatarUrl} sx={{ width: 56, height: 56 }} />
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" mt={2} sx={{ fontFamily: 'Merriweather, serif' }}>
              Or enter a custom avatar URL:
            </Typography>
            <TextField
              fullWidth
              label="Custom Avatar URL"
              variant="outlined"
              margin="normal"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
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
              Update Profile
            </Button>
          </form>

          <Button
            onClick={() => navigate('/dashboard')}
            fullWidth
            sx={{
              mt: 2,
              fontFamily: 'Merriweather, serif',
              ':hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Profile;
