// frontend/src/pages/Locations/LocationList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  IconButton,
  Button,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Fade,
  Grow
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { styled } from '@mui/system';

// Define a minimal page background with ample whitespace
const PageBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f7f7f7',
  padding: theme.spacing(4, 0),
}));

// Memoized list item for performance
const MinimalListItem = React.memo(({ location, onEdit, onDelete, onView }) => (
  <Grow in={true} timeout={600}>
    <ListItem
      sx={{
        mb: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => onEdit(location._id)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton onClick={() => onDelete(location._id)} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" />
          </IconButton>
          <Button
            size="small"
            onClick={() => onView(location._id)}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              ':hover': { textDecoration: 'underline' },
            }}
          >
            View Employees
          </Button>
        </Box>
      }
    >
      <ListItemAvatar>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          {location.name.charAt(0).toUpperCase()}
        </Box>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
            {location.name}
          </Typography>
        }
        secondary={
          <>
            <Typography variant="body2" color="text.secondary">
              Code: {location.code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Employees: {location.employeeCount || 0}
            </Typography>
          </>
        }
        sx={{ ml: 2 }}
      />
    </ListItem>
  </Grow>
));

export default function LocationList() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');

  // Use useCallback to memoize fetchLocations for better performance
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await api.get('/locations');
      setLocations(res.data || []);
      setStatusMessage(`Loaded ${res.data.length} locations.`);
    } catch (error) {
      setErrorMessage('Error fetching locations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setStatusMessage('');
      setErrorMessage('');
      try {
        await api.delete(`/locations/${id}`);
        setLocations((prev) => prev.filter((loc) => loc._id !== id));
        setStatusMessage('Location deleted successfully.');
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Error deleting location.');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/locations/edit/${id}`);
  };

  const handleViewEmployees = (id) => {
    navigate(`/locations/${id}/employees`);
  };

  // Filter locations by search query (by name or code)
  const filteredLocations = locations.filter((loc) => {
    const lowerQuery = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(lowerQuery) ||
      (loc.code && loc.code.toLowerCase().includes(lowerQuery))
    );
  });

  return (
    <PageBackground>
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box>
            <Typography variant="h4" align="center" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
              Location List
            </Typography>
            {statusMessage && (
              <Typography align="center" sx={{ mb: 2, color: 'green', fontWeight: 'bold' }}>
                {statusMessage}
              </Typography>
            )}
            {errorMessage && (
              <Typography align="center" sx={{ mb: 2, color: 'red', fontWeight: 'bold' }}>
                {errorMessage}
              </Typography>
            )}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/locations/create')}
                sx={{
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  bgcolor: '#1976d2',
                  ':hover': { bgcolor: '#1565c0' },
                }}
              >
                Add New Location
              </Button>
            </Box>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <TextField
                label="Search Location"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: '100%', maxWidth: 400 }}
              />
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredLocations.map((loc) => (
                  <MinimalListItem
                    key={loc._id}
                    location={loc}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewEmployees}
                  />
                ))}
                {filteredLocations.length === 0 && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography>No locations found.</Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Fade>
      </Container>
    </PageBackground>
  );
}
