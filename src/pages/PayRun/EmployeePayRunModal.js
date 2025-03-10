import React, { useCallback } from 'react';
import {
  Box,
  Modal,
  Typography,
  Divider,
  Button,
  IconButton,
  Avatar,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EmployeePayRunModal({
  open,
  onClose,
  employeeEntry,
  payRunStatus = '',
  onRecalculate
}) {
  // -------------------------------
  // Helper for adding section titles to PDF
  // -------------------------------
  const addSectionTitle = (doc, title, yPos, margin = 40) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin, yPos);
    return yPos + 20; // increase yPos by 20 for spacing
  };
  function formatToTwoDecimals(value) {
    // Check if value is numeric
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(2);
    }
  
    // If it's a string but represents a valid number, convert and format
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return parseFloat(value).toFixed(2);
    }
  
    // Otherwise, return the value as-is
    return value;
  }
  
  // -------------------------------
  // Export PDF using autoTable with section titles and professional styling
  // -------------------------------
  const handleExportPDF = useCallback(() => {
    if (!employeeEntry) return;
    const {
      employeeName,
      payrollId,
      payStructureName,
      timesheetName,
      breakdown = {},
      contributingTimesheets,
      payStructure
    } = employeeEntry;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let yPos = 40;
    const margin = 40;
    const lineHeight = 20;

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Pay Run Details', margin, yPos);
    yPos += lineHeight + 10;

    // Employee Details Section (no header row in autoTable)
    yPos = addSectionTitle(doc, 'Employee Details', yPos, margin);
    const employeeData = [
      ['Employee Name', employeeName],
      ['Payroll ID', payrollId || 'N/A'],
      ['Pay Structure Name', payStructureName || 'N/A'],
      ['Timesheet Name', timesheetName || 'N/A']
    ];
    autoTable(doc, {
      body: employeeData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { font: 'helvetica', fontSize: 10 },
      margin: { left: margin }
    });
    yPos = doc.lastAutoTable.finalY + 20;

    // 1. Pay Structure Section
    if (payStructure) {
      yPos = addSectionTitle(doc, 'Pay Structure', yPos, margin);
      const payStructData = [
        ['Structure Name', payStructure.payStructureName || 'N/A'],
        ['Has Daily Rates', payStructure.hasDailyRates ? 'Yes' : 'No'],
        ['Has Hourly Rates', payStructure.hasHourlyRates ? 'Yes' : 'No'],
        ['Has Other Considerations', payStructure.hasOtherConsiderations ? 'Yes' : 'No']
      ];
      autoTable(doc, {
        body: payStructData,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 10 },
        margin: { left: margin }
      });
      yPos = doc.lastAutoTable.finalY + 20;

      if (payStructure.hasDailyRates && payStructure.dailyRates) {
        yPos = addSectionTitle(doc, 'Daily Rates', yPos, margin);
        const dailyRatesData = [
          ['NI Day Mode', payStructure.dailyRates.niDayMode || 'N/A'],
          ['NI Regular Days', payStructure.dailyRates.ni_regularDays || 'N/A'],
          ['NI Regular Day Rate', payStructure.dailyRates.ni_regularDayRate || 'N/A'],
          ['NI Extra Day Rate', payStructure.dailyRates.ni_extraDayRate || 'N/A'],
          ['NI Extra Shift Rate', payStructure.dailyRates.ni_extraShiftRate || 'N/A'],
          ['Cash Day Mode', payStructure.dailyRates.cashDayMode || 'N/A'],
          ['Cash Regular Days', payStructure.dailyRates.cash_regularDays || 'N/A'],
          ['Cash Regular Day Rate', payStructure.dailyRates.cash_regularDayRate || 'N/A'],
          ['Cash Extra Day Rate', payStructure.dailyRates.cash_extraDayRate || 'N/A'],
          ['Cash Extra Shift Rate', payStructure.dailyRates.cash_extraShiftRate || 'N/A']
        ];
        autoTable(doc, {
          body: dailyRatesData,
          startY: yPos,
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113] },
          styles: { fontSize: 10 },
          margin: { left: margin }
        });
        yPos = doc.lastAutoTable.finalY + 20;
      }

      if (payStructure.hasHourlyRates && payStructure.hourlyRates) {
        yPos = addSectionTitle(doc, 'Hourly Rates', yPos, margin);
        const hourlyRatesData = [
          ['NI Hours Mode', payStructure.hourlyRates.niHoursMode || 'N/A'],
          ['Min NI Hours', payStructure.hourlyRates.minNiHours || 'N/A'],
          ['Max NI Hours', payStructure.hourlyRates.maxNiHours || 'N/A'],
          ['% NI Hours', payStructure.hourlyRates.percentageNiHours || 'N/A'],
          ['NI Rate Per Hour', payStructure.hourlyRates.niRatePerHour || 'N/A'],
          ['Cash Hours Mode', payStructure.hourlyRates.cashHoursMode || 'N/A'],
          ['Min Cash Hours', payStructure.hourlyRates.minCashHours || 'N/A'],
          ['Max Cash Hours', payStructure.hourlyRates.maxCashHours || 'N/A'],
          ['% Cash Hours', payStructure.hourlyRates.percentageCashHours || 'N/A'],
          ['Cash Rate Per Hour', payStructure.hourlyRates.cashRatePerHour || 'N/A']
        ];
        autoTable(doc, {
          body: hourlyRatesData,
          startY: yPos,
          theme: 'grid',
          headStyles: { fillColor: [241, 196, 15] },
          styles: { fontSize: 10 },
          margin: { left: margin }
        });
        yPos = doc.lastAutoTable.finalY + 20;
      }

      if (payStructure.hasOtherConsiderations && payStructure.otherConsiderations) {
        yPos = addSectionTitle(doc, 'Other Considerations', yPos, margin);
        const otherConsData = [
          ['Note', payStructure.otherConsiderations.note || 'N/A']
        ];
        autoTable(doc, {
          body: otherConsData,
          startY: yPos,
          theme: 'grid',
          headStyles: { fillColor: [155, 89, 182] },
          styles: { fontSize: 10 },
          margin: { left: margin }
        });
        yPos = doc.lastAutoTable.finalY + 20;
      }
    }

    // 2. Contributing Timesheets
    if (contributingTimesheets && contributingTimesheets.length > 0) {
      yPos = addSectionTitle(doc, 'Contributing Timesheets', yPos, margin);
      const tsHead = [["Timesheet Name", "Hours Worked", "Days Worked", "Extra Shift", "Addition", "Deduction", "Notes"]];
      const tsBody = contributingTimesheets.map(ts => [
        ts.timesheetName || '-',
        ts.hoursWorked,
        ts.daysWorked,
        ts.extraShiftWorked,
        ts.addition,
        ts.deduction,
        ts.notes || ''
      ]);
      autoTable(doc, {
        head: tsHead,
        body: tsBody,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
        margin: { left: margin }
      });
      yPos = doc.lastAutoTable.finalY + 20;
    }

    // 3. NIC & Tax
    yPos = addSectionTitle(doc, 'NIC & Tax', yPos, margin);
    const nicTaxData = [
      ['Employer NIC', breakdown.D1_eerNIC],
      ['Employee NIC', breakdown.D2_eesNIC],
      ['Employee Tax', breakdown.D3_eesTax]
    ];
    autoTable(doc, {
      body: nicTaxData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] },
      styles: { fontSize: 10 },
      margin: { left: margin }
    });
    yPos = doc.lastAutoTable.finalY + 20;

    // 4. Basic Calculations
    yPos = addSectionTitle(doc, 'Basic Calculations', yPos, margin);
    const basicCalcData = [
      ['Total Hours', breakdown.E1_totalHours],
      ['Total Days', breakdown.E2_totalDays],
      ['Extra Shifts', breakdown.E3_totalExtraShiftWorked],
      ['Wage Additions', breakdown.E4_otherWageAdditions],
      ['Wage Deductions', breakdown.E5_otherWageDeductions],
      ['Notes', breakdown.E6_notes || '']
    ];
    autoTable(doc, {
      body: basicCalcData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 10 },
      margin: { left: margin }
    });
    yPos = doc.lastAutoTable.finalY + 20;

    // 5. Daily & Hourly Wages
    yPos = addSectionTitle(doc, 'Daily & Hourly Wages', yPos, margin);
    const dailyHourlyData = [
      ['Regular Days Used', breakdown.E7_regularDaysUsed],
      ['Extra Days Used', breakdown.E8_extraDaysUsed],
      ['NI Days Wage', breakdown.E9_NIDaysWage],
      ['Cash Days Wage', breakdown.E10_cashDaysWage],
      ['Gross Days Wage', breakdown.E11_grossDaysWage],
      ['Extra Shift Wage', breakdown.E12_extraShiftWage],
      ['NI Hours Used', breakdown.E13_NIHoursUsed],
      ['Cash Hours Used', breakdown.E14_cashHoursUsed],
      ['NI Hours Wage', breakdown.E15_NIHoursWage],
      ['Cash Hours Wage', breakdown.E16_cashHoursWage],
      ['Gross Hours Wage', breakdown.E17_grossHoursWage]
    ];
    autoTable(doc, {
      body: dailyHourlyData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] },
      styles: { fontSize: 10 },
      margin: { left: margin }
    });
    yPos = doc.lastAutoTable.finalY + 20;

    // 6. Gross & Net Wages
    yPos = addSectionTitle(doc, 'Gross & Net Wages', yPos, margin);
    const grossNetData = [
      ['Gross NI Wage', breakdown.E18_grossNIWage],
      ['Gross Cash Wage', breakdown.E19_grossCashWage],
      ['Total Gross Wage', breakdown.E20_totalGrossWage],
      ['Net NI Wage', breakdown.E21_netNIWage],
      ['Net Cash Wage', breakdown.E22_netCashWage],
      ['Total Net Wage', breakdown.E23_totalNetWage]
    ];
    autoTable(doc, {
      body: grossNetData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [211, 84, 0] },
      styles: { fontSize: 10 },
      margin: { left: margin }
    });
    yPos = doc.lastAutoTable.finalY + 20;

    // 7. Timesheet Allocations
    if (breakdown.timesheetAllocations && breakdown.timesheetAllocations.length > 0) {
      yPos = addSectionTitle(doc, 'Timesheet Allocations', yPos, margin);
      const allocHead = [[
        "Timesheet ID",
        "Timesheet Name",
        "Location",
        "Hours Ratio",
        "Days Ratio",
        "Extra Shift Ratio",
        "Alloc Hours Wage",
        "Alloc Days Wage",
        "Alloc Extra Shift Wage",
        "Wage Ratio",
        "Alloc Gross NI Wage",
        "Alloc Gross Cash Wage",
        "Alloc Employer NIC",
        "Alloc Wage Cost"
      ]];
      const allocBody = breakdown.timesheetAllocations.map(alloc => [
        alloc.timesheetId,
        alloc.timesheetName || '-',
        alloc.locationName || '-',
        alloc.F1_hoursRatio,
        alloc.F2_daysRatio,
        alloc.F3_extraShiftRatio,
        alloc.F4_allocHoursWage,
        alloc.F5_allocDaysWage,
        alloc.F6_allocExtraShiftWage,
        alloc.F7_wageRatio,
        alloc.F8_allocGrossNIWage,
        alloc.F9_allocGrossCashWage,
        alloc.F10_allocEerNIC,
        alloc.F11_allocWageCost
      ]);
      autoTable(doc, {
        head: allocHead,
        body: allocBody,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94] },
        styles: { fontSize: 8 },
        margin: { left: margin }
      });
      yPos = doc.lastAutoTable.finalY + 20;
    }

    doc.save(`PayRun_${employeeName}.pdf`);
  }, [employeeEntry]);

  // -------------------------------
  // Export CSV with section titles
  // -------------------------------
  const handleExportCSV = useCallback(() => {
    if (!employeeEntry) return;
    const {
      employeeName,
      payrollId,
      payStructureName,
      timesheetName,
      breakdown = {},
      contributingTimesheets
    } = employeeEntry;

    let csvRows = [];

    // Employee Details Section
    csvRows.push(['Employee Details']);
    csvRows.push(['Employee Name', employeeName]);
    csvRows.push(['Payroll ID', payrollId || 'N/A']);
    csvRows.push(['Pay Structure Name', payStructureName || 'N/A']);
    csvRows.push(['Timesheet Name', timesheetName || 'N/A']);
    csvRows.push([]);

    // 1. Pay Structure
    if (employeeEntry.payStructure) {
      csvRows.push(['Pay Structure']);
      csvRows.push(['Structure Name', employeeEntry.payStructure.payStructureName || 'N/A']);
      csvRows.push(['Has Daily Rates', employeeEntry.payStructure.hasDailyRates ? 'Yes' : 'No']);
      csvRows.push(['Has Hourly Rates', employeeEntry.payStructure.hasHourlyRates ? 'Yes' : 'No']);
      csvRows.push(['Has Other Considerations', employeeEntry.payStructure.hasOtherConsiderations ? 'Yes' : 'No']);
      if (employeeEntry.payStructure.hasDailyRates && employeeEntry.payStructure.dailyRates) {
        const dr = employeeEntry.payStructure.dailyRates;
        csvRows.push(['Daily Rates']);
        csvRows.push(['NI Day Mode', dr.niDayMode || 'N/A']);
        csvRows.push(['NI Regular Days', dr.ni_regularDays || 'N/A']);
        csvRows.push(['NI Regular Day Rate', dr.ni_regularDayRate || 'N/A']);
        csvRows.push(['NI Extra Day Rate', dr.ni_extraDayRate || 'N/A']);
        csvRows.push(['NI Extra Shift Rate', dr.ni_extraShiftRate || 'N/A']);
        csvRows.push(['Cash Day Mode', dr.cashDayMode || 'N/A']);
        csvRows.push(['Cash Regular Days', dr.cash_regularDays || 'N/A']);
        csvRows.push(['Cash Regular Day Rate', dr.cash_regularDayRate || 'N/A']);
        csvRows.push(['Cash Extra Day Rate', dr.cash_extraDayRate || 'N/A']);
        csvRows.push(['Cash Extra Shift Rate', dr.cash_extraShiftRate || 'N/A']);
      }
      if (employeeEntry.payStructure.hasHourlyRates && employeeEntry.payStructure.hourlyRates) {
        const hr = employeeEntry.payStructure.hourlyRates;
        csvRows.push(['Hourly Rates']);
        csvRows.push(['NI Hours Mode', hr.niHoursMode || 'N/A']);
        csvRows.push(['Min NI Hours', hr.minNiHours || 'N/A']);
        csvRows.push(['Max NI Hours', hr.maxNiHours || 'N/A']);
        csvRows.push(['% NI Hours', hr.percentageNiHours || 'N/A']);
        csvRows.push(['NI Rate Per Hour', hr.niRatePerHour || 'N/A']);
        csvRows.push(['Cash Hours Mode', hr.cashHoursMode || 'N/A']);
        csvRows.push(['Min Cash Hours', hr.minCashHours || 'N/A']);
        csvRows.push(['Max Cash Hours', hr.maxCashHours || 'N/A']);
        csvRows.push(['% Cash Hours', hr.percentageCashHours || 'N/A']);
        csvRows.push(['Cash Rate Per Hour', hr.cashRatePerHour || 'N/A']);
      }
      if (employeeEntry.payStructure.hasOtherConsiderations && employeeEntry.payStructure.otherConsiderations) {
        csvRows.push(['Other Considerations']);
        csvRows.push(['Note', employeeEntry.payStructure.otherConsiderations.note || 'N/A']);
      }
      csvRows.push([]);
    }

    // 2. Contributing Timesheets
    if (contributingTimesheets && contributingTimesheets.length > 0) {
      csvRows.push(['Contributing Timesheets']);
      csvRows.push(['Timesheet Name', 'Hours Worked', 'Days Worked', 'Extra Shift', 'Addition', 'Deduction', 'Notes']);
      contributingTimesheets.forEach(ts => {
        csvRows.push([
          ts.timesheetName || '-',
          ts.hoursWorked,
          ts.daysWorked,
          ts.extraShiftWorked,
          ts.addition,
          ts.deduction,
          ts.notes || ''
        ]);
      });
      csvRows.push([]);
    }

    // 3. NIC & Tax
    csvRows.push(['NIC & Tax']);
    csvRows.push(['Employer NIC', breakdown.D1_eerNIC]);
    csvRows.push(['Employee NIC', breakdown.D2_eesNIC]);
    csvRows.push(['Employee Tax', breakdown.D3_eesTax]);
    csvRows.push([]);

    // 4. Basic Calculations
    csvRows.push(['Basic Calculations']);
    csvRows.push(['Total Hours', breakdown.E1_totalHours]);
    csvRows.push(['Total Days', breakdown.E2_totalDays]);
    csvRows.push(['Extra Shifts', breakdown.E3_totalExtraShiftWorked]);
    csvRows.push(['Wage Additions', breakdown.E4_otherWageAdditions]);
    csvRows.push(['Wage Deductions', breakdown.E5_otherWageDeductions]);
    csvRows.push(['Notes', breakdown.E6_notes || '']);
    csvRows.push([]);

    // 5. Daily & Hourly Wages
    csvRows.push(['Daily & Hourly Wages']);
    csvRows.push(['Regular Days Used', breakdown.E7_regularDaysUsed]);
    csvRows.push(['Extra Days Used', breakdown.E8_extraDaysUsed]);
    csvRows.push(['NI Days Wage', breakdown.E9_NIDaysWage]);
    csvRows.push(['Cash Days Wage', breakdown.E10_cashDaysWage]);
    csvRows.push(['Gross Days Wage', breakdown.E11_grossDaysWage]);
    csvRows.push(['Extra Shift Wage', breakdown.E12_extraShiftWage]);
    csvRows.push(['NI Hours Used', breakdown.E13_NIHoursUsed]);
    csvRows.push(['Cash Hours Used', breakdown.E14_cashHoursUsed]);
    csvRows.push(['NI Hours Wage', breakdown.E15_NIHoursWage]);
    csvRows.push(['Cash Hours Wage', breakdown.E16_cashHoursWage]);
    csvRows.push(['Gross Hours Wage', breakdown.E17_grossHoursWage]);
    csvRows.push([]);

    // 6. Gross & Net Wages
    csvRows.push(['Gross & Net Wages']);
    csvRows.push(['Gross NI Wage', breakdown.E18_grossNIWage]);
    csvRows.push(['Gross Cash Wage', breakdown.E19_grossCashWage]);
    csvRows.push(['Total Gross Wage', breakdown.E20_totalGrossWage]);
    csvRows.push(['Net NI Wage', breakdown.E21_netNIWage]);
    csvRows.push(['Net Cash Wage', breakdown.E22_netCashWage]);
    csvRows.push(['Total Net Wage', breakdown.E23_totalNetWage]);
    csvRows.push([]);

    // 7. Timesheet Allocations
    if (breakdown.timesheetAllocations && breakdown.timesheetAllocations.length > 0) {
      csvRows.push(['Timesheet Allocations']);
      csvRows.push([
        'Timesheet ID',
        'Timesheet Name',
        'Location',
        'Hours Ratio',
        'Days Ratio',
        'Extra Shift Ratio',
        'Allocated Hours Wage',
        'Allocated Days Wage',
        'Allocated Extra Shift Wage',
        'Wage Ratio',
        'Allocated Gross NI Wage',
        'Allocated Gross Cash Wage',
        'Allocated Employer NIC',
        'Allocated Wage Cost'
      ]);
      breakdown.timesheetAllocations.forEach(alloc => {
        csvRows.push([
          alloc.timesheetId,
          alloc.timesheetName || '-',
          alloc.locationName || '-',
          alloc.F1_hoursRatio,
          alloc.F2_daysRatio,
          alloc.F3_extraShiftRatio,
          alloc.F4_allocHoursWage,
          alloc.F5_allocDaysWage,
          alloc.F6_allocExtraShiftWage,
          alloc.F7_wageRatio,
          alloc.F8_allocGrossNIWage,
          alloc.F9_allocGrossCashWage,
          alloc.F10_allocEerNIC,
          alloc.F11_allocWageCost
        ]);
      });
      csvRows.push([]);
    }

    const csvContent = csvRows
      .map(row => row.map(item => `"${item}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PayRun_${employeeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [employeeEntry]);

  // -------------------------------
  // Render Helpers
  // -------------------------------
  const renderField = (label, value, description) => {
    // Format the value to 2 decimals if it's numeric
    const displayValue = formatToTwoDecimals(value);
  
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Typography variant="overline" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {displayValue !== undefined && displayValue !== null ? displayValue : '-'}
        </Typography>
        {description && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        )}
      </Grid>
    );
  };

  const renderSection = (title, fields) => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>{fields}</Grid>
      </AccordionDetails>
    </Accordion>
  );

  if (!employeeEntry) {
    return (
      <Modal open={open} onClose={onClose}>
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '50%',
            transform: 'translate(-50%, -50%)',
            p: 2
          }}
        >
          <Typography>No employee data</Typography>
          <Button onClick={onClose}>Close</Button>
        </Paper>
      </Modal>
    );
  }

  const {
    employeeName,
    payrollId,
    payStructureName,
    timesheetName,
    breakdown = {},
    payStructure,
    rawTimesheetIds,
    contributingTimesheets
  } = employeeEntry;

  const {
    E1_totalHours,
    E2_totalDays,
    E3_totalExtraShiftWorked,
    E4_otherWageAdditions,
    E5_otherWageDeductions,
    E6_notes,
    E7_regularDaysUsed,
    E8_extraDaysUsed,
    E9_NIDaysWage,
    E10_cashDaysWage,
    E11_grossDaysWage,
    E12_extraShiftWage,
    E13_NIHoursUsed,
    E14_cashHoursUsed,
    E15_NIHoursWage,
    E16_cashHoursWage,
    E17_grossHoursWage,
    E18_grossNIWage,
    E19_grossCashWage,
    E20_totalGrossWage,
    E21_netNIWage,
    E22_netCashWage,
    E23_totalNetWage,
    D1_eerNIC,
    D2_eesNIC,
    D3_eesTax,
    timesheetAllocations = []
  } = breakdown;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '90%',
          maxWidth: 1200,
          maxHeight: '90vh',
          transform: 'translate(-50%, -50%)',
          overflow: 'auto'
        }}
      >
        <Card sx={{ boxShadow: 8, borderRadius: 2 }}>
          <CardHeader
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.paper',
              zIndex: 10,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
            avatar={
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
            }
            action={
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            }
            title={
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {employeeName}
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="text.secondary">
                Payroll ID: <strong>{payrollId || 'N/A'}</strong>
              </Typography>
            }
          />

          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Below is a detailed breakdown of the pay run data.
              </Typography>
            </Box>

            {/* 1. Pay Structure */}
            {payStructure && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>Pay Structure</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {renderField('Structure Name', payStructure.payStructureName, 'Name of the pay structure')}
                    {renderField('Has Daily Rates?', payStructure.hasDailyRates ? 'Yes' : 'No')}
                    {renderField('Has Hourly Rates?', payStructure.hasHourlyRates ? 'Yes' : 'No')}
                    {renderField('Has Other Considerations?', payStructure.hasOtherConsiderations ? 'Yes' : 'No')}
                  </Grid>
                  {payStructure.hasDailyRates && payStructure.dailyRates && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Daily Rates
                      </Typography>
                      <Grid container spacing={2} sx={{ pl: 2, pt: 1 }}>
                        {renderField('NI Day Mode', payStructure.dailyRates.niDayMode)}
                        {renderField('NI Regular Days', payStructure.dailyRates.ni_regularDays)}
                        {renderField('NI Regular Day Rate', payStructure.dailyRates.ni_regularDayRate)}
                        {renderField('NI Extra Day Rate', payStructure.dailyRates.ni_extraDayRate)}
                        {renderField('NI Extra Shift Rate', payStructure.dailyRates.ni_extraShiftRate)}
                        {renderField('Cash Day Mode', payStructure.dailyRates.cashDayMode)}
                        {renderField('Cash Regular Days', payStructure.dailyRates.cash_regularDays)}
                        {renderField('Cash Regular Day Rate', payStructure.dailyRates.cash_regularDayRate)}
                        {renderField('Cash Extra Day Rate', payStructure.dailyRates.cash_extraDayRate)}
                        {renderField('Cash Extra Shift Rate', payStructure.dailyRates.cash_extraShiftRate)}
                      </Grid>
                    </Box>
                  )}
                  {payStructure.hasHourlyRates && payStructure.hourlyRates && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Hourly Rates
                      </Typography>
                      <Grid container spacing={2} sx={{ pl: 2, pt: 1 }}>
                        {renderField('NI Hours Mode', payStructure.hourlyRates.niHoursMode)}
                        {renderField('Min NI Hours', payStructure.hourlyRates.minNiHours)}
                        {renderField('Max NI Hours', payStructure.hourlyRates.maxNiHours)}
                        {renderField('% NI Hours', payStructure.hourlyRates.percentageNiHours)}
                        {renderField('NI Rate Per Hour', payStructure.hourlyRates.niRatePerHour)}
                        {renderField('Cash Hours Mode', payStructure.hourlyRates.cashHoursMode)}
                        {renderField('Min Cash Hours', payStructure.hourlyRates.minCashHours)}
                        {renderField('Max Cash Hours', payStructure.hourlyRates.maxCashHours)}
                        {renderField('% Cash Hours', payStructure.hourlyRates.percentageCashHours)}
                        {renderField('Cash Rate Per Hour', payStructure.hourlyRates.cashRatePerHour)}
                      </Grid>
                    </Box>
                  )}
                  {payStructure.hasOtherConsiderations && payStructure.otherConsiderations && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Other Considerations
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Note: {payStructure.otherConsiderations.note || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            )}

            {/* 2. Contributing Timesheets */}
            {contributingTimesheets && contributingTimesheets.length > 0 && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>Contributing Timesheets</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Timesheet Name</TableCell>
                        <TableCell>Hours Worked</TableCell>
                        <TableCell>Days Worked</TableCell>
                        <TableCell>Extra Shift</TableCell>
                        <TableCell>Addition</TableCell>
                        <TableCell>Deduction</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {contributingTimesheets.map((ts, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{ts.timesheetName || '-'}</TableCell>
                          <TableCell>{ts.hoursWorked ?? '-'}</TableCell>
                          <TableCell>{ts.daysWorked ?? '-'}</TableCell>
                          <TableCell>{ts.extraShiftWorked ?? '-'}</TableCell>
                          <TableCell>{ts.addition ?? '-'}</TableCell>
                          <TableCell>{ts.deduction ?? '-'}</TableCell>
                          <TableCell>{ts.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            )}

            {/* 3. NIC & Tax */}
            {renderSection('NIC & Tax', [
              renderField('eerNIC', D1_eerNIC, 'Employer NIC contribution'),
              renderField('eesNIC', D2_eesNIC, 'Employee NIC contribution'),
              renderField('eesTax', D3_eesTax, 'Employee income tax')
            ])}

            {/* 4. Basic Calculations */}
            {renderSection('Basic Calculations', [
              renderField('totalHours', E1_totalHours, 'Total hours worked'),
              renderField('totalDays', E2_totalDays, 'Total days worked'),
              renderField('totalExtraShift', E3_totalExtraShiftWorked, 'Number of extra shifts'),
              renderField('wageAdditions', E4_otherWageAdditions, 'Any wage additions'),
              renderField('wageDeductions', E5_otherWageDeductions, 'Any wage deductions'),
              renderField('notes', E6_notes, 'Additional notes')
            ])}

            {/* 5. Daily & Hourly Wages */}
            {renderSection('Daily & Hourly Wages', [
              renderField('regularDaysUsed', E7_regularDaysUsed, 'Count of regular days used'),
              renderField('extraDaysUsed', E8_extraDaysUsed, 'Count of extra days used'),
              renderField('NIDaysWage', E9_NIDaysWage, 'NI-based daily wage'),
              renderField('cashDaysWage', E10_cashDaysWage, 'Cash-based daily wage'),
              renderField('grossDaysWage', E11_grossDaysWage, 'Gross daily wage'),
              renderField('extraShiftWage', E12_extraShiftWage, 'Extra shift wage total'),
              renderField('NIHoursUsed', E13_NIHoursUsed, 'NI-based hours used'),
              renderField('cashHoursUsed', E14_cashHoursUsed, 'Cash-based hours used'),
              renderField('NIHoursWage', E15_NIHoursWage, 'Wage for NI hours'),
              renderField('cashHoursWage', E16_cashHoursWage, 'Wage for cash hours'),
              renderField('grossHoursWage', E17_grossHoursWage, 'Total gross hourly wage')
            ])}

            {/* 6. Gross & Net Wages */}
            {renderSection('Gross & Net Wages', [
              renderField('grossNIWage', E18_grossNIWage, 'Gross NI wage total'),
              renderField('grossCashWage', E19_grossCashWage, 'Gross cash wage total'),
              renderField('totalGrossWage', E20_totalGrossWage, 'Overall total gross wage'),
              renderField('netNIWage', E21_netNIWage, 'Net NI wage after deductions'),
              renderField('netCashWage', E22_netCashWage, 'Net cash wage after deductions'),
              renderField('totalNetWage', E23_totalNetWage, 'Total net wage after all deductions')
            ])}

            {/* 7. Timesheet Allocations */}
            {timesheetAllocations && timesheetAllocations.length > 0 && (
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>Timesheet Allocations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {timesheetAllocations.map((alloc, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          boxShadow: 1,
                          mb: 1,
                          backgroundColor: '#fff'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Timesheet ID: {alloc.timesheetId}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ lineHeight: 1.2 }}>
                              Timesheet Name
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {alloc.timesheetName || '-'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ lineHeight: 1.2 }}>
                              Location
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {alloc.locationName || '-'}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {renderField('Hours Ratio', alloc.F1_hoursRatio, 'Hours ratio')}
                          {renderField('Days Ratio', alloc.F2_daysRatio, 'Days ratio')}
                          {renderField('Extra Shift Ratio', alloc.F3_extraShiftRatio, 'Extra shift ratio')}
                          {renderField('Alloc Hours Wage', alloc.F4_allocHoursWage, 'Allocated hours wage')}
                          {renderField('Alloc Days Wage', alloc.F5_allocDaysWage, 'Allocated days wage')}
                          {renderField('Alloc Extra Shift Wage', alloc.F6_allocExtraShiftWage, 'Allocated extra shift wage')}
                          {renderField('Wage Ratio', alloc.F7_wageRatio, 'Overall wage ratio')}
                          {renderField('Alloc Gross NI Wage', alloc.F8_allocGrossNIWage, 'Gross NI wage allocated')}
                          {renderField('Alloc Gross Cash Wage', alloc.F9_allocGrossCashWage, 'Gross cash wage allocated')}
                          {renderField('Alloc Employer NIC', alloc.F10_allocEerNIC, 'Employer NIC portion')}
                          {renderField('Alloc Wage Cost', alloc.F11_allocWageCost, 'Total wage cost')}
                        </Grid>
                      </Paper>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            )}

            <Divider sx={{ mt: 4, mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {payRunStatus === 'Draft' && onRecalculate && (
                <Button variant="contained" color="warning" onClick={onRecalculate}>
                  Recalculate
                </Button>
              )}
              <Button variant="outlined" onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button variant="outlined" onClick={handleExportPDF}>
                Export PDF
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
}
