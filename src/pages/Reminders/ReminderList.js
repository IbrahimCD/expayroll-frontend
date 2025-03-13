// src/pages/Reminders/ReminderList.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress
} from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ReminderList() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchReminders = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { search, status: statusFilter, page, limit: 10 };
      const res = await api.get('/reminders', { params });
      setReminders(res.data.reminders);
      if (res.data.totalPages) setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
      setError('Error fetching reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [search, statusFilter, page]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reminders List
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search Reminders"
          variant="outlined"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => navigate('/reminders/create')}>
          Create Reminder
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((rem) => (
                <TableRow key={rem._id}>
                  <TableCell>{rem.employeeName}</TableCell>
                  <TableCell>{rem.note}</TableCell>
                  <TableCell>{new Date(rem.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{rem.status}</TableCell>
                  <TableCell>{new Date(rem.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" onClick={() => navigate(`/reminders/${rem._id}`)}>
                      View/Edit
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
        <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} />
      </Box>
    </Container>
  );
}
