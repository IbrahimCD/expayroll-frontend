import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Card, CardContent, Divider, Box, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CreateLocation() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/locations', { code, name });
      setMessage(res.data.message);
      navigate('/locations');
    } catch (error) {
      console.error('Create Location error:', error);
      setMessage(error.response?.data?.message || 'Error creating location.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grow in timeout={1000}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Create Location
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
                  Save Location
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
      </Grow>
    </Container>
  );
}
