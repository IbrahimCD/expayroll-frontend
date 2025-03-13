import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Box } from '@mui/material';
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
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper>
          <List>
            {notifications.map((notif) => (
              <ListItem key={notif._id}>
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
