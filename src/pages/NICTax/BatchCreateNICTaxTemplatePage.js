// src/pages/NICTax/BatchCreateNICTaxTemplatePage.jsx

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
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import Papa from 'papaparse';
import api from '../../services/api';

export default function BatchCreateNICTaxTemplatePage() {
  // NIC/Tax record-level fields
  const [recordName, setRecordName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [baseLocationId, setBaseLocationId] = useState('');

  // For location dropdown
  const [locations, setLocations] = useState([]);

  // The array of employees for the template
  const [templateData, setTemplateData] = useState([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // CSV upload states
  const [csvFile, setCsvFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Copy/paste CSV states
  const [pastedCSV, setPastedCSV] = useState('');
  const [pastedMessage, setPastedMessage] = useState('');

  // Parsed rows from either file or paste
  const [parsedRows, setParsedRows] = useState([]);

  useEffect(() => {
    // Fetch locations on mount
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        setLocations(res.data || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setMessage('Error fetching locations.');
      }
    };
    fetchLocations();
  }, []);

  // Generate NIC/Tax Template
  const handleGenerateTemplate = async () => {
    if (!recordName || !startDate || !endDate || !baseLocationId) {
      setMessage('Please fill all fields: recordName, start/end date, base location.');
      return;
    }
    setLoading(true);
    setTemplateData([]);
    setMessage('Generating template...');

    try {
      const res = await api.get('/nictax/template-employees', {
        params: { locationId: baseLocationId }
      });
      const employees = res.data.employees || [];
      setTemplateData(employees);
      setMessage(`Template generated with ${employees.length} row(s). You can now download CSV.`);
    } catch (err) {
      console.error('Error generating NIC/Tax template:', err);
      setMessage('Error generating template.');
    } finally {
      setLoading(false);
    }
  };

  // Download CSV
  const handleDownloadCSV = () => {
    if (!templateData.length) {
      setMessage('No template data to download.');
      return;
    }
    const csvRows = templateData.map((emp) => ({
      RecordName: recordName,
      StartDate: startDate,
      EndDate: endDate,
      BaseLocationId: baseLocationId,
      EmployeeId: emp.employeeId,
      EesNIC: emp.eesNIC,
      ErNIC: emp.erNIC,
      EesTax: emp.eesTax,
      Notes: emp.notes
    }));
    const csv = Papa.unparse(csvRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nictax_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File Upload
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0] || null);
  };

  const handleUploadCSV = () => {
    if (!csvFile) {
      setUploadMessage('Please select a CSV file.');
      return;
    }
    setUploadLoading(true);
    setUploadMessage('Parsing CSV...');

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!results.data?.length) {
          setUploadMessage('No rows found in CSV.');
          setUploadLoading(false);
          return;
        }
        setParsedRows(results.data);
        setUploadMessage(
          'File parsed successfully! Preview below. Click "Create from Parsed CSV" to proceed.'
        );
        setUploadLoading(false);
      },
      error: (err) => {
        console.error('Papa Parse error:', err);
        setUploadMessage(`CSV parse error: ${err.message}`);
        setUploadLoading(false);
      }
    });
  };

  // Copy/Paste CSV
  const handlePasteCSV = () => {
    if (!pastedCSV.trim()) {
      setPastedMessage('Please paste some CSV data first.');
      return;
    }
    try {
      const results = Papa.parse(pastedCSV.trim(), {
        header: true,
        skipEmptyLines: true
      });
      if (!results.data?.length) {
        setPastedMessage('No rows found in the pasted CSV text.');
        return;
      }
      setParsedRows(results.data);
      setPastedMessage(
        'Pasted CSV parsed successfully! Preview below. Click "Create from Parsed CSV" to proceed.'
      );
    } catch (err) {
      console.error('Papa parse error:', err);
      setPastedMessage(`Error parsing pasted CSV: ${err.message}`);
    }
  };

  // Create from parsed CSV
  const handleCreateFromParsed = async () => {
    if (!parsedRows.length) {
      setUploadMessage('No parsed data available to create.');
      return;
    }
    setUploadLoading(true);
    setUploadMessage('Creating NIC/Tax from parsed CSV data...');

    try {
      const firstRow = parsedRows[0];
      const payload = {
        recordName: firstRow.RecordName,
        startDate: firstRow.StartDate,
        endDate: firstRow.EndDate,
        baseLocationId: firstRow.BaseLocationId,
        entries: parsedRows.map((r) => ({
          employeeId: r.EmployeeId,
          eesNIC: r.EesNIC,
          erNIC: r.ErNIC,
          eesTax: r.EesTax,
          notes: r.Notes
        }))
      };

      const res = await api.post('/nictax/batch', payload);
      setUploadMessage(
        `Batch NIC/Tax created: ${res.data.nictax?.recordName}, with ${res.data.nictax?.entries?.length} entries.`
      );
      setParsedRows([]);
    } catch (err) {
      console.error('Error in NIC/Tax batch creation:', err);
      const errMsg = err.response?.data?.message || 'Failed to create NIC/Tax.';
      setUploadMessage(`Error: ${errMsg}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        backgroundColor: '#fff',
        py: 2
      }}
    >
      {/* SECTION A: Generate Template */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: 3,
          transition: 'transform 0.25s ease',
          '&:hover': { transform: 'translateY(-2px)' }
        }}
      >
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', letterSpacing: 0.5 }}>
          Batch Create NIC & Tax Records
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.5 }}>
          Generate a CSV template for employees, fill in NIC/Tax fields, then upload or paste CSV
          to create a single record.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Record Name"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
            required
            sx={{
              flex: 1,
              minWidth: 220,
              backgroundColor: '#fff'
            }}
          />
          <TextField
            label="Start Date (YYYY-MM-DD)"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ flex: 1, minWidth: 180, backgroundColor: '#fff' }}
          />
          <TextField
            label="End Date (YYYY-MM-DD)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ flex: 1, minWidth: 180, backgroundColor: '#fff' }}
          />
          <FormControl required sx={{ minWidth: 200, flex: 1, backgroundColor: '#fff' }}>
            <InputLabel>Base Location</InputLabel>
            <Select
              label="Base Location"
              value={baseLocationId}
              onChange={(e) => setBaseLocationId(e.target.value)}
              sx={{
                transition: 'box-shadow 0.3s',
                '&:focus-within': {
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
                }
              }}
            >
              {locations.map((loc) => (
                <MenuItem key={loc._id} value={loc._id}>
                  {loc.name || loc.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleGenerateTemplate}
            disabled={loading}
            sx={{
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Template'}
          </Button>
        </Box>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
        {loading && <LinearProgress sx={{ mt: 1 }} />}

        {/* Template Preview */}
        {templateData.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold', letterSpacing: 0.3 }}>
              Template Preview
            </Typography>
            <TableContainer
              sx={{
                mt: 2,
                maxHeight: 300,
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: 1
              }}
              component={Paper}
              elevation={0}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>E'es NIC</TableCell>
                    <TableCell>E'er NIC</TableCell>
                    <TableCell>E'es Tax</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templateData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{row.employeeId}</TableCell>
                      <TableCell>{row.eesNIC}</TableCell>
                      <TableCell>{row.erNIC}</TableCell>
                      <TableCell>{row.eesTax}</TableCell>
                      <TableCell>{row.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleDownloadCSV}
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                Download CSV Template
              </Button>
            </Box>
          </>
        )}
      </Paper>

      {/* SECTION B: File Upload */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: 3,
          transition: 'transform 0.25s ease',
          '&:hover': { transform: 'translateY(-2px)' }
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 0.3 }}>
          Option 1: Upload CSV File
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <Button
            variant="contained"
            onClick={handleUploadCSV}
            disabled={uploadLoading}
            sx={{
              width: 'fit-content',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Upload CSV File & Parse'}
          </Button>
        </Box>
        {uploadMessage && <Typography sx={{ mt: 2 }}>{uploadMessage}</Typography>}
      </Paper>

      {/* SECTION C: Copy/Paste CSV */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: 3,
          transition: 'transform 0.25s ease',
          '&:hover': { transform: 'translateY(-2px)' }
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 0.3 }}>
          Option 2: Paste CSV Text
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Paste the entire CSV text below and then click “Parse Pasted CSV.”
        </Typography>
        <TextField
          label="Paste CSV data here"
          multiline
          minRows={6}
          fullWidth
          value={pastedCSV}
          onChange={(e) => setPastedCSV(e.target.value)}
          sx={{
            backgroundColor: '#fff',
            transition: 'box-shadow 0.3s',
            '&:focus-within': {
              boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
            }
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handlePasteCSV}
            sx={{
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Parse Pasted CSV
          </Button>
        </Box>
        {pastedMessage && <Typography sx={{ mt: 2 }}>{pastedMessage}</Typography>}
      </Paper>

      {/* SECTION D: Parsed CSV Preview & Create */}
      {parsedRows.length > 0 && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: '#fff',
            boxShadow: 3,
            transition: 'transform 0.25s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: 0.3 }}>
            Parsed CSV Preview
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            The first row’s fields (RecordName, StartDate, EndDate, BaseLocationId) define the NIC/Tax record.
          </Typography>
          <TableContainer
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: 1
            }}
            component={Paper}
            elevation={0}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>RecordName</TableCell>
                  <TableCell>StartDate</TableCell>
                  <TableCell>EndDate</TableCell>
                  <TableCell>BaseLocationId</TableCell>
                  <TableCell>EmployeeId</TableCell>
                  <TableCell>EesNIC</TableCell>
                  <TableCell>ErNIC</TableCell>
                  <TableCell>EesTax</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.RecordName}</TableCell>
                    <TableCell>{row.StartDate}</TableCell>
                    <TableCell>{row.EndDate}</TableCell>
                    <TableCell>{row.BaseLocationId}</TableCell>
                    <TableCell>{row.EmployeeId}</TableCell>
                    <TableCell>{row.EesNIC}</TableCell>
                    <TableCell>{row.ErNIC}</TableCell>
                    <TableCell>{row.EesTax}</TableCell>
                    <TableCell>{row.Notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleCreateFromParsed}
              disabled={uploadLoading}
              sx={{
                transition: 'transform 0.3s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              {uploadLoading ? <CircularProgress size={24} /> : 'Create from Parsed CSV'}
            </Button>
          </Box>

          {uploadMessage && <Typography sx={{ mt: 2 }}>{uploadMessage}</Typography>}
        </Paper>
      )}
    </Container>
  );
}
