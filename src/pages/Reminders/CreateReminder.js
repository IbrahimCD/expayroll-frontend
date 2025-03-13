// src/pages/Reminders/CreateReminder.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Paper, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function CreateReminder() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [note, setNote] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees', { params: { limit: 1000 } });
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error(err);
        setError('Error fetching employees.');
      }
    };
    fetchEmployees();
  }, []);

  const handleEmployeeChange = (e) => {
    const selectedId = e.target.value;
    setEmployeeId(selectedId);
    const emp = employees.find(emp => emp._id === selectedId);
    setEmployeeName(emp ? `${emp.firstName} ${emp.lastName}` : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !note || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      const res = await api.post('/reminders', {
        employeeId,
        employeeName,
        note,
        dueDate,
        status
      });
      setMessage(res.data.message);
      navigate('/reminders');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error creating reminder.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create Reminder
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {message && <Typography color="primary">{message}</Typography>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Employee</InputLabel>
            <Select
              label="Select Employee"
              value={employeeId}
              onChange={handleEmployeeChange}
              required
            >
              {employees.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Note"
            variant="outlined"
            sx={{ mb: 2 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            sx={{ mb: 2 }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Create Reminder
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
