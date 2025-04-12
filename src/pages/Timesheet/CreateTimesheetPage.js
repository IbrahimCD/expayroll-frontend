// frontend/src/pages/Timesheet/CreateTimesheetPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Table,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Define MenuProps to make dropdown scrollable
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, // approx 216px
      width: 250,
    },
  },
};

export default function CreateTimesheetPage() {
  const navigate = useNavigate();
  
  // Timesheet Headings
  const [timesheetName, setTimesheetName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState([]);

  // Timesheet entries
  const [entries, setEntries] = useState([]);
  // Full employee list fetched from backend
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        setLocations(res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, []);

  // Fetch employees (fetch all by setting a high limit)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Use a high limit to fetch all employees
        const res = await api.get('/employees?limit=1000000');
        // We fetch all employees then filter them in the component
        setEmployees(res.data.employees || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Auto-calculate endDate (1 week period) when startDate changes
  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + 6);
      setEndDate(date.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  }, [startDate]);

  // Filter employees based on selected location and "Employed" status.
  const filteredEmployees = locationId
    ? employees.filter(
        (emp) =>
          emp.status === 'Employed' &&
          emp.locationAccess &&
          emp.locationAccess.includes(locationId)
      )
    : [];

  // Handle adding a new (empty) row to the entries table
  const handleAddRow = () => {
    setEntries((prev) => [...prev, createEmptyRow()]);
  };

  // Handle adding multiple new rows (e.g. 5 at once)
  const handleAddMultipleRows = (count) => {
    const newRows = [];
    for (let i = 0; i < count; i++) {
      newRows.push(createEmptyRow());
    }
    setEntries((prev) => [...prev, ...newRows]);
  };

  // Create an empty row object – NIC/Tax fields removed!
  const createEmptyRow = () => ({
    employeeId: '',
    payrollId: '',
    baseLocation: '',
    hoursWorked: 0,
    daysWorked: 0,
    extraShiftWorked: 0,
    otherCashAddition: 0,
    otherCashDeduction: 0,
    notes: '',
    hasDailyRates: false,
    hasHourlyRates: false
  });

  // Insert a new row immediately after a specific index
  const handleInsertRowAfter = (index) => {
    setEntries((prev) => {
      const newEntries = [...prev];
      newEntries.splice(index + 1, 0, createEmptyRow());
      return newEntries;
    });
  };

  // Handle removing a row
  const handleRemoveRow = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a specific field in a specific row
  const handleEntryChange = (index, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i === index) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  // When an employee is selected, auto-fill payrollId and baseLocation
  const handleEmployeeSelect = async (index, selectedEmployeeId) => {
    const emp = filteredEmployees.find((e) => e._id === selectedEmployeeId);
    if (!emp) return;

    // Fetch base location from backend if needed
    let fetchedBaseLocation = '';
    if (emp.baseLocationId) {
      try {
        const res = await api.get(`/locations/${emp.baseLocationId}`);
        fetchedBaseLocation = res.data?.name || '';
      } catch (error) {
        console.error('Error fetching base location:', error);
      }
    }

    // Determine pay structure flags from employee.payStructure
    const hasDailyRates = emp.payStructure?.hasDailyRates || false;
    const hasHourlyRates = emp.payStructure?.hasHourlyRates || false;

    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i === index) {
          return {
            ...entry,
            employeeId: selectedEmployeeId,
            payrollId: emp.payrollId || '',
            baseLocation: fetchedBaseLocation,
            hasDailyRates,
            hasHourlyRates
          };
        }
        return entry;
      })
    );
  };

  // On form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Build the final payload
    const payload = {
      timesheetName,
      startDate,
      endDate,
      locationId,
      entries
    };

    try {
      const res = await api.post('/timesheets', payload);
      setMessage(res.data.message);
      navigate('/timesheets');
    } catch (error) {
      console.error('Error creating timesheet:', error);
      setMessage(error.response?.data?.message || 'Failed to create timesheet.');
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, fontFamily: "'Merriweather', serif" }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Create Timesheet
        </Typography>
        <Card sx={{ p: 2, backgroundColor: '#fff' }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Timesheet Heading Inputs */}
              <TextField
                label="Timesheet Name"
                value={timesheetName}
                onChange={(e) => setTimesheetName(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Work Location</InputLabel>
                <Select
                  label="Work Location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      {loc.name} ({loc.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Timesheet Entries Table */}
              <Box mt={2}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  Timesheet Entries
                </Typography>
                <Table sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <React.Fragment key={index}>
                        {/* Row #1: Employee Info */}
                        <TableRow
                          sx={{
                            backgroundColor: '#fafafa',
                            transition: 'transform 0.3s ease',
                            ':hover': { transform: 'scale(1.01)' }
                          }}
                        >
                          <TableCell colSpan={10} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Employee Info
                            </Typography>
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                              <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>Select Employee</InputLabel>
                                <Select
                                  label="Select Employee"
                                  value={entry.employeeId}
                                  onChange={(e) => handleEmployeeSelect(index, e.target.value)}
                                  MenuProps={MenuProps}
                                >
                                  <MenuItem value="">
                                    <em>Select Employee</em>
                                  </MenuItem>
                                  {filteredEmployees.map((emp) => (
                                    <MenuItem key={emp._id} value={emp._id}>
                                      {emp.firstName} {emp.lastName}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <TextField
                                label="Payroll ID"
                                value={entry.payrollId}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                                size="small"
                              />
                              <TextField
                                label="Base Location"
                                value={entry.baseLocation}
                                InputProps={{ readOnly: true }}
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </TableCell>
                        </TableRow>

                        {/* Row #2: Subheader for numeric fields */}
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                          <TableCell><strong>Hours Worked</strong></TableCell>
                          <TableCell><strong>Days Worked</strong></TableCell>
                          <TableCell><strong>Extra Shift</strong></TableCell>
                          <TableCell><strong>Addition</strong></TableCell>
                          <TableCell><strong>Deduction</strong></TableCell>
                          <TableCell><strong>Notes</strong></TableCell>
                          <TableCell><strong>Action</strong></TableCell>
                        </TableRow>

                        {/* Row #3: Actual numeric fields */}
                        <TableRow sx={{ transition: 'transform 0.3s ease', ':hover': { transform: 'scale(1.01)' } }}>
                          {/* Hours Worked */}
                          <TableCell>
                            {entry.hasHourlyRates ? (
                              <TextField
                                type="number"
                                value={entry.hoursWorked}
                                onChange={(e) => handleEntryChange(index, 'hoursWorked', +e.target.value)}
                                variant="outlined"
                                size="small"
                                inputProps={{ onWheel: (e) => e.target.blur() }}
                              />
                            ) : (
                              <TextField value="N/A" disabled variant="outlined" size="small" />
                            )}
                          </TableCell>
                          {/* Days Worked */}
                          <TableCell>
                            {entry.hasDailyRates ? (
                              <TextField
                                type="number"
                                value={entry.daysWorked}
                                onChange={(e) => handleEntryChange(index, 'daysWorked', +e.target.value)}
                                variant="outlined"
                                size="small"
                                inputProps={{ onWheel: (e) => e.target.blur() }}
                              />
                            ) : (
                              <TextField value="N/A" disabled variant="outlined" size="small" />
                            )}
                          </TableCell>
                          {/* Extra Shift Worked */}
                          <TableCell>
                            {entry.hasDailyRates ? (
                              <TextField
                                type="number"
                                value={entry.extraShiftWorked}
                                onChange={(e) => handleEntryChange(index, 'extraShiftWorked', +e.target.value)}
                                variant="outlined"
                                size="small"
                                inputProps={{ onWheel: (e) => e.target.blur() }}
                              />
                            ) : (
                              <TextField value="N/A" disabled variant="outlined" size="small" />
                            )}
                          </TableCell>
                          {/* Other Cash Addition */}
                          <TableCell>
                            <TextField
                              type="number"
                              value={entry.otherCashAddition}
                              onChange={(e) => handleEntryChange(index, 'otherCashAddition', +e.target.value)}
                              variant="outlined"
                              size="small"
                              inputProps={{ onWheel: (e) => e.target.blur() }}
                            />
                          </TableCell>
                          {/* Other Cash Deduction */}
                          <TableCell>
                            <TextField
                              type="number"
                              value={entry.otherCashDeduction}
                              onChange={(e) => handleEntryChange(index, 'otherCashDeduction', +e.target.value)}
                              variant="outlined"
                              size="small"
                              inputProps={{ onWheel: (e) => e.target.blur() }}
                            />
                          </TableCell>
                          {/* Notes */}
                          <TableCell>
                            <TextField
                              value={entry.notes}
                              onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          {/* Action Buttons */}
                          <TableCell>
                            <IconButton color="error" onClick={() => handleRemoveRow(index)} sx={{ mr: 1 }}>
                              <Delete />
                            </IconButton>
                            <IconButton color="primary" onClick={() => handleInsertRowAfter(index)}>
                              <Add />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>

                {/* Add New Row Buttons */}
                <Box mt={2} display="flex" gap={2}>
                  <Zoom in={true} timeout={500}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={handleAddRow}
                      sx={{
                        fontWeight: 'bold',
                        borderColor: '#c1a266',
                        color: '#c1a266',
                        ':hover': { backgroundColor: '#f6f2e9', borderColor: '#ae8e55' }
                      }}
                    >
                      Add Employee Row
                    </Button>
                  </Zoom>

                  <Zoom in={true} timeout={500}>
                    <Button
                      variant="outlined"
                      onClick={() => handleAddMultipleRows(5)}
                      sx={{
                        fontWeight: 'bold',
                        borderColor: '#c1a266',
                        color: '#c1a266',
                        ':hover': { backgroundColor: '#f6f2e9', borderColor: '#ae8e55' }
                      }}
                    >
                      Add 5 Employee Rows
                    </Button>
                  </Zoom>
                </Box>
              </Box>

              {/* Submit Button */}
              <Box sx={{ mt: 3 }}>
                <Zoom in={true} timeout={500}>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{
                      bgcolor: '#c1a266',
                      fontWeight: 'bold',
                      ':hover': { bgcolor: '#ae8e55' }
                    }}
                  >
                    Save Timesheet
                  </Button>
                </Zoom>
              </Box>
            </form>
            {message && (
              <Typography sx={{ mt: 2, color: 'green' }}>
                {message}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Fade>
  );
}
