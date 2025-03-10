// src/pages/Dashboard/UserManagement/UserList.js
import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  IconButton,
  Avatar,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { AuthContext } from '../../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { keyframes } from '@mui/system';

// Define keyframes for the animated border
const borderAnimation = keyframes`
  0% { border-color: #ff4081; }
  50% { border-color: #1976d2; }
  100% { border-color: #ff4081; }
`;

function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState(''); // For searching
  const { token } = useContext(AuthContext);

  let userRole = null;
  if (token) {
    const decoded = jwtDecode(token);
    userRole = decoded.role;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.users || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  // Filtered list based on search text (matching name or email)
  const filteredUsers = users.filter((u) => {
    const lowerSearch = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(lowerSearch) ||
      u.email.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        User List
      </Typography>

      {/* Admin-only button to create new user */}
      {userRole === 'Admin' && (
        <Button
          variant="contained"
          onClick={() => navigate('/users/create')}
          sx={{ mb: 2 }}
        >
          Create New User
        </Button>
      )}

      {/* Search Field */}
      <TextField
        label="Search by Name or Email"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <List>
        {filteredUsers.map((u) => (
          <ListItem
            key={u._id}
            sx={{
              mb: 1,
              borderRadius: 2,
              boxShadow: 3,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0px 8px 20px rgba(0,0,0,0.3)'
              }
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={u.profilePic || undefined}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#f1f1f1',
                  fontSize: 24,
                  border: '3px solid transparent',
                  animation: `${borderAnimation} 3s infinite`,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {!u.profilePic && u.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>

            {/* Main user info */}
            <ListItemText
              primary={
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {u.name}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {u.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main' }}>
                    {u.role}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {u.status}
                  </Typography>
                </>
              }
              sx={{ ml: 2 }}
            />

            {/* Admin-only Edit/Delete */}
            {userRole === 'Admin' && (
              <Box sx={{ ml: 'auto' }}>
                <IconButton onClick={() => navigate(`/users/edit/${u._id}`)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(u._id)}>
                  <Delete color="error" />
                </IconButton>
              </Box>
            )}
          </ListItem>
        ))}

        {/* If no users match the search or there are no users */}
        {filteredUsers.length === 0 && (
          <ListItem>
            <ListItemText primary="No users found." />
          </ListItem>
        )}
      </List>
    </div>
  );
}

export default UserList;
