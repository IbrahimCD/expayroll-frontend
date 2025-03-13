// src/pages/Reminders/ReminderDetails.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ReminderDetails() {
  const { reminderId } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    note: '',
    dueDate: '',
    status: ''
  });

  const fetchReminder = async () => {
    try {
      const res = await api.get(`/reminders/${reminderId}`);
      setReminder(res.data.reminder);
      setForm({
        note: res.data.reminder.note,
        dueDate: res.data.reminder.dueDate.split('T')[0],
        status: res.data.reminder.status
      });
    } catch (err) {
      setError('Error fetching reminder details');
    }
  };

  useEffect(() => {
    fetchReminder();
  }, [reminderId]);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/reminders/${reminderId}`, form);
      setEditMode(false);
      fetchReminder();
    } catch (err) {
      setError('Error updating reminder');
    }
  };

  if (!reminder) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reminder Details
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1"><strong>Employee:</strong> {reminder.employeeName}</Typography>
          <Typography variant="body1"><strong>Due Date:</strong> {new Date(reminder.dueDate).toLocaleDateString()}</Typography>
          <Typography variant="body1"><strong>Status:</strong> {reminder.status}</Typography>
        </Box>
        {editMode ? (
          <>
            <TextField
              fullWidth
              label="Note"
              name="note"
              variant="outlined"
              value={form.note}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              name="dueDate"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={form.dueDate}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              variant="outlined"
              value={form.status}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleUpdate}>
              Save Changes
            </Button>
            <Button variant="text" onClick={() => setEditMode(false)} sx={{ ml: 2 }}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1"><strong>Note:</strong> {reminder.note}</Typography>
            <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
              Edit Reminder
            </Button>
          </>
        )}
        <Button variant="text" onClick={() => navigate('/reminders')} sx={{ mt: 2 }}>
          Back to Reminders List
        </Button>
      </Paper>
    </Container>
  );
}
