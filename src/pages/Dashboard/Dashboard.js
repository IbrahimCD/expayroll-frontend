// src/pages/Dashboard/Dashboard.js
import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReminderWidget from '../../components/ReminderWidget';

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


// Inside your Dashboard component's JSX:
<Box sx={{ mt: 3 }}>
  <ReminderWidget />
</Box>

export default Dashboard;
