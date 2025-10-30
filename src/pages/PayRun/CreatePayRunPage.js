// frontend/src/pages/PayRun/CreatePayRunPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CreatePayRunPage() {
  const navigate = useNavigate();

  // Form fields
  const [payRunName, setPayRunName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Optional message/error states
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Automatically set end date to 6 days after start date (7-day period inclusive)
  // whenever startDate changes (if you want this logic).
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      // Add 6 days
      const newEnd = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
      setEndDate(newEnd.toISOString().substring(0, 10)); 
      // substring(0,10) => "YYYY-MM-DD" for <input type="date" />
    }
  }, [startDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!payRunName || !startDate || !endDate) {
      setError('Please fill all required fields.');
      return;
    }

    const payload = {
      payRunName,
      startDate,
      endDate,
      notes
    };

    try {
      const res = await api.post('/payruns', payload);
      setMessage(res.data.message || 'Pay Run created successfully.');
      // Redirect to the Pay Run list (or wherever you display pay runs)
      navigate('/payruns');
    } catch (err) {
      console.error('Error creating pay run:', err);
      setError(err.response?.data?.message || 'Failed to create pay run.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Create Pay Run
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <form onSubmit={handleSubmit}>
            <TextField
              label="Pay Run Name"
              value={payRunName}
              onChange={(e) => setPayRunName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" type="submit">
                Generate Pay Run
              </Button>
            </Box>
          </form>

          {/* Display success or error message */}
          {message && (
            <Typography sx={{ mt: 2, color: 'green' }}>
              {message}
            </Typography>
          )}
          {error && (
            <Typography sx={{ mt: 2, color: 'red' }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
