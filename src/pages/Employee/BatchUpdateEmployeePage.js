import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  Paper,
  CircularProgress,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid
} from '@mui/material';
import Papa from 'papaparse';
import api from '../../services/api';

// Helper: Tab panel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`batch-update-tabpanel-${index}`}
      aria-labelledby={`batch-update-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function BatchUpdateEmployeePage() {
  // ---------- Tab state ----------
  const [tabIndex, setTabIndex] = useState(0);

  // ---------- TAB 1: Generate CSV ----------
  // Removed base location filter; using only a status filter and a client‐side name search
  const [nameSearch, setNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locations, setLocations] = useState([]); // still available if needed for display elsewhere
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeMessage, setEmployeeMessage] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  // ---------- TAB 2: CSV Update ----------
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [parsedUpdates, setParsedUpdates] = useState([]);
  const [parsingCSV, setParsingCSV] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateMessage, setUpdateMessage] = useState('');

  // ---------- Tab change ----------
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // ---------- Fetch locations on mount (if needed) ----------
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

  // NEW: Build a lookup object to map location ObjectId to location code
  const locationLookup = useMemo(() => {
    return locations.reduce((acc, loc) => {
      acc[loc._id] = loc.code; // using the 'code' property
      return acc;
    }, {});
  }, [locations]);

  // ---------- Fetch employees (with status filter only) ----------
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setEmployeeMessage('');
    try {
      // Build query parameters using status filter only
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/employees', { params });
      const empList = res.data.employees || [];
      setEmployees(empList);
      setEmployeeMessage(`Fetched ${empList.length} employees.`);
      setSelectedEmployeeIds([]); // reset selection
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployeeMessage('Error fetching employees.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // ---------- Client-side filtering: filter employees by nameSearch ----------
  const filteredEmployees = useMemo(() => {
    if (!nameSearch.trim()) return employees;
    return employees.filter(emp => {
      const searchStr = nameSearch.toLowerCase();
      return (
        (emp.firstName && emp.firstName.toLowerCase().includes(searchStr)) ||
        (emp.lastName && emp.lastName.toLowerCase().includes(searchStr)) ||
        (emp.preferredName && emp.preferredName.toLowerCase().includes(searchStr))
      );
    });
  }, [employees, nameSearch]);

  // ---------- Handle checkbox selection ----------
  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map((emp) => emp._id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  // ---------- Generate CSV from selected employees ----------
  const handleGenerateCSV = () => {
    if (selectedEmployeeIds.length === 0) {
      setEmployeeMessage('Please select at least one employee.');
      return;
    }
    // Filter only selected employees from the already filtered list
    const selected = filteredEmployees.filter((emp) =>
      selectedEmployeeIds.includes(emp._id)
    );

    // Build CSV rows. Here we include every field the employee holds.
    const csvData = selected.map((emp) => {
      const ps = emp.payStructure || {};
      const dr = ps.dailyRates || {};
      const hr = ps.hourlyRates || {};
      const oc = (ps.hasOtherConsiderations && ps.otherConsiderations) || {};
      
      // NEW: Use the locationLookup to output the location code instead of the ObjectId
      const baseLocationCode = locationLookup[emp.baseLocationId] || '';
      const locationAccessCodes = (emp.locationAccess && Array.isArray(emp.locationAccess))
        ? emp.locationAccess.map(id => locationLookup[id] || id).join(';')
        : '';

      return {
        employeeId: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        preferredName: emp.preferredName,
        gender: emp.gender,
        dateOfBirth: emp.dateOfBirth || '',
        mobileNo: emp.mobileNo || '',
        email: emp.email || '',
        address: emp.address || '',
        payrollId: emp.payrollId || '',
        status: emp.status || '',
        // Use location code instead of the ObjectId:
        baseLocationId: baseLocationCode,
        locationAccess: locationAccessCodes,
        description: emp.description || '',
        payStructureName: ps.payStructureName || '',
        hasDailyRates: ps.hasDailyRates ? 'true' : 'false',
        niDayMode: dr.niDayMode || '',
        ni_regularDays: dr.ni_regularDays || '',
        ni_regularDayRate: dr.ni_regularDayRate || '',
        ni_extraDayRate: dr.ni_extraDayRate || '',
        ni_extraShiftRate: dr.ni_extraShiftRate || '',
        cashDayMode: dr.cashDayMode || '',
        cash_regularDays: dr.cash_regularDays || '',
        cash_regularDayRate: dr.cash_regularDayRate || '',
        cash_extraDayRate: dr.cash_extraDayRate || '',
        cash_extraShiftRate: dr.cash_extraShiftRate || '',
        hasHourlyRates: ps.hasHourlyRates ? 'true' : 'false',
        niHoursMode: hr.niHoursMode || '',
        minNiHours: hr.minNiHours || '',
        maxNiHours: hr.maxNiHours || '',
        percentageNiHours: hr.percentageNiHours || '',
        niRatePerHour: hr.niRatePerHour || '',
        fixedNiHours: hr.fixedNiHours || '',
        cashHoursMode: hr.cashHoursMode || '',
        minCashHours: hr.minCashHours || '',
        maxCashHours: hr.maxCashHours || '',
        percentageCashHours: hr.percentageCashHours || '',
        cashRatePerHour: hr.cashRatePerHour || '',
        hasOtherConsiderations: ps.hasOtherConsiderations ? 'true' : 'false',
        note: oc.note || '',
        niAdditions: oc.niAdditions
          ? oc.niAdditions.map(item => item.name ? `${item.name}:${item.amount}` : item.amount).join(';')
          : '',
        niDeductions: oc.niDeductions
          ? oc.niDeductions.map(item => item.name ? `${item.name}:${item.amount}` : item.amount).join(';')
          : '',
        cashAdditions: oc.cashAdditions
          ? oc.cashAdditions.map(item => item.name ? `${item.name}:${item.amount}` : item.amount).join(';')
          : '',
        cashDeductions: oc.cashDeductions
          ? oc.cashDeductions.map(item => item.name ? `${item.name}:${item.amount}` : item.amount).join(';')
          : ''
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'selected_employees_update.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------- TAB 2: CSV Update ----------
  const handleFileInputChange = (e) => {
    setCsvFile(e.target.files[0]);
    setCsvText('');
    setParsedUpdates([]);
    setUpdateMessage('');
  };
  const handleCSVTextChange = (e) => {
    setCsvText(e.target.value);
    setCsvFile(null);
    setParsedUpdates([]);
    setUpdateMessage('');
  };

  const handleParseCSV = () => {
    let fileOrText;
    if (csvFile) {
      fileOrText = csvFile;
    } else if (csvText.trim() !== '') {
      fileOrText = csvText;
    } else {
      setUpdateMessage('Please upload a file or paste CSV text.');
      return;
    }
    setParsingCSV(true);
    Papa.parse(fileOrText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedUpdates(results.data);
        setParsingCSV(false);
        setUpdateMessage(`Parsed ${results.data.length} rows for update.`);
      },
      error: (err) => {
        console.error('CSV parse error:', err);
        setParsingCSV(false);
        setUpdateMessage('Error parsing CSV.');
      }
    });
  };

  // ---------- Confirm Update (batch PUT) ----------
  const handleConfirmUpdate = async () => {
    if (parsedUpdates.length === 0) {
      setUpdateMessage('No parsed data to update.');
      return;
    }
    setUpdating(true);
    setUpdateMessage('');
    setUpdateProgress(0);

    // Chunk the array into smaller arrays (e.g., 10 rows per request)
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < parsedUpdates.length; i += chunkSize) {
      chunks.push(parsedUpdates.slice(i, i + chunkSize));
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        await api.put('/employees/batch-update', { employees: chunks[i] });
        // Update progress
        setUpdateProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
      setUpdateMessage('Employees updated successfully!');
    } catch (error) {
      console.error('Error during batch update:', error);
      setUpdateMessage('Error updating employees. Check console for details.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Batch Update Employees
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Generate CSV" />
          <Tab label="Update CSV" />
        </Tabs>
      </Box>

      {/* TAB 1: Generate CSV */}
      <TabPanel value={tabIndex} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            1) Filter & Select Employees
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search Name"
                variant="outlined"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Left">Left</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={fetchEmployees}
            disabled={loadingEmployees}
          >
            {loadingEmployees ? <CircularProgress size={24} /> : 'Fetch Employees'}
          </Button>

          {employeeMessage && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {employeeMessage}
            </Typography>
          )}

          {employees.length > 0 && (
            <>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        selectedEmployeeIds.length === filteredEmployees.length &&
                        filteredEmployees.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  }
                  label="Select All"
                />
              </Box>

              <Paper sx={{ maxHeight: 300, overflowY: 'auto', mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Employee ID</TableCell>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Pay Structure</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEmployees.map((emp) => (
                      <TableRow key={emp._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedEmployeeIds.includes(emp._id)}
                            onChange={() => handleCheckboxChange(emp._id)}
                          />
                        </TableCell>
                        <TableCell>{emp._id}</TableCell>
                        <TableCell>{emp.firstName}</TableCell>
                        <TableCell>{emp.lastName}</TableCell>
                        <TableCell>{emp.status}</TableCell>
                        <TableCell>
                          {emp.payStructure?.payStructureName || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleGenerateCSV}
                disabled={selectedEmployeeIds.length === 0}
              >
                Download CSV
              </Button>
            </>
          )}
        </Paper>
      </TabPanel>

      {/* TAB 2: Update CSV */}
      <TabPanel value={tabIndex} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            2) Upload or Paste Updated CSV
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Button variant="contained" component="label">
              Upload CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileInputChange}
              />
            </Button>
          </Box>

          <Typography variant="body2" gutterBottom>
            Or paste CSV text below:
          </Typography>
          <TextField
            label="CSV Text"
            multiline
            rows={6}
            fullWidth
            value={csvText}
            onChange={handleCSVTextChange}
          />

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleParseCSV}
            disabled={parsingCSV || (!csvFile && csvText.trim() === '')}
          >
            {parsingCSV ? <CircularProgress size={24} /> : 'Parse CSV'}
          </Button>

          {parsedUpdates.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Preview of Parsed Updates ({parsedUpdates.length} rows)
              </Typography>
              <Paper sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(parsedUpdates[0]).map((header, idx) => (
                        <TableCell key={idx} sx={{ fontWeight: 'bold' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedUpdates.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.keys(row).map((key, index) => (
                          <TableCell
                            key={index}
                            style={{
                              border: '1px solid #ccc',
                              padding: '8px'
                            }}
                          >
                            {row[key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleConfirmUpdate}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Confirm Update'}
              </Button>

              {updating && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={updateProgress} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {updateProgress}% completed
                  </Typography>
                </Box>
              )}

              {updateMessage && (
                <Typography variant="body1" sx={{ mt: 2, color: 'primary.main' }}>
                  {updateMessage}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </TabPanel>
    </Container>
  );
}
