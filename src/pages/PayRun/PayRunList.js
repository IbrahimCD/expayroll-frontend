import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Box,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Grow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PayRunList() {
  const navigate = useNavigate();
  const [payruns, setPayruns] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed page size
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // -------------------------------
  // Numeric formatting helper
  // -------------------------------
  function formatToTwoDecimals(value) {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(2);
    }
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return parseFloat(value).toFixed(2);
    }
    return value;
  }

  // -------------------------------
  // Fetch pay runs with filters and pagination
  // -------------------------------
  const fetchPayRuns = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter
      };
      const res = await api.get('/payruns', { params });
      const data = res.data;
      if (data.data) {
        setPayruns(data.data);
        setTotalPages(data.pagination.pages);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching pay runs:', err);
      setError(err.response?.data?.message || 'Failed to load pay runs.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, startDateFilter, endDateFilter]);

  useEffect(() => {
    fetchPayRuns();
  }, [fetchPayRuns]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowClick = (payRunId) => {
    navigate(`/payruns/${payRunId}`);
  };

  const handleCreatePayRun = () => {
    navigate('/payruns/create');
  };

  // Delete handler for Draft pay runs only
  const handleDelete = async (payRunId, event) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this Draft pay run?')) return;
    try {
      await api.delete(`/payruns/${payRunId}`);
      fetchPayRuns();
    } catch (err) {
      console.error('Error deleting pay run:', err);
      setError(err.response?.data?.message || 'Failed to delete pay run.');
    }
  };

  // Render status with a color-coded Chip
  const renderStatusChip = (status) => {
    let chipColor;
    switch (status) {
      case 'Draft':
        chipColor = 'default';
        break;
      case 'Approved':
        chipColor = 'primary';
        break;
      case 'Paid':
        chipColor = 'success';
        break;
      case 'Rejected':
        chipColor = 'error';
        break;
      default:
        chipColor = 'default';
    }
    return <Chip label={status} color={chipColor} size="small" />;
  };

  // Memoize table rows for better performance on large data sets
  const tableRows = useMemo(() => {
    return payruns.map((pr) => (
      <Grow key={pr._id} in timeout={600}>
        <TableRow
          hover
          onClick={() => handleRowClick(pr._id)}
          sx={{ cursor: 'pointer', transition: 'background 0.3s' }}
        >
          <TableCell>{pr.payRunName}</TableCell>
          <TableCell>{new Date(pr.startDate).toLocaleDateString()}</TableCell>
          <TableCell>{new Date(pr.endDate).toLocaleDateString()}</TableCell>
          <TableCell>{renderStatusChip(pr.status)}</TableCell>
          {/* Format totalNetPay to 2 decimals */}
          <TableCell>{formatToTwoDecimals(pr.totalNetPay)}</TableCell>
          <TableCell align="center">
            {pr.status === 'Draft' && (
              <IconButton
                onClick={(e) => handleDelete(pr._id, e)}
                color="error"
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
      </Grow>
    ));
  }, [payruns]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pay Runs
      </Typography>

      {/* Filters Section */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDateFilter}
            onChange={(e) => { setStartDateFilter(e.target.value); setPage(1); }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDateFilter}
            onChange={(e) => { setEndDateFilter(e.target.value); setPage(1); }}
          />
        </Grid>
      </Grid>

      <Button variant="contained" onClick={handleCreatePayRun} sx={{ mb: 2 }}>
        Create New Pay Run
      </Button>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                <TableCell>Pay Run Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Net Pay</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{tableRows}</TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} />
      </Box>
    </Container>
  );
}
