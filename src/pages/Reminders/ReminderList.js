// FILE: src/pages/Reminders/RemindersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Grow,
  Menu,
  Fade
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function RemindersPage() {
  const navigate = useNavigate();

  // ---------------------------------
  // State: Reminders, search, filters
  // ---------------------------------
  const [reminders, setReminders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Tab (0 = Active, 1 = Completed)
  const [tabIndex, setTabIndex] = useState(0);

  // Loading indicator
  const [loading, setLoading] = useState(false);

  // Status options & color mapping
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Overdue', 'Escalated'];
  const statusColorMap = {
    Pending: '#fff9c4',     // soft yellow
    'In Progress': '#ffe0b2',
    Overdue: '#ffcdd2',     // soft red
    Escalated: '#e0e0e0',   // gray
    Completed: '#c8e6c9'    // soft green
  };

  // ---------------------------------
  // For the 3-dot menu
  // ---------------------------------
  const [anchorEl, setAnchorEl] = useState(null);        // anchor for the Menu
  const [selectedReminder, setSelectedReminder] = useState(null); // store the clicked row's reminder

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event, reminder) => {
    // Prevent row-click navigation
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedReminder(reminder);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
    setSelectedReminder(null);
  };

  // ---------------------------------
  // Fetch reminders
  // ---------------------------------
  const fetchReminders = async (pageParam = 1) => {
    setLoading(true);
    try {
      const params = {
        search,
        status: statusFilter,
        page: pageParam,
        limit: 10
      };
      const res = await api.get('/reminders', { params });
      setReminders(res.data.reminders || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page]);

  // ---------------------------------
  // Navigation & row click
  // ---------------------------------
  const handleRowClick = (id) => {
    navigate(`/reminders/${id}`);
  };

  // ---------------------------------
  // Status change => update
  // ---------------------------------
  const handleStatusChange = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      await api.put(`/reminders/${id}`, { status: newStatus });
      fetchReminders(page);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // ---------------------------------
  // Edit & delete
  // ---------------------------------
  const handleEditReminder = (id, e) => {
    if (e) e.stopPropagation();
    navigate(`/reminders/edit/${id}`);
    handleMenuClose();
  };

  const handleDeleteReminder = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await api.delete(`/reminders/${id}`);
        fetchReminders(page);
      } catch (err) {
        console.error('Error deleting reminder:', err);
      }
    }
    handleMenuClose();
  };

  // ---------------------------------
  // Separate Active vs Completed
  // ---------------------------------
  const activeReminders = reminders.filter((rem) => rem.status !== 'Completed');
  const completedReminders = reminders.filter((rem) => rem.status === 'Completed');

  // ---------------------------------
  // Render table rows
  // ---------------------------------
  const renderRows = (rowData) =>
    rowData.map((reminder) => {
      const isCompleted = reminder.status === 'Completed';

      return (
        <TableRow
          key={reminder._id}
          hover
          onClick={() => handleRowClick(reminder._id)}
          style={{ cursor: 'pointer' }}
        >
          <TableCell>{reminder.employeeName}</TableCell>
          <TableCell>{reminder.note}</TableCell>
          <TableCell>{new Date(reminder.dueDate).toLocaleDateString()}</TableCell>
          <TableCell>
            {isCompleted ? (
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Completed
              </Typography>
            ) : (
              <FormControl size="small" fullWidth>
                <Select
                  value={reminder.status}
                  onChange={(e) => handleStatusChange(reminder._id, e.target.value, e)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    backgroundColor: statusColorMap[reminder.status] || 'inherit'
                  }}
                >
                  {statusOptions.map((statusOption) => (
                    <MenuItem
                      key={statusOption}
                      value={statusOption}
                      sx={{
                        backgroundColor: statusColorMap[statusOption] || 'inherit'
                      }}
                    >
                      {statusOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </TableCell>
          <TableCell>{reminder.isRecurring ? reminder.recurrenceInterval : 'No'}</TableCell>
          <TableCell
            align="center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Three-dots icon for menu */}
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, reminder)}
            >
              <MoreVertIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });

  // ---------------------------------
  // Main UI
  // ---------------------------------
  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Smooth Grow animation for the entire card */}
      <Grow in timeout={600}>
        <Card
          sx={{
            backgroundColor: '#fff',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            borderRadius: 3
          }}
        >
          <CardContent>
            {/* Page Title */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: '600',
                mb: 2,
                color: '#3f51b5'
              }}
            >
              Reminders
            </Typography>

            {/* Tabs for Active vs. Completed */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={tabIndex}
                onChange={(e, newValue) => setTabIndex(newValue)}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label={`Active (${activeReminders.length})`} id="active-tab" />
                <Tab label={`Completed (${completedReminders.length})`} id="completed-tab" />
              </Tabs>
            </Box>

            {/* Filter & Search */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexWrap: 'wrap',
                gap: 2,
                mb: 3
              }}
            >
              <TextField
                label="Search Reminders"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                sx={{ maxWidth: 220 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {statusOptions.map((statusOption) => (
                    <MenuItem key={statusOption} value={statusOption}>
                      {statusOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#3f51b5',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#303f9f'
                  }
                }}
                onClick={() => navigate('/reminders/create')}
              >
                Create Reminder
              </Button>
            </Box>

            {/* Table or Loading */}
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <Paper elevation={2} sx={{ overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Employee</strong></TableCell>
                      <TableCell><strong>Note</strong></TableCell>
                      <TableCell><strong>Due Date</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Recurring</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tabIndex === 0
                      ? renderRows(activeReminders)
                      : renderRows(completedReminders)}

                    {/* No items? */}
                    {tabIndex === 0 && activeReminders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No active reminders found.
                        </TableCell>
                      </TableRow>
                    )}
                    {tabIndex === 1 && completedReminders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No completed reminders found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      </Grow>

      {/* 3-dot Menu: Fade transition */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
      >
        {/* Conditionally show Edit only if not completed */}
        {selectedReminder && selectedReminder.status !== 'Completed' && (
          <MenuItem onClick={(e) => handleEditReminder(selectedReminder._id, e)}>
            Edit
          </MenuItem>
        )}
        <MenuItem onClick={(e) => handleDeleteReminder(selectedReminder?._id, e)}>
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
}
