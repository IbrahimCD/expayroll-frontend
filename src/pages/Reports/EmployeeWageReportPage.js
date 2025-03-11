// src/pages/Reports/EmployeeWageReportPage.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  TableSortLabel,
  TextField
} from '@mui/material';
import api from '../../services/api';
import { jsPDF } from 'jspdf';

export default function EmployeeWageReportPage() {
  // Existing states
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // New filter states
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [searchName, setSearchName] = useState('');

  // Sorting states
  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');

  // State for locations (for filtering)
  const [locations, setLocations] = useState([]);

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

  // Handle report generation (existing behavior)
  const handleGenerateReport = async () => {
    if (!selectedPayRun) {
      setMessage('Please select a pay run.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // You can pass additional filter parameters if your backend supports them.
      const res = await api.get('/employee-wage-report', { params: { payRunId: selectedPayRun } });
      setReportData(res.data.report || []);
    } catch (err) {
      console.error('Error generating report:', err);
      setMessage(err.response?.data?.message || 'Error generating report.');
    } finally {
      setLoading(false);
    }
  };

  // Use useMemo to compute the filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let data = [...reportData];

    // Filter by base location if any are selected
    if (selectedLocations.length > 0) {
      data = data.filter((row) => selectedLocations.includes(row.baseLocation));
    }
    // Filter by searchName (search in firstName and lastName)
    if (searchName.trim() !== '') {
      const lowerSearch = searchName.toLowerCase();
      data = data.filter(
        (row) =>
          row.firstName.toLowerCase().includes(lowerSearch) ||
          row.lastName.toLowerCase().includes(lowerSearch)
      );
    }
    // Sort data if a sort column is selected
    if (orderBy) {
      data.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [reportData, selectedLocations, searchName, orderBy, orderDirection]);

  // Handle sorting when a column header is clicked
  const handleSortRequest = (column) => {
    const isAsc = orderBy === column && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(column);
  };

  // Export functions (unchanged)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Employee Wage Report", 20, 20);
    let y = 30;
    filteredAndSortedData.forEach((row, index) => {
      doc.setFontSize(12);
      const line = `${row.firstName} ${row.lastName} | ${row.payrollId} | ${row.baseLocation} | NI Day Wage: ${row.niDayWage} | NI Regular Day Rate: ${row.niRegularDayRate} | NI Hours Used: ${row.niHoursUsed} | NI Hours Rate: ${row.niHoursRate} | Net NI Wage: ${row.netNIWage} | Net Cash Wage: ${row.netCashWage}`;
      doc.text(line, 10, y);
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("EmployeeWageReport.pdf");
  };

  const handleExportCSV = () => {
    if (!filteredAndSortedData.length) return;
    let csvContent = "First Name,Last Name,Payroll ID,Base Location,NI Day Wage,NI Regular Day Rate,NI Hours Used,NI Hours Rate,Net NI Wage,Net Cash Wage\n";
    filteredAndSortedData.forEach((row) => {
      csvContent += `"${row.firstName}","${row.lastName}","${row.payrollId}","${row.baseLocation}",${row.niDayWage},${row.niRegularDayRate},${row.niHoursUsed},${row.niHoursRate},${row.netNIWage},${row.netCashWage}\n`;
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

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employee Wage Report
      </Typography>

      {/* Pay Run Selection & Report Generation */}
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
        <Button variant="contained" onClick={handleGenerateReport}>
          {loading ? <CircularProgress size={24} /> : 'Generate Report'}
        </Button>
      </Box>

      {/* New Filters: Multi-select for Base Location & Search by Name */}
      {reportData.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
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
        </Box>
      )}

      {message && <Typography color="error">{message}</Typography>}

      {/* Report Table with Sorting */}
      {reportData.length > 0 && (
        <>
          <Paper sx={{ mt: 2, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'firstName'}
                      direction={orderBy === 'firstName' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('firstName')}
                    >
                      First Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'lastName'}
                      direction={orderBy === 'lastName' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('lastName')}
                    >
                      Last Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'payrollId'}
                      direction={orderBy === 'payrollId' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('payrollId')}
                    >
                      Payroll ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'baseLocation'}
                      direction={orderBy === 'baseLocation' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('baseLocation')}
                    >
                      Base Location
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'niDayWage'}
                      direction={orderBy === 'niDayWage' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('niDayWage')}
                    >
                      NI Day Wage
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'niRegularDayRate'}
                      direction={orderBy === 'niRegularDayRate' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('niRegularDayRate')}
                    >
                      NI Regular Day Rate
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'niHoursUsed'}
                      direction={orderBy === 'niHoursUsed' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('niHoursUsed')}
                    >
                      NI Hours Used
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'niHoursRate'}
                      direction={orderBy === 'niHoursRate' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('niHoursRate')}
                    >
                      NI Hours Rate
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'netNIWage'}
                      direction={orderBy === 'netNIWage' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('netNIWage')}
                    >
                      Net NI Wage
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'netCashWage'}
                      direction={orderBy === 'netCashWage' ? orderDirection : 'asc'}
                      onClick={() => handleSortRequest('netCashWage')}
                    >
                      Net Cash Wage
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell>{row.lastName}</TableCell>
                    <TableCell>{row.payrollId}</TableCell>
                    <TableCell>{row.baseLocation}</TableCell>
                    <TableCell>{row.niDayWage}</TableCell>
                    <TableCell>{row.niRegularDayRate}</TableCell>
                    <TableCell>{row.niHoursUsed}</TableCell>
                    <TableCell>{row.niHoursRate}</TableCell>
                    <TableCell>{row.netNIWage}</TableCell>
                    <TableCell>{row.netCashWage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleExportPDF}>
              Export as PDF
            </Button>
            <Button variant="outlined" onClick={handleExportCSV}>
              Export as CSV
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
