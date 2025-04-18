import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Assessment, Warning, Visibility, Group } from '@mui/icons-material';
import api from '../../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // --------------------------------------
  // State for Reminders Summary / Overdue
  // --------------------------------------
  const [reminderStats, setReminderStats] = useState({
    totalPending: 0,
    totalInProgress: 0,
    totalOverdue: 0,
    totalEscalated: 0,
    totalCompleted: 0
  });

  const [overdueReminders, setOverdueReminders] = useState([]);

  // --------------------------------------
  // Fetch reminders & compute summary
  // --------------------------------------
  const fetchRemindersSummary = async () => {
    try {
      const res = await api.get('/reminders', { params: { limit: 9999 } });
      const allReminders = res.data.reminders || [];

      // Calculate counts
      const totalPending = allReminders.filter(r => r.status === 'Pending').length;
      const totalInProgress = allReminders.filter(r => r.status === 'In Progress').length;
      const totalOverdue = allReminders.filter(r => r.status === 'Overdue').length;
      const totalEscalated = allReminders.filter(r => r.status === 'Escalated').length;
      const totalCompleted = allReminders.filter(r => r.status === 'Completed').length;

      // For top overdue list, sort by dueDate ascending
      const overdueSorted = allReminders
        .filter(r => r.status === 'Overdue')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      // Keep only top 3 (or 5) overdue
      const topOverdue = overdueSorted.slice(0, 3);

      setReminderStats({
        totalPending,
        totalInProgress,
        totalOverdue,
        totalEscalated,
        totalCompleted
      });
      setOverdueReminders(topOverdue);
    } catch (err) {
      console.error('Error fetching reminders summary:', err);
    }
  };

  // --------------------------------------
  // Lifecycle: Fetch on mount
  // --------------------------------------
  useEffect(() => {
    fetchRemindersSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------
  // Render
  // --------------------------------------
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2
      }}
    >
      {/* Top Welcome Card */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: 3,
          boxShadow: '0px 5px 15px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.5s ease-in-out'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome to the payroll dashboard!
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/users')}
            startIcon={<Group />}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.04)' }
            }}
          >
            Manage Users
          </Button>
        </Box>
      </Paper>

      {/* Reminders Overview & Overdue List */}
      <Grid container spacing={2}>
        {/* Reminders Overview Stats */}
        <Grid item xs={12} md={8}>
          <Card
            elevation={4}
            sx={{
              borderRadius: 3,
              animation: 'fadeIn 0.7s ease-in-out'
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Assessment color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Reminders Overview
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#fff9c4'
                    }}
                  >
                    <Typography variant="h6">Pending</Typography>
                    <Typography variant="h4">
                      {reminderStats.totalPending}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#ffe0b2'
                    }}
                  >
                    <Typography variant="h6">In Progress</Typography>
                    <Typography variant="h4">
                      {reminderStats.totalInProgress}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#ffcdd2'
                    }}
                  >
                    <Typography variant="h6">Overdue</Typography>
                    <Typography variant="h4">
                      {reminderStats.totalOverdue}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#e0e0e0'
                    }}
                  >
                    <Typography variant="h6">Escalated</Typography>
                    <Typography variant="h4">
                      {reminderStats.totalEscalated}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#c8e6c9',
                    minWidth: '120px',
                    m: 1
                  }}
                >
                  <Typography variant="h6">Completed</Typography>
                  <Typography variant="h4">
                    {reminderStats.totalCompleted}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/reminders')}
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  View All Reminders
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Overdue List */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={4}
            sx={{
              borderRadius: 3,
              animation: 'fadeIn 0.7s ease-in-out'
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Top Overdue
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {overdueReminders.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'gray' }}>
                  No overdue reminders
                </Typography>
              ) : (
                <List disablePadding>
                  {overdueReminders.map((rem) => (
                    <Box key={rem._id} sx={{ mb: 1 }}>
                      <ListItem
                        sx={{
                          backgroundColor: '#ffcdd2',
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            boxShadow: '0px 4px 15px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <ListItemText
                          primary={`${rem.employeeName}`}
                          secondary={`Due: ${new Date(rem.dueDate).toLocaleDateString()}`}
                        />
                        <Tooltip title="View Reminder" arrow>
                          <IconButton
                            onClick={() => navigate(`/reminders/${rem._id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}

              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => navigate('/reminders?status=Overdue')}
                  sx={{
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  View All Overdue
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
