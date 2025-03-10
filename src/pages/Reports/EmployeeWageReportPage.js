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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress
} from '@mui/material';
import api from '../../services/api';
import { jsPDF } from 'jspdf';

export default function EmployeeWageReportPage() {
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch available pay runs to populate the dropdown.
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

  const handleGenerateReport = async () => {
    if (!selectedPayRun) {
      setMessage('Please select a pay run.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('/employee-wage-report', { params: { payRunId: selectedPayRun } });
      setReportData(res.data.report);
    } catch (err) {
      console.error('Error generating report:', err);
      setMessage('Error generating report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Employee Wage Report", 20, 20);
    let y = 30;
    reportData.forEach((row, index) => {
      doc.setFontSize(12);
      doc.text(
        `${row.firstName} ${row.lastName} | ${row.payrollId} | ${row.baseLocation} | NI Day Wage: ${row.niDayWage} | NI Regular Day Rate: ${row.niRegularDayRate} | NI Hours Used: ${row.niHoursUsed} | NI Hours Rate: ${row.niHoursRate} | Net NI Wage: ${row.netNIWage} | Net Cash Wage: ${row.netCashWage}`,
        10,
        y
      );
      y += 10;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("EmployeeWageReport.pdf");
  };

  // New CSV Export Function
  const handleExportCSV = () => {
    if (!reportData.length) return;

    // Build CSV header row
    let csvContent = "First Name,Last Name,Payroll ID,Base Location,NI Day Wage,NI Regular Day Rate,NI Hours Used,NI Hours Rate,Net NI Wage,Net Cash Wage\n";
    
    // Append data rows
    reportData.forEach((row) => {
      csvContent += `"${row.firstName}","${row.lastName}","${row.payrollId}","${row.baseLocation}",${row.niDayWage},${row.niRegularDayRate},${row.niHoursUsed},${row.niHoursRate},${row.netNIWage},${row.netCashWage}\n`;
    });

    // Create and trigger CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
          Generate Report
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>
      {message && <Typography color="error">{message}</Typography>}
      {reportData.length > 0 && (
        <>
          <Paper sx={{ mt: 2, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Payroll ID</TableCell>
                  <TableCell>Base Location</TableCell>
                  <TableCell>NI Day Wage</TableCell>
                  <TableCell>NI Regular Day Rate</TableCell>
                  <TableCell>NI Hours Used</TableCell>
                  <TableCell>NI Hours Rate</TableCell>
                  <TableCell>Net NI Wage</TableCell>
                  <TableCell>Net Cash Wage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
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
