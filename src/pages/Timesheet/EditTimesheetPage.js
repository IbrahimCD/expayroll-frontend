// src/pages/Timesheet/EditTimesheetPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function EditTimesheetPage() {
  const { timesheetId } = useParams();
  const navigate = useNavigate();

  // Timesheet Header States
  const [timesheetName, setTimesheetName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState([]);

  // Timesheet Entries
  const [entries, setEntries] = useState([]);

  // Employee list for the dropdown
  const [employees, setEmployees] = useState([]);

  const [message, setMessage] = useState('');

  // =============== Fetch Locations ===============
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

  // =============== Fetch All Employees (large limit) ===============
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Use a large limit to ensure we get all employees
        const res = await api.get('/employees', { params: { limit: 10000 } });
        setEmployees(res.data.employees || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // =============== Fetch Timesheet and Populate Form ===============
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const res = await api.get(`/timesheets/${timesheetId}`);
        const ts = res.data.timesheet;
        setTimesheetName(ts.timesheetName);
        setStartDate(new Date(ts.startDate).toISOString().split('T')[0]);
        setEndDate(new Date(ts.endDate).toISOString().split('T')[0]);
        setLocationId(ts.locationId);

        // Enhance each entry with pay structure info and location name if needed
        const updatedEntries = await Promise.all(
          (ts.entries || []).map(async (entry) => {
            const newEntry = { ...entry };

            // If we have an employeeId, fetch that employee to get pay structure
            if (newEntry.employeeId) {
              try {
                const empRes = await api.get(`/employees/${newEntry.employeeId}`);
                const empData = empRes.data.employee || {};
                newEntry.hasDailyRates = empData.payStructure?.hasDailyRates || false;
                newEntry.hasHourlyRates = empData.payStructure?.hasHourlyRates || false;
                // Also include employeeName if not already set
                if (!newEntry.employeeName) {
                  newEntry.employeeName = `${empData.firstName} ${empData.lastName}`;
                }
              } catch (empErr) {
                console.error('Error fetching employee data:', empErr);
              }
            }

            // If baseLocation looks like an ObjectId, fetch the location name
            if (
              newEntry.baseLocation &&
              /^[a-fA-F0-9]{24}$/.test(newEntry.baseLocation)
            ) {
              try {
                const locRes = await api.get(`/locations/${newEntry.baseLocation}`);
                const locData = locRes.data;
                newEntry.baseLocation = locData?.name || newEntry.baseLocation;
              } catch (locErr) {
                console.error('Error fetching location name:', locErr);
              }
            }
            return newEntry;
          })
        );

        setEntries(updatedEntries);
      } catch (error) {
        console.error('Error fetching timesheet:', error);
      }
    };
    fetchTimesheet();
  }, [timesheetId]);

  // =============== Auto-calc endDate (1 week) if startDate changes ===============
  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + 6);
      setEndDate(date.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  }, [startDate]);

  // =============== Create an empty entry object ===============
  const createEmptyRow = () => ({
    employeeId: '',
    employeeName: '', // new field for employee name
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

  // =============== Add a new empty row to the entries array ===============
  const addEntry = () => {
    setEntries((prev) => [...prev, createEmptyRow()]);
  };

  // =============== Insert a new row after a specific index ===============
  const handleInsertRowAfter = (index) => {
    setEntries((prev) => {
      const newEntries = [...prev];
      newEntries.splice(index + 1, 0, createEmptyRow());
      return newEntries;
    });
  };

  // =============== Remove a row from the entries array ===============
  const handleRemoveRow = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // =============== Update a specific field in a specific row ===============
  const handleEntryChange = (index, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  // =============== Filter employees by location, or show all if no location selected ===============
  const filteredEmployees = locationId
    ? employees.filter(
        (emp) =>
          emp.status === 'Employed' &&
          emp.locationAccess &&
          emp.locationAccess.includes(locationId)
      )
    : employees;

  // =============== When an employee is selected, auto-fill payrollId, baseLocation, pay structure, and employeeName ===============
  const handleEmployeeSelect = async (index, selectedEmployeeId) => {
    const emp = filteredEmployees.find((e) => e._id === selectedEmployeeId);
    if (!emp) return;

    let fetchedBaseLocation = '';
    // If employee has a baseLocationId, fetch the location name
    if (emp.baseLocationId) {
      try {
        const res = await api.get(`/locations/${emp.baseLocationId}`);
        fetchedBaseLocation = res.data?.name || '';
      } catch (error) {
        console.error('Error fetching base location:', error);
      }
    }

    const hasDailyRates = emp.payStructure?.hasDailyRates || false;
    const hasHourlyRates = emp.payStructure?.hasHourlyRates || false;

    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i === index) {
          return {
            ...entry,
            employeeId: selectedEmployeeId,
            employeeName: `${emp.firstName} ${emp.lastName}`, // Added employeeName field
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

  // =============== Submit: update the timesheet via PUT ===============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { timesheetName, startDate, endDate, locationId, entries };
      const res = await api.put(`/timesheets/${timesheetId}`, payload);
      setMessage(res.data.message);
      navigate('/timesheets');
    } catch (error) {
      console.error('Error updating timesheet:', error);
      setMessage(error.response?.data?.message || 'Failed to update timesheet.');
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Edit Timesheet
        </Typography>
        <Card sx={{ p: 2, backgroundColor: '#fff' }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Timesheet Header Inputs */}
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
              {/* End Date is auto-calculated and disabled */}
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
                          <TableCell colSpan={7} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Employee Info
                            </Typography>
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                              <FormControl sx={{ minWidth: 150 }} required>
                                <InputLabel>Select Employee</InputLabel>
                                <Select
                                  label="Select Employee"
                                  value={entry.employeeId}
                                  onChange={(e) => handleEmployeeSelect(index, e.target.value)}
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

                        {/* Row #3: Numeric fields */}
                        <TableRow
                          sx={{
                            transition: 'transform 0.3s ease',
                            ':hover': { transform: 'scale(1.01)' }
                          }}
                        >
                          <TableCell>
                            {entry.hasHourlyRates ? (
                              <TextField
                                type="number"
                                value={entry.hoursWorked}
                                onChange={(e) => handleEntryChange(index, 'hoursWorked', +e.target.value)}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              <TextField value="N/A" disabled variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.hasDailyRates ? (
                              <TextField
                                type="number"
                                value={entry.daysWorked}
                                onChange={(e) => handleEntryChange(index, 'daysWorked', +e.target.value)}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              <TextField value="N/A" disabled variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.hasDailyRates ? (
                              <TextField
                                type="number"
                                value={entry.extraShiftWorked}
                                onChange={(e) => handleEntryChange(index, 'extraShiftWorked', +e.target.value)}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              <TextField value="N/A" disabled variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={entry.otherCashAddition}
                              onChange={(e) => handleEntryChange(index, 'otherCashAddition', +e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={entry.otherCashDeduction}
                              onChange={(e) => handleEntryChange(index, 'otherCashDeduction', +e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={entry.notes}
                              onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveRow(index)}
                              sx={{ mr: 1 }}
                            >
                              <Delete />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handleInsertRowAfter(index)}
                            >
                              <Add />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>

                {/* Add New Row Button */}
                <Box mt={2} display="flex" gap={2}>
                  <Zoom in={true} timeout={500}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={addEntry}
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
                    Update Timesheet
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
