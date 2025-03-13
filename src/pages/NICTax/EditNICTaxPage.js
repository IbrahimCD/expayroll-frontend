// frontend/src/pages/NICTax/EditNICTaxPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Add, Delete } from '@mui/icons-material';
import api from '../../services/api';

export default function EditNICTaxPage() {
  const { nictaxId } = useParams();
  const navigate = useNavigate();

  const [recordName, setRecordName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [baseLocationId, setBaseLocationId] = useState('');
  const [status, setStatus] = useState('Draft');

  const [locations, setLocations] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');

  // 1) Fetch the NIC & Tax record
  const fetchNICTaxRecord = async () => {
    try {
      const res = await api.get(`/nictax/${nictaxId}`);
      const doc = res.data.nictax;
      setRecordName(doc.recordName);
      setStartDate(doc.startDate.split('T')[0]); // format date as YYYY-MM-DD
      setEndDate(doc.endDate.split('T')[0]);
      setDescription(doc.description || '');
      setBaseLocationId(doc.baseLocationId?._id || '');
      setStatus(doc.status || 'Draft');
      setEntries(doc.entries || []);
    } catch (err) {
      console.error('Error fetching NIC & Tax record:', err);
      setMessage(err.response?.data?.message || 'Failed to load NIC & Tax record');
    }
  };

  // 2) Fetch locations
  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  // 3) Fetch employees (we only show those whose baseLocationId matches the selected baseLocation)
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=9999'); 
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchNICTaxRecord();
    fetchLocations();
    fetchEmployees();
    // eslint-disable-next-line
  }, [nictaxId]);

  // If user changes startDate, optionally auto-calc endDate:
  useEffect(() => {
    if (startDate) {
      const sd = new Date(startDate);
      sd.setDate(sd.getDate() + 6);
      setEndDate(sd.toISOString().split('T')[0]);
    }
  }, [startDate]);

  // Filter employees to only those whose baseLocationId == baseLocationId
  const filteredEmployees = employees.filter(
    (emp) => emp.baseLocationId && emp.baseLocationId === baseLocationId
  );

  // For sub-entries table: create an empty row
  const createEmptyRow = () => ({
    employeeId: '',
    employeeName: '',
    erNIC: 0,
    eesNIC: 0,
    
    eesTax: 0,
    notes: ''
  });

  // Add an empty row
  const handleAddRow = () => {
    setEntries((prev) => [...prev, createEmptyRow()]);
  };

  // Remove a row
  const handleRemoveRow = (idx) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update a field in a row
  const handleEntryChange = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i === idx) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  // When user selects an employee, auto-fill employeeName
  const handleEmployeeSelect = (idx, employeeId) => {
    const emp = filteredEmployees.find((e) => e._id === employeeId);
    if (!emp) return;
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i === idx) {
          return {
            ...entry,
            employeeId: emp._id,
            employeeName: `${emp.firstName} ${emp.lastName}`
          };
        }
        return entry;
      })
    );
  };

  // Submit the updated record
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        recordName,
        startDate,
        endDate,
        description,
        baseLocationId,
        status,
        entries
      };
      const res = await api.put(`/nictax/${nictaxId}`, payload);
      setMessage(res.data.message || 'NIC & Tax record updated successfully');
      // navigate back or stay
      navigate(`/nictax/${nictaxId}`);
    } catch (err) {
      console.error('Error updating NIC & Tax record:', err);
      setMessage(err.response?.data?.message || 'Failed to update NIC & Tax record');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Edit NIC & TAX Record
          </Typography>
          {message && (
            <Typography color="error" sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}
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
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
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
                    {loc.name} ({loc.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
              </Select>
            </FormControl>

            {/* ENTRIES SUBTABLE */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">NIC/TAX Entries</Typography>
              <Table sx={{ mt: 2 }}>
                <TableBody>
                  <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>E'es NIC</strong></TableCell>
                    <TableCell><strong>E'er NIC</strong></TableCell>
                    <TableCell><strong>E'es Tax</strong></TableCell>
                    <TableCell><strong>Notes</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                  {entries.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel>Employee</InputLabel>
                          <Select
                            label="Employee"
                            value={entry.employeeId}
                            onChange={(e) => handleEmployeeSelect(idx, e.target.value)}
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
                          type="number"
                          value={entry.erNIC}
                          onChange={(e) => handleEntryChange(idx, 'erNIC', +e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={entry.eesNIC}
                          onChange={(e) => handleEntryChange(idx, 'eesNIC', +e.target.value)}
                          size="small"
                        />
                      </TableCell>
                     
                      <TableCell>
                        <TextField
                          type="number"
                          value={entry.eesTax}
                          onChange={(e) => handleEntryChange(idx, 'eesTax', +e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={entry.notes}
                          onChange={(e) => handleEntryChange(idx, 'notes', e.target.value)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleRemoveRow(idx)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>
              </Box>
            </Box>

            {/* SUBMIT BUTTON */}
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" type="submit">
                Update NIC & TAX Record
              </Button>
              <Button
                variant="text"
                sx={{ ml: 2 }}
                onClick={() => navigate(`/nictax/${nictaxId}`)}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
