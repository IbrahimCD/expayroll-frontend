// src/pages/Timesheet/TimesheetList.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Fade,
  Grow,
  Tooltip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

export default function TimesheetList() {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState([]);
  const [locations, setLocations] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const params = { search, status: statusFilter, page, limit: 10 };
      const res = await api.get('/timesheets', { params });
      setTimesheets(res.data.timesheets || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      const locMap = {};
      (res.data || []).forEach((loc) => {
        locMap[loc._id] = loc;
      });
      setLocations(locMap);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      try {
        await api.delete(`/timesheets/${id}`);
        fetchTimesheets();
      } catch (error) {
        console.error('Error deleting timesheet:', error);
      }
    }
  };

  const handleRowClick = (id) => {
    navigate(`/timesheets/${id}`);
  };

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Approve this timesheet?')) {
      try {
        await api.put(`/timesheets/${id}/approve`);
        fetchTimesheets();
      } catch (error) {
        console.error('Error approving timesheet:', error);
      }
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <Container
        sx={{
          mt: 4,
          backgroundColor: '#fff',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          fontFamily: "'Merriweather', serif"
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            Timesheet List
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/timesheets/create')}
              sx={{
                bgcolor: '#c1a266',
                color: '#fff',
                fontWeight: 'bold',
                ':hover': { bgcolor: '#ae8e55' }
              }}
            >
              Create Timesheet
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/timesheets/batch-template')}
            >
              Batch Template
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/timesheets/batch-create')}
            >
              Batch Create
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search Timesheet Name"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { fontFamily: "'Merriweather', serif" },
              backgroundColor: '#fff'
            }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 150, backgroundColor: '#fff' }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ fontFamily: "'Merriweather', serif" }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Pay Approved">Pay Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Paper>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Timesheet Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheets.map((ts) => {
                  const locObj = locations[ts.locationId] || {};
                  const locationName = locObj.name || 'Unknown Location';
                  return (
                    <Grow key={ts._id} in={true} timeout={600}>
                      <TableRow
                        onClick={() => handleRowClick(ts._id)}
                        sx={{
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          ':hover': { transform: 'scale(1.02)', backgroundColor: '#f9f9f9' }
                        }}
                      >
                        <TableCell>{ts.timesheetName}</TableCell>
                        <TableCell>
                          {formatDate(ts.startDate)} - {formatDate(ts.endDate)}
                        </TableCell>
                        <TableCell>{locationName}</TableCell>
                        <TableCell>
                          {ts.status && (
                            <Tooltip title="Timesheet Status">
                              <Chip
                                label={ts.status}
                                color={
                                  ts.status === 'Approved'
                                    ? 'success'
                                    : ts.status === 'Pending'
                                    ? 'warning'
                                    : ts.status === 'Draft'
                                    ? 'default'
                                    : ts.status === 'Pay Approved'
                                    ? 'info'
                                    : 'error'
                                }
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(ts.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/timesheets/edit/${ts._id}`);
                            }}
                          >
                            Edit
                          </Button>
                          {ts.status === 'Draft' && (
                            <Button
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                api
                                  .put(`/timesheets/${ts._id}/approve`)
                                  .then(() => fetchTimesheets())
                                  .catch((err) => console.error('Error approving timesheet:', err));
                              }}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="error"
                            onClick={(e) => handleDelete(ts._id, e)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    </Grow>
                  );
                })}
                {timesheets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography>No timesheets found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
            sx={{ fontFamily: "'Merriweather', serif" }}
          />
        </Box>
      </Container>
    </Fade>
  );
}
