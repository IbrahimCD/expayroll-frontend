// src/pages/Employee/TimesheetDetailsPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button
} from '@mui/material';
import { keyframes } from '@mui/system';
import { TransitionGroup } from 'react-transition-group';
import Fade from '@mui/material/Fade';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

// Define keyframes for a fade-in and slide-up animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function TimesheetDetailsPage() {
  const { timesheetId } = useParams();
  const [timesheet, setTimesheet] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [error, setError] = useState('');

  // Fetch the timesheet details
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const res = await api.get(`/timesheets/${timesheetId}`);
        setTimesheet(res.data.timesheet);
      } catch (err) {
        console.error('Error fetching timesheet details:', err);
        setError('Error fetching timesheet details');
      }
    };
    fetchTimesheet();
  }, [timesheetId]);

  // Once the timesheet is fetched, use its locationId to fetch the location name
  useEffect(() => {
    const fetchLocation = async () => {
      if (timesheet && timesheet.locationId) {
        try {
          const res = await api.get(`/locations/${timesheet.locationId}`);
          // Adjust if your backend returns the location name under a different property
          setLocationName(
            res.data.name || res.data.locationName || 'Unknown Location'
          );
        } catch (err) {
          console.error('Error fetching location details:', err);
          setLocationName('Unknown Location');
        }
      }
    };
    fetchLocation();
  }, [timesheet]);

  // Calculate summary totals
  const totalHours = timesheet?.entries?.reduce(
    (sum, e) => sum + (e.hoursWorked || 0),
    0
  );
  const totalDays = timesheet?.entries?.reduce(
    (sum, e) => sum + (e.daysWorked || 0),
    0
  );

  // Download CSV of entries (example advanced feature)
  const handleDownloadCSV = () => {
    if (!timesheet || !timesheet.entries) return;

    // Build CSV data
    const headers = [
      'EmployeeName',
      'HoursWorked',
      'DaysWorked',
      'ExtraShiftWorked',
      'OtherCashAddition',
      'OtherCashDeduction',
      'Notes'
    ];
    // Convert each entry into a CSV row
    const rows = timesheet.entries.map((entry) => [
      entry.employeeName || '',
      entry.hoursWorked || 0,
      entry.daysWorked || 0,
      entry.extraShiftWorked || 0,
      entry.otherCashAddition || 0,
      entry.otherCashDeduction || 0,
      entry.notes ? `"${entry.notes.replace(/"/g, '""')}"` : ''
    ]);

    // Convert to CSV string
    let csvContent = headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${timesheet.timesheetName.replace(/ /g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!timesheet) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading timesheet details...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card
        sx={{
          animation: `${fadeInUp} 0.8s ease-out`,
          backgroundColor: '#ffffff',
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {timesheet.timesheetName}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Period:</strong>{' '}
            {new Date(timesheet.startDate).toLocaleDateString()} -{' '}
            {new Date(timesheet.endDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Location:</strong> {locationName}
          </Typography>

          {/* Export CSV button */}
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={handleDownloadCSV}>
              Export Entries to CSV
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Entries
          </Typography>

          {(!timesheet.entries || timesheet.entries.length === 0) && (
            <Typography>No entries found.</Typography>
          )}

          {timesheet.entries && timesheet.entries.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: '#fff',
                boxShadow: 2,
                borderRadius: 1,
                maxHeight: 500
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Hours Worked</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Days Worked</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Extra Shift</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Addition</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Deduction</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                  </TableRow>
                </TableHead>

                <TransitionGroup component={TableBody}>
                  {timesheet.entries.map((entry, idx) => (
                    <Fade key={idx} timeout={600} in appear>
                      <TableRow
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f7f7f7'
                          }
                        }}
                      >
                        <TableCell>{entry.employeeName || 'N/A'}</TableCell>
                        <TableCell
                          style={
                            entry.hoursWorked && entry.hoursWorked !== 0
                              ? { backgroundColor: '#e0f7fa', fontWeight: 'bold' }
                              : {}
                          }
                        >
                          {entry.hoursWorked || 0}
                        </TableCell>
                        <TableCell
                          style={
                            entry.daysWorked && entry.daysWorked !== 0
                              ? { backgroundColor: '#e8f5e9', fontWeight: 'bold' }
                              : {}
                          }
                        >
                          {entry.daysWorked || 0}
                        </TableCell>
                        <TableCell
                          style={
                            entry.extraShiftWorked && entry.extraShiftWorked !== 0
                              ? { backgroundColor: '#ffe0b2', fontWeight: 'bold' }
                              : {}
                          }
                        >
                          {entry.extraShiftWorked || 0}
                        </TableCell>
                        <TableCell
                          style={
                            entry.otherCashAddition &&
                            entry.otherCashAddition !== 0
                              ? { backgroundColor: '#c8e6c9', fontWeight: 'bold' }
                              : {}
                          }
                        >
                          {entry.otherCashAddition || 0}
                        </TableCell>
                        <TableCell
                          style={
                            entry.otherCashDeduction &&
                            entry.otherCashDeduction !== 0
                              ? { backgroundColor: '#ffcdd2', fontWeight: 'bold' }
                              : {}
                          }
                        >
                          {entry.otherCashDeduction || 0}
                        </TableCell>
                        <TableCell
                          style={
                            entry.notes && entry.notes.trim().length > 0
                              ? { backgroundColor: '#fff9c4', fontWeight: 'bold' }
                              : {}
                          }
                        >
                          {entry.notes && entry.notes.trim().length > 0
                            ? entry.notes
                            : '—'}
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}

                  <Fade timeout={600} in appear>
                    <TableRow sx={{ backgroundColor: '#fafafa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Totals:</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {totalHours}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {totalDays}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {timesheet.entries.reduce(
                          (sum, e) => sum + (e.extraShiftWorked || 0),
                          0
                        )}
                      </TableCell>
                      <TableCell colSpan={4}></TableCell>
                    </TableRow>
                  </Fade>
                </TransitionGroup>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
