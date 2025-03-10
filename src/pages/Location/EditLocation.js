import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Button, Card, CardContent, Divider, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function EditLocation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await api.get(`/locations/${id}`);
        setCode(res.data.code);
        setName(res.data.name);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };
    fetchLocation();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { code, name };
      const res = await api.put(`/locations/${id}`, payload);
      setMessage(res.data.message);
      navigate('/locations');
    } catch (error) {
      console.error('Error updating location:', error);
      setMessage(error.response?.data?.message || 'Error updating location.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Edit Location
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <form onSubmit={handleSubmit}>
            <TextField
              label="Location Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Location Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" type="submit">
                Update Location
              </Button>
            </Box>
          </form>
          {message && (
            <Typography sx={{ mt: 2, color: 'green' }}>
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
