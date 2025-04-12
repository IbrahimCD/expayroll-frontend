// src/pages/NICTax/CreateNICTaxPage.jsx
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
  TableBody,
  TableRow,
  TableCell,
  IconButton
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CreateNICTaxPage() {
  const navigate = useNavigate();

  // Basic record fields
  const [recordName, setRecordName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [baseLocationId, setBaseLocationId] = useState('');
  const [locations, setLocations] = useState([]);

  // NIC & Tax “entries” array
  const [entries, setEntries] = useState([]);
  // Full employee list
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState('');

  // 1) Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        setLocations(res.data || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // 2) Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Maybe fetch all employees
        const res = await api.get('/employees?limit=9999');
        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  // 3) Filter employees by base location
  const filteredEmployees = baseLocationId
    ? employees.filter(
        (emp) => emp.baseLocationId === baseLocationId && emp.status === 'Employed'
      )
    : [];

  // 4) Auto-calculate endDate if needed (e.g. +6 days from start)
  // (Optional if you want the same logic as Timesheet.)
  // useEffect(() => {
  //   if (startDate) {
  //     const date = new Date(startDate);
  //     date.setDate(date.getDate() + 6);
  //     setEndDate(date.toISOString().split('T')[0]);
  //   } else {
  //     setEndDate('');
  //   }
  // }, [startDate]);

  // 5) Create an empty row object
  const createEmptyRow = () => ({
    employeeId: '',
    erNIC: 0,
    eesNIC: 0,
    eesTax: 0,
    // maybe more fields if needed
  });

  // 6) Add a new row
  const handleAddRow = () => {
    setEntries((prev) => [...prev, createEmptyRow()]);
  };

  // 7) Remove a row
  const handleRemoveRow = (index) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // 8) Update a field in a row
  const handleEntryChange = (index, field, value) => {
    setEntries((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // 9) When user picks an employee, auto-fill if needed
  const handleSelectEmployee = (index, employeeId) => {
    setEntries((prev) =>
      prev.map((row, i) => (i === index ? { ...row, employeeId } : row))
    );
  };

  // 10) Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Build payload
    const payload = {
      recordName,
      startDate,
      endDate,
      baseLocationId,
      entries
    };

    try {
      const res = await api.post('/nictax', payload);
      setMessage(res.data.message);
      navigate('/nictax'); // go back to the list
    } catch (error) {
      console.error('Error creating NIC/Tax record:', error);
      setMessage(error.response?.data?.message || 'Failed to create NIC/Tax record.');
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Create NIC & TAX Record
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Record Name"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
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
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Base Location</InputLabel>
              <Select
                label="Base Location"
                value={baseLocationId}
                onChange={(e) => setBaseLocationId(e.target.value)}
              >
                {locations.map((loc) => (
                  <MenuItem key={loc._id} value={loc._id}>
                    {loc.name || loc.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 3 }}>
              NIC/TAX Entries
            </Typography>

            <Table sx={{ mt: 2 }}>
              <TableBody>
                {entries.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel>Employee</InputLabel>
                        <Select
                          label="Employee"
                          value={row.employeeId}
                          onChange={(e) => handleSelectEmployee(index, e.target.value)}
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
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="E'er NIC"
                        type="number"
                        value={row.erNIC}
                        onChange={(e) => handleEntryChange(index, 'erNIC', +e.target.value)}
                        variant="outlined"
                        size="small"
                        inputProps={{ onWheel: (e) => e.target.blur() }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="E'es NIC"
                        type="number"
                        value={row.eesNIC}
                        onChange={(e) => handleEntryChange(index, 'eesNIC', +e.target.value)}
                        variant="outlined"
                        size="small"
                        inputProps={{ onWheel: (e) => e.target.blur() }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="E'es Tax"
                        type="number"
                        value={row.eesTax}
                        onChange={(e) => handleEntryChange(index, 'eesTax', +e.target.value)}
                        variant="outlined"
                        size="small"
                        inputProps={{ onWheel: (e) => e.target.blur() }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleRemoveRow(index)}>
                        <Delete />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          // Insert new row below
                          const newRow = createEmptyRow();
                          setEntries((prev) => {
                            const updated = [...prev];
                            updated.splice(index + 1, 0, newRow);
                            return updated;
                          });
                        }}
                      >
                        <Add />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<Add />} onClick={handleAddRow}>
                Add Row
              </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" type="submit">
                SAVE NIC/TAX RECORD
              </Button>
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
  );
}
