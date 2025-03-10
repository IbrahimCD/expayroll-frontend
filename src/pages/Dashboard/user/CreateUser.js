// src/pages/Dashboard/UserManagement/CreateUser.js
import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, MenuItem,  } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { AuthContext } from '../../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';


function CreateUser() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'Admin') {
        // If not admin, navigate away
        navigate('/users');
      }
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff'
  });
  const [message, setMessage] = useState('');

  const roles = ['Manager', 'Area Manager', 'Accountant', 'Staff'];

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/users', formData);
      setMessage(res.data.message);
      navigate('/users');
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || 'Error creating user');
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '20px auto', p: 2 }}>
      <CardContent>
        <Typography variant="h5" mb={2}>
          Create New User
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <TextField
            select
            fullWidth
            label="Role"
            name="role"
            variant="outlined"
            margin="normal"
            value={formData.role}
            onChange={handleChange}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          {message && (
            <Typography variant="body2" color="error" mt={1}>
              {message}
            </Typography>
          )}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Create
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CreateUser;
