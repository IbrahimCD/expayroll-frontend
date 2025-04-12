// src/pages/Reports/WageCostAllocationReportPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Box,
  CircularProgress
} from '@mui/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import api from '../../services/api';

export default function WageCostAllocationReportPage() {
  const [payRuns, setPayRuns] = useState([]);
  const [selectedPayRun, setSelectedPayRun] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState('');

  // 1) Fetch all pay runs on mount
  const fetchPayRuns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/payruns');
      setPayRuns(res.data.payruns || []);
    } catch (err) {
      console.error('Error fetching pay runs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayRuns();
  }, [fetchPayRuns]);

  // 2) Handle Generate
  const handleGenerate = async () => {
    if (!selectedPayRun) {
      setMessage('Please select a pay run first.');
      return;
    }
    setLoading(true);
    setMessage('');
    setReportData(null);

    try {
      const res = await api.get('/reports/wage-cost-allocation', {
        params: { payRunId: selectedPayRun }
      });
      setReportData(res.data);
      if (!res.data?.wageCostAllocations?.length) {
        setMessage('No timesheet allocations found for this pay run.');
      }
    } catch (err) {
      console.error('Error generating wage cost allocation:', err);
      setMessage(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  // 3) Export to PDF (unchanged)
  const handleExportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(`Wage Cost Allocation Report for: ${reportData.payRunName}`, 40, 40);

    let yPos = 60;
    doc.setFontSize(12);

    reportData.wageCostAllocations.forEach((ts, index) => {
      doc.text(`Contributing Timesheet #${index + 1}`, 40, yPos);
      yPos += 15;
      doc.text(`Timesheet Name: ${ts.timesheetName}`, 40, yPos);
      yPos += 15;
      doc.text(`Work Location: ${ts.locationName || 'N/A'}`, 40, yPos);
      yPos += 15;

      const startDate = ts.startDate ? new Date(ts.startDate).toLocaleDateString() : 'N/A';
      const endDate = ts.endDate ? new Date(ts.endDate).toLocaleDateString() : 'N/A';
      doc.text(`Date Range: ${startDate} - ${endDate}`, 40, yPos);
      yPos += 20;

      const tableRows = ts.employees.map((emp) => [
        emp.employeeName,
        emp.payStructureName,
        emp.payrollId,
        emp.allocatedNiWage.toFixed(2),
        emp.allocatedCashWage.toFixed(2),
        emp.allocatedEerNIC.toFixed(2),
        emp.allocatedWageCost.toFixed(2)
      ]);

      tableRows.push([
        'TOTAL',
        '',
        '',
        ts.totals.allocatedNiWage.toFixed(2),
        ts.totals.allocatedCashWage.toFixed(2),
        ts.totals.allocatedEerNIC.toFixed(2),
        ts.totals.allocatedWageCost.toFixed(2)
      ]);

      doc.autoTable({
        head: [[
          'Employee Name',
          'Structure Name',
          'Payroll ID',
          'Allocated NI Wage',
          'Allocated Cash Wage',
          'Allocated Eer NIC',
          'Allocated Wage Cost'
        ]],
        body: tableRows,
        startY: yPos,
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 3 }
      });

      yPos = doc.autoTable.previous.finalY + 30;
    });

    doc.save(`Wage_Cost_Allocation_${reportData.payRunName}.pdf`);
  };

  // 4) Export to CSV (already updated in previous step, shown for completeness)
  const handleExportCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    csvContent += `"Wage Cost Allocation Report for: ${reportData.payRunName}"\n\n`;

    reportData.wageCostAllocations.forEach((ts, index) => {
      csvContent += `Contributing Timesheet #${index + 1}\n`;
      csvContent += `Timesheet Name:,${ts.timesheetName || 'N/A'}\n`;
      csvContent += `Work Location:,${ts.locationName || 'N/A'}\n`;

      const startDate = ts.startDate ? new Date(ts.startDate).toLocaleDateString() : 'N/A';
      const endDate = ts.endDate ? new Date(ts.endDate).toLocaleDateString() : 'N/A';
      csvContent += `Date Range:,${startDate} - ${endDate}\n`;

      const structureName = ts.employees.length ? ts.employees[0].payStructureName : 'N/A';
      csvContent += `Structure Name:,${structureName}\n\n`;

      // New Column Order
      csvContent += [
        'Employee Name',
        'Payroll ID',
        'Structure Name',
        'Hours Worked',
        'Days Worked',
        'Extra Shift',
        'Addition',
        'Deduction',
        'Notes',
        'Allocated NI Wage',
        'Allocated Cash Wage',
        'Allocated Eer NIC',
        'Allocated Wage Cost'
      ].join(',') + '\n';

      ts.employees.forEach((emp) => {
        const matchingCT = reportData.contributingTimesheets.find(
          (ct) =>
            ct.employeeName === emp.employeeName &&
            ct.timesheetName === ts.timesheetName
        );

        const hoursWorked = matchingCT ? matchingCT.hoursWorked.toFixed(2) : '0.00';
        const daysWorked = matchingCT ? matchingCT.daysWorked.toFixed(2) : '0.00';
        const extraShiftWorked = matchingCT ? matchingCT.extraShiftWorked.toFixed(2) : '0.00';
        const addition = matchingCT ? matchingCT.addition.toFixed(2) : '0.00';
        const deduction = matchingCT ? matchingCT.deduction.toFixed(2) : '0.00';
        const notes = matchingCT ? matchingCT.notes : '';

        csvContent += [
          `"${emp.employeeName}"`,
          emp.payrollId,
          emp.payStructureName,
          hoursWorked,
          daysWorked,
          extraShiftWorked,
          addition,
          deduction,
          `"${notes}"`,
          emp.allocatedNiWage.toFixed(2),
          emp.allocatedCashWage.toFixed(2),
          emp.allocatedEerNIC.toFixed(2),
          emp.allocatedWageCost.toFixed(2)
        ].join(',') + '\n';
      });

      // Totals
      csvContent += [
        'TOTAL',
        '',
        '',
        '0',
        '0',
        '0',
        '0',
        '0',
        '',
        ts.totals.allocatedNiWage.toFixed(2),
        ts.totals.allocatedCashWage.toFixed(2),
        ts.totals.allocatedEerNIC.toFixed(2),
        ts.totals.allocatedWageCost.toFixed(2)
      ].join(',') + '\n\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Wage_Cost_Allocation_${reportData.payRunName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Wage Cost Allocation Report
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Pay Run</InputLabel>
            <Select
              label="Select Pay Run"
              value={selectedPayRun}
              onChange={(e) => setSelectedPayRun(e.target.value)}
            >
              {payRuns.map((pr) => (
                <MenuItem key={pr._id} value={pr._id}>
                  {pr.payRunName || 'Unnamed'} - 
                  {new Date(pr.startDate).toLocaleDateString()} to 
                  {new Date(pr.endDate).toLocaleDateString()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !payRuns.length}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </Box>

        {message && (
          <Typography variant="body1" color="primary" sx={{ mb: 2 }}>
            {message}
          </Typography>
        )}

        {reportData && reportData.wageCostAllocations && (
          <Box sx={{ mt: 3 }}>
            {reportData.wageCostAllocations.map((ts, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Contributing Timesheet #{index + 1}
                </Typography>
                <Typography variant="body2">
                  Timesheet Name: {ts.timesheetName || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  Work Location: {ts.locationName || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Date Range:{' '}
                  {ts.startDate ? new Date(ts.startDate).toLocaleDateString() : 'N/A'}{' '}
                  -{' '}
                  {ts.endDate ? new Date(ts.endDate).toLocaleDateString() : 'N/A'}
                </Typography>

                {/* Single Table reflecting the new column order from CSV */}
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee Name</TableCell>
                      <TableCell>Payroll ID</TableCell>
                      <TableCell>Structure Name</TableCell>
                      <TableCell>Hours Worked</TableCell>
                      <TableCell>Days Worked</TableCell>
                      <TableCell>Extra Shift</TableCell>
                      <TableCell>Addition</TableCell>
                      <TableCell>Deduction</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Allocated NI Wage</TableCell>
                      <TableCell>Allocated Cash Wage</TableCell>
                      <TableCell>Allocated Eer NIC</TableCell>
                      <TableCell>Allocated Wage Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ts.employees.map((emp, i) => {
                      // Find matching "contributingTimesheets" record 
                      // to get hours, days, extra shift, etc.
                      const matchingCT = reportData.contributingTimesheets.find(
                        (ct) =>
                          ct.employeeName === emp.employeeName &&
                          ct.timesheetName === ts.timesheetName
                      );

                      const hoursWorked = matchingCT
                        ? matchingCT.hoursWorked.toFixed(2)
                        : '0.00';
                      const daysWorked = matchingCT
                        ? matchingCT.daysWorked.toFixed(2)
                        : '0.00';
                      const extraShiftWorked = matchingCT
                        ? matchingCT.extraShiftWorked.toFixed(2)
                        : '0.00';
                      const addition = matchingCT
                        ? matchingCT.addition.toFixed(2)
                        : '0.00';
                      const deduction = matchingCT
                        ? matchingCT.deduction.toFixed(2)
                        : '0.00';
                      const notes = matchingCT ? matchingCT.notes : '';

                      return (
                        <TableRow key={i}>
                          <TableCell>{emp.employeeName}</TableCell>
                          <TableCell>{emp.payrollId}</TableCell>
                          <TableCell>{emp.payStructureName}</TableCell>
                          <TableCell>{hoursWorked}</TableCell>
                          <TableCell>{daysWorked}</TableCell>
                          <TableCell>{extraShiftWorked}</TableCell>
                          <TableCell>{addition}</TableCell>
                          <TableCell>{deduction}</TableCell>
                          <TableCell>{notes}</TableCell>
                          <TableCell>{emp.allocatedNiWage.toFixed(2)}</TableCell>
                          <TableCell>{emp.allocatedCashWage.toFixed(2)}</TableCell>
                          <TableCell>{emp.allocatedEerNIC.toFixed(2)}</TableCell>
                          <TableCell>{emp.allocatedWageCost.toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow sx={{ fontWeight: 'bold' }}>
                      {/* "TOTAL" row with zero or blank for hours/days/etc. */}
                      <TableCell>TOTAL</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell></TableCell>
                      <TableCell>{ts.totals.allocatedNiWage.toFixed(2)}</TableCell>
                      <TableCell>{ts.totals.allocatedCashWage.toFixed(2)}</TableCell>
                      <TableCell>{ts.totals.allocatedEerNIC.toFixed(2)}</TableCell>
                      <TableCell>{ts.totals.allocatedWageCost.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            ))}

            {/* Buttons to export PDF / CSV */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleExportPDF}>
                Export as PDF
              </Button>
              <Button variant="outlined" onClick={handleExportCSV}>
                Export as CSV
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
