// src/pages/Reports/EmployeeWageReportPage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  TextField
} from '@mui/material';
import api from '../../services/api';
import { jsPDF } from 'jspdf';

export default function EmployeeWageReportPage() {
  // Existing states
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // New filter states
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchName, setSearchName] = useState('');

  // Sorting states (if needed for filtering before export)
  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');

  // State for locations (for filtering)
  const [locations, setLocations] = useState([]);

  // New state for report format (csv or pdf)
  const [reportFormat, setReportFormat] = useState('csv');

  // Fetch available pay runs to populate the pay run dropdown
  useEffect(() => {
    const fetchPayRuns = async () => {
      try {
        const res = await api.get('/payruns', { params: { limit: 100 } });
        setPayRuns(res.data.data || []);
      } catch (err) {
        console.error('Error fetching pay runs:', err);
      }
    };
    fetchPayRuns();
  }, []);

  // Fetch locations (to populate the base location filter)
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

  // Export function for PDF
  const exportPDF = (data) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Employee Wage Report", 20, 20);
    let y = 30;
    data.forEach((row) => {
      doc.setFontSize(12);
      const line = `${row.firstName} ${row.lastName} | ${row.payrollId} | ${row.baseLocation} | NI Day Wage: ${Number(row.niDayWage).toFixed(2)} | NI Regular Day Rate: ${Number(row.niRegularDayRate).toFixed(2)} | NI Hours Used: ${Number(row.niHoursUsed).toFixed(2)} | NI Hours Rate: ${Number(row.niHoursRate).toFixed(2)} | Net NI Wage: ${Number(row.netNIWage).toFixed(2)} | Net Cash Wage: ${Number(row.netCashWage).toFixed(2)}`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("EmployeeWageReport.pdf");
  };

  // Export function for CSV
  const exportCSV = (data) => {
    let csvContent =
      "First Name,Last Name,Payroll ID,Base Location,NI Day Wage,NI Regular Day Rate,NI Hours Used,NI Hours Rate,Net NI Wage,Net Cash Wage\n";
    data.forEach((row) => {
      csvContent += `"${row.firstName}","${row.lastName}","${row.payrollId}","${row.baseLocation}",${Number(row.niDayWage).toFixed(2)},${Number(row.niRegularDayRate).toFixed(2)},${Number(row.niHoursUsed).toFixed(2)},${Number(row.niHoursRate).toFixed(2)},${Number(row.netNIWage).toFixed(2)},${Number(row.netCashWage).toFixed(2)}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'EmployeeWageReport.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate report and immediately trigger download
  const handleGenerateReport = async () => {
    if (!selectedPayRun) {
      setMessage('Please select a pay run.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/employee-wage-report', { params: { payRunId: selectedPayRun } });
      let report = res.data.report || [];

      // Apply filtering by base location if any selected
      if (selectedLocations.length > 0) {
        report = report.filter((row) => selectedLocations.includes(row.baseLocation));
      }
      // Apply search filter for name
      if (searchName.trim() !== '') {
        const lowerSearch = searchName.toLowerCase();
        report = report.filter(
          (row) =>
            row.firstName.toLowerCase().includes(lowerSearch) ||
            row.lastName.toLowerCase().includes(lowerSearch)
        );
      }
      // Apply sorting if a sort column is selected
      if (orderBy) {
        report.sort((a, b) => {
          const aValue = a[orderBy];
          const bValue = b[orderBy];
          if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Immediately trigger the download based on selected format
      if (reportFormat === 'csv') {
        exportCSV(report);
      } else if (reportFormat === 'pdf') {
        exportPDF(report);
      }
      setMessage('Report generated and download initiated.');
    } catch (err) {
      console.error('Error generating report:', err);
      setMessage(err.response?.data?.message || 'Error generating report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employee Wage Report
      </Typography>

      {/* Controls for generating report */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="payrun-select-label">Select Pay Run</InputLabel>
          <Select
            labelId="payrun-select-label"
            value={selectedPayRun}
            label="Select Pay Run"
            onChange={(e) => setSelectedPayRun(e.target.value)}
          >
            {payRuns.map((pr) => (
              <MenuItem key={pr._id} value={pr._id}>
                {pr.payRunName} ({new Date(pr.startDate).toLocaleDateString()} - {new Date(pr.endDate).toLocaleDateString()})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Report Format Selection */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="report-format-label">Report Format</InputLabel>
          <Select
            labelId="report-format-label"
            value={reportFormat}
            label="Report Format"
            onChange={(e) => setReportFormat(e.target.value)}
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
          </Select>
        </FormControl>

        {/* Optional Filters */}
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="base-location-filter-label">Filter by Base Location</InputLabel>
          <Select
            labelId="base-location-filter-label"
            multiple
            value={selectedLocations}
            label="Filter by Base Location"
            onChange={(e) => setSelectedLocations(e.target.value)}
          >
            {locations.map((loc) => (
              <MenuItem key={loc._id} value={loc.name}>
                {loc.name} ({loc.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Search by Name"
          variant="outlined"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate and Download Report'}
        </Button>
      </Box>

      {message && <Typography color="primary">{message}</Typography>}
    </Container>
  );
}
