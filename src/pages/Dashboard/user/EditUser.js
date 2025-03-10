// src/pages/Dashboard/UserManagement/EditUser.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, MenuItem, Button } from '@mui/material';
import api from '../../../services/api';
import { jwtDecode } from 'jwt-decode';

import { AuthContext } from '../../../contexts/AuthContext';

function EditUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [userName, setUserName] = useState('');
  
  // Get token from context
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
  
  const roles = ['Manager', 'Area Manager', 'Accountant', 'Staff', 'Admin'];
  const statuses = ['active', 'inactive'];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users');
        const foundUser = res.data.users.find(u => u._id === userId);
        if (foundUser) {
          setRole(foundUser.role);
          setStatus(foundUser.status);
          setUserName(foundUser.name);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${userId}`, { role, status });
      navigate('/users');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '20px auto', p: 2 }}>
      <CardContent>
        <Typography variant="h5" mb={2}>
          Edit User: {userName}
        </Typography>
        <form onSubmit={handleUpdate}>
          <TextField
            select
            fullWidth
            label="Role"
            variant="outlined"
            margin="normal"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            {roles.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Status"
            variant="outlined"
            margin="normal"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statuses.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Update
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default EditUser;
