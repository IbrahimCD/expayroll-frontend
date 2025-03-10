// src/pages/Timesheet/BatchCreateTimesheetPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  TextField,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import api from '../../services/api';

export default function BatchCreateTimesheetPage() {
  const navigate = useNavigate();

  // CSV File or CSV text
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');

  // Parsing states
  const [parsedData, setParsedData] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState('');

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');

  // For "quick parse" (no editing) vs "detailed parse" (with editing)
  const [detailedMode, setDetailedMode] = useState(true);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setCsvText('');
    setParsedData([]);
    setParsing(false);
    setParseMessage('');
    setUploadMessage('');
  };

  const parseCSVFile = () => {
    if (!csvFile) {
      setParseMessage('No CSV file selected.');
      return;
    }
    setParsing(true);
    setParseMessage('Parsing CSV file...');
    setParsedData([]);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsing(false);
        setParsedData(results.data);
        setParseMessage(`Parsed ${results.data.length} rows from file.`);
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        setParsing(false);
        setParseMessage('Error parsing CSV file.');
      }
    });
  };

  const parseCSVText = () => {
    if (!csvText.trim()) {
      setParseMessage('Please paste CSV text first.');
      return;
    }
    setParsing(true);
    setParseMessage('Parsing CSV text...');
    setParsedData([]);

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsing(false);
        setParsedData(results.data);
        setParseMessage(`Parsed ${results.data.length} rows from text.`);
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        setParsing(false);
        setParseMessage('Error parsing CSV text.');
      }
    });
  };

  // If user doesn't want to see/edit all rows, just do "quick parse"
  const handleToggleMode = () => {
    setDetailedMode(!detailedMode);
  };

  // We'll do the actual POST to /timesheets/batch
  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setUploadMessage('No parsed data to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage('');

    try {
      // We assume the CSV has the same timesheetName, StartDate, EndDate, WorkLocation in each row
      // Or we can just read from the first row. 
      // If the user truly put them in each row, we can pick row[0].
      const firstRow = parsedData[0];

      const timesheetName = firstRow.TimesheetName || 'Unknown Timesheet';
      const startDate = firstRow.StartDate || '';
      const endDate = firstRow.EndDate || '';
      // If you want a separate column for "workLocation", parse it here:
      // For example, if there's a "WorkLocation" column
      // Otherwise, you might pass a location code from each row or skip it:
      let workLocation = firstRow.WorkLocation || '';

      // Build "entries" array from all rows
      const entries = parsedData.map((row) => ({
        employeeName: row.EmployeeName || '',
        payrollId: row.PayrollID || '',
        baseLocation: row.BaseLocation || '',
        hoursWorked: row.HoursWorked || 'N/A',
        daysWorked: row.DaysWorked || 'N/A',
        extraShift: row.ExtraShift || 'N/A',
        addition: row.Addition || 'N/A',
        deduction: row.Deduction || 'N/A',
        notes: row.Notes || 'N/A'
      }));

      // Single request (if you want chunking, do it similarly to your employees approach)
      const payload = {
        timesheetName,
        startDate,
        endDate,
        workLocation,
        entries
      };

      // Post it
      await api.post('/timesheets/batch', payload);

      setUploadMessage('Batch timesheets created successfully!');
      // Optionally navigate
      navigate('/timesheets');
    } catch (err) {
      console.error('Error uploading timesheets:', err);
      setUploadMessage(
        err.response?.data?.message || 'Failed to create batch timesheets.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Batch Create Timesheets
        </Typography>

        {/* Toggle quick parse vs detailed parse */}
        <Button variant="outlined" onClick={handleToggleMode} sx={{ mb: 2 }}>
          {detailedMode
            ? 'Switch to Quick Parse (No Preview/Edit)'
            : 'Switch to Detailed Parse (Preview/Edit)'}
        </Button>

        {/* 1) Upload CSV or Paste CSV */}
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" component="label" sx={{ mr: 2 }}>
            Upload CSV File
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>
          {csvFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {csvFile.name}
            </Typography>
          )}
          <Button
            variant="outlined"
            onClick={parseCSVFile}
            disabled={!csvFile || parsing}
            sx={{ ml: 2 }}
          >
            Parse CSV File
          </Button>
        </Box>

        <Typography variant="h6">Or Paste CSV Text:</Typography>
        <TextField
          label="Paste CSV here"
          multiline
          rows={4}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          fullWidth
          disabled={parsing}
          sx={{ mt: 1 }}
        />
        <Button
          variant="outlined"
          onClick={parseCSVText}
          disabled={parsing}
          sx={{ mt: 1 }}
        >
          Parse CSV Text
        </Button>

        {/* Parsing message */}
        {parseMessage && (
          <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
            {parseMessage}
          </Typography>
        )}

        {/* If detailed mode, show the preview */}
        {detailedMode && parsedData.length > 0 && (
          <Box sx={{ mt: 3, maxHeight: 400, overflowY: 'auto' }}>
            <Typography variant="h6">Parsed Rows (Editable)</Typography>
            {parsedData.map((row, idx) => (
              <Paper
                key={idx}
                sx={{ p: 2, mb: 2, borderLeft: '4px solid #1976d2' }}
              >
                <Typography variant="subtitle1">
                  Row #{idx + 1}
                </Typography>
                <TextField
                  label="TimesheetName"
                  value={row.TimesheetName || ''}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].TimesheetName = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="StartDate"
                  value={row.StartDate || ''}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].StartDate = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="EndDate"
                  value={row.EndDate || ''}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].EndDate = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="EmployeeName"
                  value={row.EmployeeName || ''}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].EmployeeName = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="PayrollID"
                  value={row.PayrollID || ''}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].PayrollID = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="BaseLocation"
                  value={row.BaseLocation || ''}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].BaseLocation = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="HoursWorked"
                  value={row.HoursWorked || 'N/A'}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].HoursWorked = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="DaysWorked"
                  value={row.DaysWorked || 'N/A'}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].DaysWorked = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="ExtraShift"
                  value={row.ExtraShift || 'N/A'}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].ExtraShift = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Addition"
                  value={row.Addition || 'N/A'}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].Addition = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Deduction"
                  value={row.Deduction || 'N/A'}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].Deduction = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Notes"
                  value={row.Notes || 'N/A'}
                  onChange={(e) => {
                    const updated = [...parsedData];
                    updated[idx].Notes = e.target.value;
                    setParsedData(updated);
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              </Paper>
            ))}
          </Box>
        )}

        {/* 2) Upload button */}
        {parsedData.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleUpload} disabled={uploading}>
              {uploading ? <CircularProgress size={24} /> : 'Upload Timesheets'}
            </Button>
          </Box>
        )}

        {/* 3) Upload progress */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="indeterminate" />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uploading...
            </Typography>
          </Box>
        )}

        {/* 4) Upload message */}
        {uploadMessage && (
          <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
            {uploadMessage}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
