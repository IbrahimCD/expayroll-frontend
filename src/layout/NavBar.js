// src/layout/NavBar.js
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../services/api';

function NavBar() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.profilePic) setProfilePic(decoded.profilePic);
        if (decoded?.name) setDisplayName(decoded.name);
      } catch (_) {}
      fetchUserProfile();
    } else {
      setProfilePic(null);
      setDisplayName('');
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfilePic(res.data.user.profilePic || null);
      setDisplayName(res.data.user.name || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfilePic(null);
    }
  };
  const avatarFallbackText = useMemo(() => {
    if (!displayName) return '';
    const parts = String(displayName).trim().split(/\s+/);
    const letters = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).filter(Boolean);
    return letters.join('');
  }, [displayName]);

  const cacheBustedSrc = useMemo(() => {
    if (!profilePic) return null;
    try {
      const url = new URL(profilePic, window.location.origin);
      url.searchParams.set('t', String(Math.floor(Date.now() / (60 * 1000)))); // bust cache every minute
      return url.toString();
    } catch (_) {
      // If not a valid URL (e.g., data URL), return as is
      return profilePic;
    }
  }, [profilePic]);


  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // Navigation items array now includes the new report route.
  const navItems = [
    { label: 'Employees', route: '/employees' },
    { label: 'Timesheets', route: '/timesheets' },
    { label: 'NIC & TAX', route: '/nictax' },
    { label: 'Pay Runs', route: '/payruns' },
    { label: 'Purchase', route: '/purchases' },
    { label: 'Reminder', route: '/reminders'},
    { label: 'Wage Cost Report', route: '/reports/wage-cost-allocation' },
    { label: 'Employee Wage Report', route: '/reports/employee-wage-report' }
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        fontFamily: 'Roboto, sans-serif',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {/* Logo with hover animation */}
        <Box
          component="img"
          src="/img/logo.png" // Update with your actual logo path
          alt="Logo"
          sx={{
            height: 80,
            mr: 2,
            cursor: 'pointer',
            transition: 'transform 0.4s ease-in-out',
            '&:hover': { transform: 'scale(1.05)' },
          }}
          onClick={() => navigate('/dashboard')}
        />

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {navItems.map((item) => (
            <Button
              key={item.label}
              onClick={() => navigate(item.route)}
              sx={{
                color: '#000',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                position: 'relative',
                transition: 'color 0.3s ease',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: 0,
                  height: '2px',
                  bottom: 0,
                  left: 0,
                  backgroundColor: '#000',
                  transition: 'width 0.4s ease',
                },
                '&:hover::after': {
                  width: '100%',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Settings & Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Tooltip title="Settings">
            <IconButton onClick={handleSettingsClick} sx={{ color: '#000' }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={settingsAnchorEl}
            open={Boolean(settingsAnchorEl)}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                navigate('/users');
              }}
              sx={{ fontFamily: 'Roboto, sans-serif', color: '#000' }}
            >
              Users
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                navigate('/locations');
              }}
              sx={{ fontFamily: 'Roboto, sans-serif', color: '#000' }}
            >
              Locations
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                handleLogout();
              }}
              sx={{ fontFamily: 'Roboto, sans-serif', color: '#000' }}
            >
              Logout
            </MenuItem>
          </Menu>

          <Tooltip title="Update Profile">
            <IconButton
              onClick={() => navigate('/profile')}
              sx={{ color: '#000', ml: 1 }}
            >
              {cacheBustedSrc ? (
                <Avatar
                  src={cacheBustedSrc}
                  alt={displayName || 'User'}
                  imgProps={{
                    onError: () => setProfilePic(null),
                    referrerPolicy: 'no-referrer',
                    crossOrigin: 'anonymous',
                  }}
                  sx={{
                    width: 48,
                    height: 48,
                    fontSize: 18,
                    fontWeight: 'bold',
                    bgcolor: '#eee',
                    color: '#555',
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                >
                  {avatarFallbackText}
                </Avatar>
              ) : (
                <Avatar
                  alt={displayName || 'User'}
                  sx={{
                    width: 48,
                    height: 48,
                    fontSize: 18,
                    fontWeight: 'bold',
                    bgcolor: '#eee',
                    color: '#555',
                  }}
                >
                  {avatarFallbackText || <AccountCircleIcon sx={{ fontSize: 32, color: '#777' }} />}
                </Avatar>
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
