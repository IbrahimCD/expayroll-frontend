import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ReminderDetails() {
  const { reminderId } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const [error, setError] = useState('');

  const fetchReminder = async () => {
    try {
      const res = await api.get(`/reminders/${reminderId}`);
      setReminder(res.data.reminder);
    } catch (err) {
      console.error(err);
      setError('Error fetching reminder');
    }
  };

  useEffect(() => {
    fetchReminder();
  }, [reminderId]);

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!reminder) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading reminder details...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reminder Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1">
          <strong>Employee:</strong> {reminder.employeeName}
        </Typography>
        <Typography variant="body1">
          <strong>Note:</strong> {reminder.note}
        </Typography>
        <Typography variant="body1">
          <strong>Due Date:</strong> {new Date(reminder.dueDate).toLocaleDateString()}
        </Typography>
        <Typography variant="body1">
          <strong>Status:</strong> {reminder.status}
        </Typography>
        {reminder.isRecurring && (
          <Typography variant="body1">
            <strong>Recurring:</strong> {reminder.recurrenceInterval}
          </Typography>
        )}
        {reminder.attachments && reminder.attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Attachments:</strong>
            </Typography>
            {reminder.attachments.map((url, idx) => (
              <Typography key={idx} variant="body2">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              </Typography>
            ))}
          </Box>
        )}

        {reminder.comments && reminder.comments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Comments:</strong>
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Comment</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reminder.comments.map((c, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{c.comment}</TableCell>
                    <TableCell>{c.commentedBy}</TableCell>
                    <TableCell>{new Date(c.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {reminder.auditLogs && reminder.auditLogs.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Audit Log:</strong>
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reminder.auditLogs.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.performedBy}</TableCell>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/reminders')}>
            Back to Reminders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
