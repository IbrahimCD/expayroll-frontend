import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Paper
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateReminder() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('');
  const [attachments, setAttachments] = useState('');
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch employees to populate dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assume attachments are comma-separated URLs
      const attachmentsArray = attachments.split(',').map(url => url.trim()).filter(url => url);
      const payload = {
        employeeId,
        employeeName,
        note,
        dueDate,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : null,
        attachments: attachmentsArray
      };
      const res = await api.post('/reminders', payload);
      setMessage(res.data.message);
      navigate('/reminders');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error creating reminder');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Reminder
        </Typography>
        {message && <Typography color="primary">{message}</Typography>}
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              label="Employee"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                const selected = employees.find(emp => emp._id === e.target.value);
                setEmployeeName(selected ? `${selected.firstName} ${selected.lastName}` : '');
              }}
            >
              {employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Employee Name"
            fullWidth
            value={employeeName}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="Reminder Note"
            fullWidth
            multiline
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
            }
            label="Recurring Reminder"
            sx={{ mb: 2 }}
          />
          {isRecurring && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Recurrence Interval</InputLabel>
              <Select
                label="Recurrence Interval"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            label="Attachments (comma separated URLs)"
            fullWidth
            value={attachments}
            onChange={(e) => setAttachments(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit">
            Create Reminder
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
