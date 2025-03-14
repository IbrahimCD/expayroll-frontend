// src/pages/PayRun/PayRunDetailsPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Grow,
  Tooltip
} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import EmployeePayRunModal from './EmployeePayRunModal';

// MUI Icons
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DoneIcon from '@mui/icons-material/Done';
import UndoIcon from '@mui/icons-material/Undo';
import PaidIcon from '@mui/icons-material/Paid';

// Helper: Format a number to 2 decimals
const formatToTwoDecimals = (value) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(2);
  }
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toFixed(2);
  }
  return value;
};

export default function PayRunDetailsPage() {
  const { payRunId } = useParams();

  const [payRun, setPayRun] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // For employee breakdown modal
  const [selectedEmployeeEntry, setSelectedEmployeeEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 1) Fetch Pay Run by ID
  const fetchPayRun = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get(`/payruns/${payRunId}`);
      setPayRun(res.data.payrun);
    } catch (err) {
      console.error('Error fetching pay run:', err);
      setError(err.response?.data?.message || 'Failed to fetch pay run.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayRun();
    // eslint-disable-next-line
  }, [payRunId]);

  // 2) Action Handlers
  const handleApprove = async () => {
    if (!payRun) return;
    try {
      const res = await api.put(`/payruns/${payRunId}/approve`);
      setMessage(res.data.message);
      fetchPayRun();
    } catch (err) {
      console.error('Error approving pay run:', err);
      setError(err.response?.data?.message || 'Failed to approve pay run.');
    }
  };

  const handleRevert = async () => {
    if (!payRun) return;
    try {
      const res = await api.put(`/payruns/${payRunId}/revert`);
      setMessage(res.data.message);
      fetchPayRun();
    } catch (err) {
      console.error('Error reverting pay run:', err);
      setError(err.response?.data?.message || 'Failed to revert pay run.');
    }
  };

  const handleMarkPaid = async () => {
    if (!payRun) return;
    try {
      const res = await api.put(`/payruns/${payRunId}/paid`);
      setMessage(res.data.message);
      fetchPayRun();
    } catch (err) {
      console.error('Error marking pay run as paid:', err);
      setError(err.response?.data?.message || 'Failed to mark pay run as paid.');
    }
  };

  const handleRecalc = async () => {
    if (!payRun) return;
    try {
      const res = await api.put(`/payruns/${payRunId}/recalc`);
      setMessage(res.data.message);
      fetchPayRun();
    } catch (err) {
      console.error('Error recalculating pay run:', err);
      setError(err.response?.data?.message || 'Failed to recalc pay run.');
    }
  };

  // 3) CSV Download Handler
  const handleDownloadCSV = () => {
    // This endpoint should trigger a CSV download with all pay run details.
    window.location.href = `${api.defaults.baseURL}/payruns/${payRunId}/export`;
  };

  // 4) Modal open for a specific employee
  const handleViewDetails = (entry) => {
    setSelectedEmployeeEntry(entry);
    setModalOpen(true);
  };

  // 5) Rendering states
  if (loading) {
    return (
      <Container
        sx={{
          mt: 4,
          textAlign: 'center',
          minHeight: '100vh',
          background: `radial-gradient(circle at top, rgb(253, 253, 253) 0%, rgb(255, 255, 255) 35%, rgb(255, 255, 255) 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#fff' }} />
        <Typography sx={{ mt: 2, color: '#fff' }}>
          Loading Pay Run details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        sx={{
          mt: 4,
          minHeight: '100vh',
          background: `radial-gradient(circle at top, rgb(240, 240, 240) 0%, rgb(255, 255, 255) 35%, rgb(255, 255, 255) 100%)`,
          pt: 4
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!payRun) {
    return (
      <Container
        sx={{
          mt: 4,
          minHeight: '100vh',
          background: `radial-gradient(circle at top, rgb(252, 252, 252) 0%, rgb(249, 249, 249) 35%, rgb(248, 248, 248) 100%)`,
          pt: 4
        }}
      >
        <Typography color="white">No pay run data found.</Typography>
      </Container>
    );
  }

  // Destructure payRun fields
  const {
    payRunName,
    startDate,
    endDate,
    notes,
    status,
    totalNetPay,
    needsRecalculation,
    entries = []
  } = payRun;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 35%, rgb(255, 255, 255) 100%)`,
        py: 4
      }}
    >
      <Container>
        <Grow in={true} timeout={800}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: 4,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Pay Run Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Basic Info */}
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {payRunName}
              </Typography>
              <Typography variant="body1">
                Date Range: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Status: <strong>{status}</strong>
              </Typography>
              <Typography variant="body1">
                Total Net Pay: <strong>{formatToTwoDecimals(totalNetPay)}</strong>
              </Typography>
              {notes && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Notes: {notes}
                </Typography>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {(status === 'Draft' || needsRecalculation) && (
                  <Tooltip title="Perform cosmic recalculations with rocket precision!">
                    <Button
                      variant="outlined"
                      startIcon={<RocketLaunchIcon />}
                      onClick={handleRecalc}
                      sx={{
                        position: 'relative',
                        '&:hover::after': {
                          content: '""',
                          position: 'absolute',
                          width: '4px',
                          height: '4px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          animation: 'shootingStar 1s ease-in-out',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        },
                        '@keyframes shootingStar': {
                          '0%': { opacity: 1, transform: 'translate(0,0)' },
                          '100%': { opacity: 0, transform: 'translate(-300px, -100px)' }
                        }
                      }}
                    >
                      Recalculate
                    </Button>
                  </Tooltip>
                )}
                {status === 'Draft' && (
                  <Tooltip title="Approve this pay run for warp-speed payroll!">
                    <Button variant="contained" onClick={handleApprove} startIcon={<DoneIcon />}>
                      Approve
                    </Button>
                  </Tooltip>
                )}
                {status === 'Approved' && (
                  <>
                    <Tooltip title="Revert to Draft if you need to fix cosmic misalignments.">
                      <Button
                        variant="outlined"
                        onClick={handleRevert}
                        startIcon={<UndoIcon />}
                      >
                        Revert to Draft
                      </Button>
                    </Tooltip>
                    <Tooltip title="All systems go: Mark this pay run as fully paid.">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleMarkPaid}
                        startIcon={<PaidIcon />}
                      >
                        Mark as Paid
                      </Button>
                    </Tooltip>
                  </>
                )}
              </Box>

              {/* Download CSV Button */}
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleDownloadCSV}>
                  Download CSV
                </Button>
              </Box>

              {/* Display success or error messages */}
              {message && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {message}
                </Alert>
              )}

              {/* Employee Entries Table */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Employee Entries
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Employee Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Payroll ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Net Wage (E23)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TransitionGroup component="tbody">
                      {entries.length > 0 ? (
                        entries.map((entry) => (
                          <Grow key={entry.employeeId} in appear timeout={600}>
                            <TableRow
                              sx={{
                                '&:hover': { backgroundColor: '#fafafa' },
                                transition: 'background 0.3s'
                              }}
                            >
                              <TableCell>{entry.employeeName}</TableCell>
                              <TableCell>{entry.payrollId || 'N/A'}</TableCell>
                              <TableCell>{formatToTwoDecimals(entry.netWage)}</TableCell>
                              <TableCell align="center">
                                <Button variant="outlined" onClick={() => handleViewDetails(entry)}>
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          </Grow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No employees found in this pay run.
                          </TableCell>
                        </TableRow>
                      )}
                    </TransitionGroup>
                  </Table>
                </TableContainer>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Container>

      {/* Modal for employee breakdown */}
      <EmployeePayRunModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeEntry={selectedEmployeeEntry}
      />
    </Box>
  );
}
