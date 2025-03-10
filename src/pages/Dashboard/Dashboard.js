// src/pages/Dashboard/Dashboard.js
import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome to the payroll dashboard!
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/users')}>
          Manage Users
        </Button>
      </Paper>
    </Box>
  );
}

export default Dashboard;
