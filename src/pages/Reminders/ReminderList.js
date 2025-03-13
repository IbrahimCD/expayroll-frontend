// src/pages/Reminders/ReminderList.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ReminderList() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Define the status options available for reminders
  const statusOptions = [
    'Pending',
    'In Progress',
    'Completed',
    'Overdue',
    'Escalated'
  ];

  // Fetch reminders from the backend with filtering and pagination
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params = { search, status: statusFilter, page, limit: 10 };
      const res = await api.get('/reminders', { params });
      setReminders(res.data.reminders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  // Navigate to reminder details page on row click
  const handleRowClick = (id) => {
    navigate(`/reminders/${id}`);
  };

  // Handle inline status change without triggering the row click
  const handleStatusChange = async (id, newStatus, e) => {
    e.stopPropagation(); // Prevent row click
    try {
      await api.put(`/reminders/${id}`, { status: newStatus });
      // Optionally, show a success notification here
      fetchReminders();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Edit reminder handler
  const handleEditReminder = (id, e) => {
    e.stopPropagation();
    navigate(`/reminders/edit/${id}`);
  };

  // Delete reminder handler
  const handleDeleteReminder = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await api.delete(`/reminders/${id}`);
        fetchReminders();
      } catch (err) {
        console.error('Error deleting reminder:', err);
      }
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reminders
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2
        }}
      >
        <TextField
          label="Search Reminders"
          variant="outlined"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {statusOptions.map((statusOption) => (
              <MenuItem key={statusOption} value={statusOption}>
                {statusOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => navigate('/reminders/create')}
        >
          Create Reminder
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recurring</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow
                  key={reminder._id}
                  hover
                  onClick={() => handleRowClick(reminder._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{reminder.employeeName}</TableCell>
                  <TableCell>{reminder.note}</TableCell>
                  <TableCell>
                    {new Date(reminder.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={reminder.status}
                        onChange={(e) =>
                          handleStatusChange(
                            reminder._id,
                            e.target.value,
                            e
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        {statusOptions.map((statusOption) => (
                          <MenuItem key={statusOption} value={statusOption}>
                            {statusOption}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {reminder.isRecurring
                      ? reminder.recurrenceInterval
                      : 'No'}
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => handleEditReminder(reminder._id, e)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={(e) => handleDeleteReminder(reminder._id, e)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reminders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No reminders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
        />
      </Box>
    </Container>
  );
}
