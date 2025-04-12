// src/pages/Employee/EmployeeList.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Box,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import AlarmIcon from '@mui/icons-material/Alarm';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { keyframes } from '@mui/system';

// Animation: Slight pulse for avatars
const avatarPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

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

  // Fetch employees with filters & pagination
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status: statusFilter,
        payStructure: payStructureFilter,
        page,
        limit: 20
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, payStructureFilter, page]);

  // Navigate to employee details page on row click
  const handleCardClick = (employeeId) => {
    navigate(`/employees/details/${employeeId}`);
  };

  // Prevent event propagation from action buttons
  const stopPropagation = (e) => e.stopPropagation();

  // Edit button handler
  const handleEdit = (employeeId, e) => {
    stopPropagation(e);
    navigate(`/employees/edit/${employeeId}`);
  };

  // View details button handler
  const handleViewDetails = (employeeId, e) => {
    stopPropagation(e);
    navigate(`/employees/details/${employeeId}`);
  };

  // New handler for creating a reminder for an employee.
  const handleCreateReminder = (employeeId, e) => {
    stopPropagation(e);
    navigate(`/reminders/create?employeeId=${employeeId}`);
  };

  // Pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    // Changed the Container to expand to extra large width and disable default gutters (side margins)
    <Container
      maxWidth="xl"          // <-- Using the maximum width breakpoint (xl)
      disableGutters         // <-- Removes the default side padding
      sx={{ mt: 4, fontFamily: `'Merriweather', serif`, px: { xs: 2, md: 4 } }} // Added custom horizontal padding if needed
    >
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
              fontFamily: `'Merriweather', serif`
            }}
          >
            Add Employee
          </Button>
          {/* New Batch Create Button */}
          <Button
            variant="contained"
            onClick={() => navigate('/employees/batch')}
            sx={{
              bgcolor: '#5e4b33',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: 'none',
              ':hover': { bgcolor: '#3e352a', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
              fontFamily: `'Merriweather', serif`
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
              fontFamily: `'Merriweather', serif`
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
        // Updated TableContainer: spans 100% width with horizontal overflow if needed
        <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
          {/* Set a minimum table width to prevent columns from being too squeezed */}
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                {/* Insert new column header for Base Location */}
                <TableCell sx={{ fontWeight: 'bold' }}>Base Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payroll ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pay Structure</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => {
                const displayName = emp.preferredName || emp.firstName || emp.lastName || 'U';
                return (
                  <TableRow
                    key={emp._id}
                    onClick={() => handleCardClick(emp._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          transition: 'transform 0.3s',
                          '&:hover': { animation: `${avatarPulse} 1s infinite` },
                          border: '2px solid #fff',
                          backgroundColor: '#e0d2be'
                        }}
                        src={emp.profilePic || ''}
                      >
                        {displayName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>{displayName}</TableCell>
                    {/* Updated to show location name rather than the raw ObjectId */}
                    <TableCell>{emp.baseLocationId?.name || 'N/A'}</TableCell>
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
                            fontFamily: `'Merriweather', serif`
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
                            fontFamily: `'Merriweather', serif`
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        onClick={(e) => handleEdit(emp._id, e)}
                        sx={{ color: '#5e4b33' }}
                      >
                        <Edit />
                      </IconButton>
                      <Tooltip title="Add Reminder">
                        <IconButton
                          onClick={(e) => handleCreateReminder(emp._id, e)}
                          sx={{ color: '#5e4b33' }}
                        >
                          <AlarmIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        onClick={(e) => handleViewDetails(emp._id, e)}
                        sx={{
                          color: '#5e4b33',
                          fontFamily: `'Merriweather', serif`,
                          ':hover': { textDecoration: 'underline' }
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
                  <TableCell colSpan={9}>
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
