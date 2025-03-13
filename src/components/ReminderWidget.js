import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemText, Button } from '@mui/material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ReminderWidget() {
  const [upcoming, setUpcoming] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const navigate = useNavigate();

  const fetchReminders = async () => {
    try {
      const res = await api.get('/reminders');
      const reminders = res.data.reminders || [];
      const now = new Date();
      const upcomingReminders = reminders.filter(r => new Date(r.dueDate) >= now);
      const overdueReminders = reminders.filter(r => new Date(r.dueDate) < now && r.status !== 'Completed');
      setUpcoming(upcomingReminders);
      setOverdue(overdueReminders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Reminder Widget</Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle1">Upcoming Reminders</Typography>
        <List>
          {upcoming.slice(0, 3).map(r => (
            <ListItem key={r._id} button onClick={() => navigate(`/reminders/${r._id}`)}>
              <ListItemText primary={r.employeeName} secondary={new Date(r.dueDate).toLocaleDateString()} />
            </ListItem>
          ))}
          {upcoming.length === 0 && <Typography>No upcoming reminders</Typography>}
        </List>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Overdue Reminders</Typography>
        <List>
          {overdue.slice(0, 3).map(r => (
            <ListItem key={r._id} button onClick={() => navigate(`/reminders/${r._id}`)}>
              <ListItemText primary={r.employeeName} secondary={new Date(r.dueDate).toLocaleDateString()} />
            </ListItem>
          ))}
          {overdue.length === 0 && <Typography>No overdue reminders</Typography>}
        </List>
      </Box>
      <Button variant="text" onClick={() => navigate('/reminders')}>
        View All Reminders
      </Button>
    </Paper>
  );
}
