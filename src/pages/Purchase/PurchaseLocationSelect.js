// frontend/src/pages/Purchase/PurchaseLocationSelect.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
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
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { styled } from '@mui/system';

const PageBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f7f7f7',
  padding: theme.spacing(4, 0),
}));

const MinimalListItem = React.memo(({ location, onSelect }) => (
  <Grow in={true} timeout={600}>
    <ListItem
      sx={{
        mb: 2,
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
      onClick={() => onSelect(location._id)}
    >
      <ListItemAvatar>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: '#fff',
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
          <Typography variant="body2" color="text.secondary">
            Code: {location.code}
          </Typography>
        }
        sx={{ ml: 2 }}
      />
    </ListItem>
  </Grow>
));

export default function PurchaseLocationSelect() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.get('/locations');
      setLocations(res.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setErrorMessage('Error fetching locations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSelectLocation = (locationId) => {
    navigate(`/purchases/${locationId}`);
  };

  // Filter locations by search query
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
              Select Location for Purchase Module
            </Typography>
            {errorMessage && (
              <Typography align="center" sx={{ mb: 2, color: 'red', fontWeight: 'bold' }}>
                {errorMessage}
              </Typography>
            )}
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
                    onSelect={handleSelectLocation}
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

