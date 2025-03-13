// src/pages/Notifications/NotificationList.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Box, CircularProgress, Button } from '@mui/material';
import api from '../../services/api';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Button variant="contained" onClick={fetchNotifications} sx={{ mb: 2 }}>
        Refresh
      </Button>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <List>
            {notifications.map((notif) => (
              <ListItem key={notif._id} divider>
                <ListItemText
                  primary={notif.message}
                  secondary={new Date(notif.createdAt).toLocaleString()}
                />
              </ListItem>
            ))}
            {notifications.length === 0 && (
              <ListItem>
                <ListItemText primary="No notifications found." />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Container>
  );
}
