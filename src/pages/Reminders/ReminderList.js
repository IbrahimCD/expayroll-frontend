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
  MenuItem
} from '@mui/material';
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

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const params = { search, status: statusFilter, page, limit: 10 };
      const res = await api.get('/reminders', { params });
      setReminders(res.data.reminders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [search, statusFilter, page]);

  const handleRowClick = (id) => {
    navigate(`/reminders/${id}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reminders
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          label="Search Reminders"
          variant="outlined"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
            <MenuItem value="Escalated">Escalated</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => navigate('/reminders/create')}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map(reminder => (
                <TableRow
                  key={reminder._id}
                  hover
                  onClick={() => handleRowClick(reminder._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{reminder.employeeName}</TableCell>
                  <TableCell>{reminder.note}</TableCell>
                  <TableCell>{new Date(reminder.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{reminder.status}</TableCell>
                  <TableCell>{reminder.isRecurring ? reminder.recurrenceInterval : 'No'}</TableCell>
                </TableRow>
              ))}
              {reminders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No reminders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} />
      </Box>
    </Container>
  );
}
