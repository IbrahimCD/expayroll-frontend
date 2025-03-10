import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  CircularProgress,
  Pagination,
  Fade,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Grid,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Pay Approved', label: 'Pay Approved' },
  { value: 'Paid', label: 'Paid' }
];

export default function NICTaxList() {
  const navigate = useNavigate();
  const [nictaxRecords, setNictaxRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Adjust as needed

  // State for tracking per-record action loading (approve, revert, delete)
  const [actionLoading, setActionLoading] = useState({});

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Helper: returns a color based on record status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'warning';
      case 'Approved':
        return 'primary';
      case 'Pay Approved':
        return 'info';
      case 'Paid':
        return 'success';
      default:
        return 'default';
    }
  };

  // Fetch NIC Tax records with pagination and filters
  const fetchNICTaxRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (startDateFilter) params.startDate = startDateFilter;
      if (endDateFilter) params.endDate = endDateFilter;
      const res = await api.get('/nictax', { params });
      // Expected response: { data: [...], pagination: { total, page, pages, limit } }
      setNictaxRecords(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching NIC & Tax records:', err);
      setError(err.response?.data?.message || 'Failed to fetch NIC/TAX records');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    fetchNICTaxRecords();
  }, [fetchNICTaxRecords]);

  // Navigate to NIC Tax details page (always, regardless of status)
  const handleRowClick = (id) => {
    navigate(`/nictax/${id}`);
  };

  // Helper to manage loading state for specific record actions
  const setActionLoadingForId = (id, isLoading) => {
    setActionLoading((prev) => ({ ...prev, [id]: isLoading }));
  };

  // Approve a record
  const handleApprove = async (e, id) => {
    e.stopPropagation();
    setActionLoadingForId(id, true);
    try {
      await api.put(`/nictax/${id}`, { status: 'Approved' });
      await fetchNICTaxRecords();
    } catch (err) {
      console.error('Error approving record:', err);
    } finally {
      setActionLoadingForId(id, false);
    }
  };

  // Revert a record to Draft
  const handleRevert = async (e, id) => {
    e.stopPropagation();
    setActionLoadingForId(id, true);
    try {
      await api.put(`/nictax/${id}`, { status: 'Draft' });
      await fetchNICTaxRecords();
    } catch (err) {
      console.error('Error reverting record to Draft:', err);
    } finally {
      setActionLoadingForId(id, false);
    }
  };

  // Delete a record
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this NIC & TAX record?')) return;
    setActionLoadingForId(id, true);
    try {
      await api.delete(`/nictax/${id}`);
      await fetchNICTaxRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
    } finally {
      setActionLoadingForId(id, false);
    }
  };

  // Handle filter changes: reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, startDateFilter, endDateFilter]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 3,
          backgroundColor: '#ffffff',
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" gutterBottom>
          NIC & TAX Records
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Filter Bar */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search by Record Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                fullWidth
                variant="outlined"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                variant="outlined"
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Action buttons */}
        <Box sx={{ textAlign: 'right', mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="contained" onClick={() => navigate('/nictax/create')}>
            CREATE NEW RECORD
          </Button>
          {/* ADDITION #1: Batch Template Page */}
          <Button
            variant="outlined"
            onClick={() => navigate('/nictax/batch-template')}
          >
            BATCH CREATE
          </Button>
       
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Fade in={!loading} timeout={500}>
            <Box>
              {nictaxRecords.length === 0 ? (
                <Typography>No NIC/TAX records found.</Typography>
              ) : (
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Record Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date Range</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nictaxRecords.map((doc) => (
                      <TableRow
                        key={doc._id}
                        hover
                        onClick={() => handleRowClick(doc._id)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.01)',
                            backgroundColor: '#f9f9f9'
                          }
                        }}
                      >
                        <TableCell>{doc.recordName}</TableCell>
                        <TableCell>
                          {new Date(doc.startDate).toLocaleDateString()} -{' '}
                          {new Date(doc.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{doc.baseLocationId?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Chip label={doc.status} color={getStatusColor(doc.status)} />
                        </TableCell>
                        <TableCell>
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          {doc.status === 'Draft' ? (
                            <>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => handleApprove(e, doc._id)}
                                sx={{ mr: 1 }}
                                disabled={actionLoading[doc._id]}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                onClick={(e) => handleDelete(e, doc._id)}
                                disabled={actionLoading[doc._id]}
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => handleRevert(e, doc._id)}
                              disabled={actionLoading[doc._id]}
                            >
                              Revert to Draft
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </Box>
          </Fade>
        )}
      </Paper>
    </Container>
  );
}
