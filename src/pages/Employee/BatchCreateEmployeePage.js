import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  TextField,
  Grid,
  Divider,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import api from '../../services/api';
import Confetti from 'react-confetti';

export default function BatchCreateEmployeePage() {
  const navigate = useNavigate();

  // CSV file and text states
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');

  // Parsed data is an array of employee objects
  const [parsedData, setParsedData] = useState([]);

  // Parsing and upload states
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Mode: if true, user wants to edit the parsed data; if false, quick parse (no editable preview)
  const [editMode, setEditMode] = useState(true);

  // For measuring confetti area
  const confettiRef = useRef(null);
  const [confettiSize, setConfettiSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (confettiRef.current) {
      setConfettiSize({
        width: confettiRef.current.offsetWidth,
        height: confettiRef.current.offsetHeight
      });
    }
  }, [confettiRef]);

  // Handle file selection
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
    setCsvText('');
    setParsedData([]);
    setMessage('');
    setParsing(false);
    setParseProgress(0);
    setShowConfetti(false);
  };

  /**
   * Shared CSV parsing function.
   * Uses PapaParse with web worker and chunking.
   * @param {object} options - { file, text, isEditMode }
   */
  const parseCSV = ({ file, text, isEditMode }) => {
    setEditMode(isEditMode);
    setParsing(true);
    setMessage('Parsing CSV in chunks...');
    setParsedData([]);
    setParseProgress(0);

    Papa.parse(file || text, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunkSize: 1000,
      chunk: (results) => {
        setParsedData((prev) => [...prev, ...results.data]);
        setParseProgress((prevCount) => prevCount + results.data.length);
        setMessage(`Parsed ${parseProgress + results.data.length} rows so far...`);
      },
      complete: () => {
        setParsing(false);
        const totalRows = parseProgress + parsedData.length;
        setMessage(`Finished parsing! Total rows: ${totalRows}.`);
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        setMessage('Error parsing CSV.');
        setParsing(false);
      }
    });
  };

  // Functions to parse CSV from file
  const parseCSVFileEditable = () => {
    if (!csvFile) {
      setMessage('Please upload a CSV file first.');
      return;
    }
    parseCSV({ file: csvFile, text: null, isEditMode: true });
  };

  const parseCSVFileQuick = () => {
    if (!csvFile) {
      setMessage('Please upload a CSV file first.');
      return;
    }
    parseCSV({ file: csvFile, text: null, isEditMode: false });
  };

  // Functions to parse CSV from pasted text
  const parseCSVTextEditable = () => {
    if (!csvText.trim()) {
      setMessage('Please paste CSV text first.');
      return;
    }
    parseCSV({ file: null, text: csvText, isEditMode: true });
  };

  const parseCSVTextQuick = () => {
    if (!csvText.trim()) {
      setMessage('Please paste CSV text first.');
      return;
    }
    parseCSV({ file: null, text: csvText, isEditMode: false });
  };

  // Update a cell in parsed data (only in edit mode)
  const handleFieldChange = (rowIndex, field, value) => {
    if (!editMode) return;
    const updated = [...parsedData];
    updated[rowIndex][field] = value;
    setParsedData(updated);
  };

  // Utility to chunk an array into smaller arrays
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // Submit batch data to the backend in chunks
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parsedData.length === 0) {
      setMessage('No data to submit. Please parse CSV first.');
      return;
    }

    setLoading(true);
    setShowConfetti(false);
    setMessage('');
    setUploadProgress(0);

    // Chunk the data (e.g., 10 records per chunk)
    const chunkSize = 10;
    const chunks = chunkArray(parsedData, chunkSize);
    const totalChunks = chunks.length;
    const totalRecords = parsedData.length;
    let totalUploaded = 0;

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = chunks[i];
        setMessage(`Uploading chunk ${i + 1} of ${totalChunks} (${chunk.length} records)...`);
        await api.post('/employees/batch', { employees: chunk });
        totalUploaded += chunk.length;
        const progressPercent = Math.round(((i + 1) / totalChunks) * 100);
        setUploadProgress(progressPercent);
        setMessage(`Chunk ${i + 1} complete! Uploaded ${totalUploaded} of ${totalRecords} records.`);
      }
      setMessage('All employees uploaded successfully! 🎉');
      setShowConfetti(true);
      navigate('/employees');
    } catch (err) {
      console.error('Batch Create Error:', err);
      setMessage(err.response?.data?.message || 'Failed to create employees.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }} ref={confettiRef}>
      {showConfetti && (
        <Confetti
          width={confettiSize.width}
          height={confettiSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.4}
        />
      )}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Batch Create Employees
        </Typography>

        {/* 1) CSV File Upload */}
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" component="label" sx={{ mr: 2 }}>
            Upload CSV File
            <input type="file" hidden accept=".csv" onChange={handleFileChange} />
          </Button>
          {csvFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {csvFile.name}
            </Typography>
          )}
          <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={parseCSVFileEditable}
              disabled={!csvFile || parsing}
            >
              {parsing ? 'Parsing...' : 'Parse CSV (Editable)'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={parseCSVFileQuick}
              disabled={!csvFile || parsing}
            >
              {parsing ? 'Parsing...' : 'Quick Parse (No Edit)'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 2) Paste CSV Text */}
        <Typography variant="h6">Or Paste CSV Text Below:</Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            label="Paste CSV here"
            multiline
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            fullWidth
            disabled={parsing}
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={parseCSVTextEditable}
              disabled={parsing}
            >
              {parsing ? 'Parsing...' : 'Parse Text (Editable)'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={parseCSVTextQuick}
              disabled={parsing}
            >
              {parsing ? 'Parsing...' : 'Quick Parse (No Edit)'}
            </Button>
          </Box>
        </Box>

        {/* 3) Parsing Progress Bar */}
        {parsing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="indeterminate" />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Parsing in progress...
            </Typography>
          </Box>
        )}

        {/* 4) Preview & Edit or Summary */}
        {parsedData.length > 0 && !parsing && (
          <Box sx={{ mt: 3 }}>
            {editMode ? (
              <>
                <Typography variant="h6">
                  Parsed Employee Data Preview (Editable):
                </Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                  {parsedData.map((row, rowIndex) => (
                    <Paper
                      key={rowIndex}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderLeft: '4px solid #1976d2',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Employee #{rowIndex + 1}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="First Name"
                            value={row.firstName || ''}
                            onChange={(e) =>
                              handleFieldChange(rowIndex, 'firstName', e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Last Name"
                            value={row.lastName || ''}
                            onChange={(e) =>
                              handleFieldChange(rowIndex, 'lastName', e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Preferred Name"
                            value={row.preferredName || ''}
                            onChange={(e) =>
                              handleFieldChange(rowIndex, 'preferredName', e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                        {/* Add additional editable fields as needed */}
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              </>
            ) : (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="h6">
                  Quick Parse Summary:
                </Typography>
                <Typography variant="body1">
                  Total Employees Parsed: {parsedData.length}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* 5) Submit Button & Upload Progress */}
        {parsedData.length > 0 && !parsing && (
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Employees'}
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {uploadProgress}% completed
            </Typography>
          </Box>
        )}
        {message && (
          <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}
