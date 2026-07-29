// src/pages/Employee/DuplicatePayrollIdDialog.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import api from '../../services/api';

const displayName = (emp) =>
  emp.preferredName ||
  `${emp.firstName || ''} ${emp.lastName || ''}`.trim() ||
  'Unnamed';

/**
 * Lists every employee sharing a payroll ID and lets the user re-assign them
 * inline. Read-only until the user explicitly saves a row; each save is a
 * normal PUT /employees/:id carrying only the payrollId field.
 */
export default function DuplicatePayrollIdDialog({ open, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({}); // employeeId -> edited payroll id
  const [rowState, setRowState] = useState({}); // employeeId -> { saving, error }

  const fetchDuplicates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/employees/duplicate-payroll-ids');
      setData(res.data);

      const initial = {};
      (res.data.duplicates || []).forEach((group) => {
        group.employees.forEach((emp) => {
          initial[emp._id] = emp.payrollId || '';
        });
      });
      setDrafts(initial);
      setRowState({});
    } catch (err) {
      console.error('Error loading duplicate payroll IDs:', err);
      setError(
        err.response?.data?.message || 'Failed to load duplicate payroll IDs.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchDuplicates();
  }, [open, fetchDuplicates]);

  const handleSave = async (emp) => {
    const next = (drafts[emp._id] || '').trim();

    if (!next) {
      setRowState((s) => ({
        ...s,
        [emp._id]: { error: 'Payroll ID cannot be empty.' }
      }));
      return;
    }
    if (next === emp.payrollId) {
      setRowState((s) => ({
        ...s,
        [emp._id]: { error: 'This is the same ID. Enter a different one.' }
      }));
      return;
    }

    setRowState((s) => ({ ...s, [emp._id]: { saving: true } }));
    try {
      await api.put(`/employees/${emp._id}`, { payrollId: next });
      // Reload so resolved groups drop off the list immediately.
      await fetchDuplicates();
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Error updating payroll ID:', err);
      setRowState((s) => ({
        ...s,
        [emp._id]: {
          error: err.response?.data?.message || 'Failed to update payroll ID.'
        }
      }));
    }
  };

  const hasDuplicates = !!data && data.duplicates && data.duplicates.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontFamily: `'Merriweather', serif`, fontWeight: 'bold' }}>
        Duplicate Payroll IDs
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && !hasDuplicates && (
          <Alert severity="success">
            No duplicate payroll IDs found. Every employee with a payroll ID has
            a unique one.
          </Alert>
        )}

        {!loading && !error && hasDuplicates && (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>{data.affectedEmployees}</strong> employees share{' '}
              <strong>{data.duplicateGroups}</strong> payroll ID
              {data.duplicateGroups === 1 ? '' : 's'}. Timesheet batch imports
              match employees by payroll ID, so hours can be attributed to the
              wrong person until these are unique.
            </Alert>

            {data.duplicates.map((group) => (
              <Box key={group.payrollId} sx={{ mb: 3 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Payroll ID: {group.payrollId}
                  </Typography>
                  <Chip
                    label={`${group.count} employees`}
                    size="small"
                    color="warning"
                  />
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Base Location
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          New Payroll ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.employees.map((emp) => {
                        const state = rowState[emp._id] || {};
                        return (
                          <TableRow key={emp._id}>
                            <TableCell>{displayName(emp)}</TableCell>
                            <TableCell>{emp.email}</TableCell>
                            <TableCell>
                              {emp.baseLocationId?.name || 'N/A'}
                            </TableCell>
                            <TableCell>{emp.status || 'N/A'}</TableCell>
                            <TableCell sx={{ minWidth: 220 }}>
                              <TextField
                                size="small"
                                fullWidth
                                value={drafts[emp._id] ?? ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setDrafts((d) => ({ ...d, [emp._id]: v }));
                                  setRowState((s) => ({ ...s, [emp._id]: {} }));
                                }}
                                error={!!state.error}
                                helperText={state.error || ' '}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                disabled={!!state.saving}
                                onClick={() => handleSave(emp)}
                                sx={{
                                  bgcolor: '#5e4b33',
                                  ':hover': { bgcolor: '#3e352a' }
                                }}
                              >
                                {state.saving ? 'Saving...' : 'Save'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={fetchDuplicates} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#5e4b33' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
