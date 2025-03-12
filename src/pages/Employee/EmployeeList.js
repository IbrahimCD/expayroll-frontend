// src/pages/Employee/EmployeeList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { keyframes } from '@mui/system';

// Helper: Return color based on employee status
const getStatusColor = (status) => {
  switch (status) {
    case 'Employed': return 'green';
    case 'On Leave': return 'orange';
    case 'Left': return 'red';
    default: return 'grey';
  }
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Employed');
  const [payStructureFilter, setPayStructureFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sorting states for Name, Base Location, and Payroll ID
  const [orderBy, setOrderBy] = useState('name'); // "name" refers to the employee's name
  const [orderDirection, setOrderDirection] = useState('asc');

  // Fetch employees with filters & pagination from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status: statusFilter,
        payStructure: payStructureFilter,
        page,
        limit: 20,
      };
      const res = await api.get('/employees', { params });
      setEmployees(res.data.employees);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter, payStructureFilter, page]);

  // Handle sorting requests
  const handleSortRequest = (column) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(column);
      setOrderDirection('asc');
    }
  };

  // Sort employees based on selected column and direction
  const sortedEmployees = useMemo(() => {
    let sorted = [...employees];
    if (orderBy === 'name') {
      sorted.sort((a, b) => {
        const nameA = (a.preferredName || a.firstName || '').toLowerCase();
        const nameB = (b.preferredName || b.firstName || '').toLowerCase();
        if (nameA < nameB) return orderDirection === 'asc' ? -1 : 1;
        if (nameA > nameB) return orderDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else if (orderBy === 'baseLocation') {
      sorted.sort((a, b) => {
        // Assuming baseLocationId is a string (e.g. location code)
        const locA = a.baseLocationId ? a.baseLocationId.toLowerCase() : '';
        const locB = b.baseLocationId ? b.baseLocationId.toLowerCase() : '';
        if (locA < locB) return orderDirection === 'asc' ? -1 : 1;
        if (locA > locB) return orderDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else if (orderBy === 'payrollId') {
      sorted.sort((a, b) => {
        const payrollA = a.payrollId ? a.payrollId.toLowerCase() : '';
        const payrollB = b.payrollId ? b.payrollId.toLowerCase() : '';
        if (payrollA < payrollB) return orderDirection === 'asc' ? -1 : 1;
        if (payrollA > payrollB) return orderDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [employees, orderBy, orderDirection]);

  // Navigate to employee details page on row click
  const handleCardClick = (employeeId) => {
    navigate(`/employees/details/${employeeId}`);
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container sx={{ mt: 4, fontFamily: `'Merriweather', serif` }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#5e4b33', fontWeight: 'bold' }}>
        Employee List
      </Typography>

      {/* Top controls: Filters & action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search by Name"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { fontFamily: `'Merriweather', serif` } }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ fontFamily: `'Merriweather', serif` }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Employed">Employed</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
              <MenuItem value="Left">Left</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Pay Structure Name"
            variant="outlined"
            value={payStructureFilter}
            onChange={(e) => setPayStructureFilter(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { fontFamily: `'Merriweather', serif` } }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => navigate('/employees/create')}
            sx={{
              bgcolor: '#c1a266',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: 'none',
              ':hover': { bgcolor: '#ae8e55', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
              fontFamily: `'Merriweather', serif`,
            }}
          >
            Add Employee
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/employees/batch')}
            sx={{
              bgcolor: '#5e4b33',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: 'none',
              ':hover': { bgcolor: '#3e352a', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
              fontFamily: `'Merriweather', serif`,
            }}
          >
            Batch Create
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/employees/batch-update')}
            sx={{
              bgcolor: '#5e4b33',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: 'none',
              ':hover': { bgcolor: '#3e352a', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
              fontFamily: `'Merriweather', serif`,
            }}
          >
            Batch Update
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* Sortable Columns */}
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? orderDirection : 'asc'}
                    onClick={() => handleSortRequest('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'baseLocation'}
                    direction={orderBy === 'baseLocation' ? orderDirection : 'asc'}
                    onClick={() => handleSortRequest('baseLocation')}
                  >
                    Base Location
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'payrollId'}
                    direction={orderBy === 'payrollId' ? orderDirection : 'asc'}
                    onClick={() => handleSortRequest('payrollId')}
                  >
                    Payroll ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pay Structure</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEmployees.map((emp) => {
                const displayName =
                  emp.preferredName || emp.firstName || emp.lastName || 'U';
                return (
                  <TableRow
                    key={emp._id}
                    onClick={() => handleCardClick(emp._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {/* Name column: combines employee name and base location */}
                    <TableCell>{`${displayName} (${emp.baseLocationId || 'N/A'})`}</TableCell>
                    <TableCell>{emp.baseLocationId || 'N/A'}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.mobileNo || 'N/A'}</TableCell>
                    <TableCell>{emp.payrollId || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: getStatusColor(emp.status), fontWeight: 'bold' }}>
                        {emp.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {emp.payStructure?.payStructureName && (
                        <Chip
                          label={`Pay Structure: ${emp.payStructure.payStructureName}`}
                          size="small"
                          sx={{
                            backgroundColor: '#c1a266',
                            color: '#fff',
                            fontFamily: `'Merriweather', serif`,
                          }}
                        />
                      )}
                      {emp.email === 'easteregg@example.com' && (
                        <Chip
                          label="🎉 Easter Egg!"
                          size="small"
                          sx={{
                            ml: 1,
                            backgroundColor: '#FFD700',
                            color: '#000',
                            fontWeight: 'bold',
                            fontFamily: `'Merriweather', serif`,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      {/* Only View Details action remains */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employees/details/${emp._id}`);
                        }}
                        sx={{
                          color: '#5e4b33',
                          fontFamily: `'Merriweather', serif`,
                          ':hover': { textDecoration: 'underline' },
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography sx={{ fontFamily: `'Merriweather', serif` }}>
                      No employees found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} />
      </Box>
    </Container>
  );
}
