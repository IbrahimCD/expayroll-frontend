// frontend/src/pages/Timesheet/BatchCreateTimesheetTemplatePage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Box,
  CircularProgress
} from '@mui/material';
import api from '../../services/api';

export default function BatchCreateTimesheetTemplatePage() {
  const [timesheetName, setTimesheetName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch locations on mount
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

  // Utility: Calculate end date assuming a 7-day timesheet (start date + 6 days)
  const calculateEndDate = (startStr) => {
    const parts = startStr.split('/');
    if (parts.length !== 3) return startStr;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const start = new Date(year, month, day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const dd = String(end.getDate()).padStart(2, '0');
    const mm = String(end.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${end.getFullYear()}`;
  };

  // Utility: Convert JSON array to CSV string
  const convertToCSV = (data) => {
    const header = [
      'TimesheetName',
      'StartDate',
      'EndDate',
      'WorkLocation',
      'EmployeeName',
      'PayrollID',
      'BaseLocation',
      'HoursWorked',
      'DaysWorked',
      'ExtraShift',
      'Addition',
      'Deduction',
      'Notes'
    ];
    const rows = data.map(row => [
      row.timesheetName,
      row.startDate,
      row.endDate,
      row.workLocation,
      row.employeeName,
      row.payrollId,
      row.baseLocation,
      row.hoursWorked,
      row.daysWorked,
      row.extraShift,
      row.addition,
      row.deduction,
      row.notes
    ]);
    return [header, ...rows].map(e => e.join(",")).join("\n");
  };

  // Trigger CSV download
  const downloadCSV = (data) => {
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `timesheet_template_${timesheetName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler to generate the template
  const handleGenerateTemplate = async () => {
    if (!timesheetName || !startDate || !workLocation) {
      setError('Please fill in Timesheet Name, Start Date, and select a Work Location.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Call backend endpoint to fetch employees for the selected location.
      // We pass locationId as query parameter.
      const res = await api.get('/timesheets/template-employees', { params: { locationId: workLocation } });
      const employees = res.data.employees || [];
      // Compute end date based on start date (assume 7-day period)
      const endDate = calculateEndDate(startDate);
      // Build template rows (each row includes common form data and employee data)
      const templateRows = employees.map(emp => ({
        timesheetName,
        startDate,
        endDate,
        workLocation, // you may also include the location name if desired
        employeeName: emp.employeeName,
        payrollId: emp.payrollId,
        baseLocation: emp.baseLocation,
        hoursWorked: emp.hoursWorked,   // will be "N/A" or "0" based on pay structure from backend
        daysWorked: emp.daysWorked,
        extraShift: emp.extraShift,
        addition: emp.addition,
        deduction: emp.deduction,
        notes: emp.notes
      }));
      setTemplateData(templateRows);
      downloadCSV(templateRows);
    } catch (err) {
      console.error('Error generating template:', err);
      setError(err.response?.data?.message || 'Error generating template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Timesheet Batch Template Generator
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Timesheet Name"
            value={timesheetName}
            onChange={(e) => setTimesheetName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Start Date (DD/MM/YYYY)"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="location-select-label">Work Location</InputLabel>
            <Select
              labelId="location-select-label"
              label="Work Location"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
            >
              {locations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  {loc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleGenerateTemplate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Batch Template'}
          </Button>
        </Box>
        {templateData && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">
              Template generated with {templateData.length} employee rows.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              The CSV file has been downloaded. You can open it in your favorite editor to review or modify.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
