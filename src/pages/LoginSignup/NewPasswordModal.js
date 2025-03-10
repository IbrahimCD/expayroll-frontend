// src/pages/LoginSignup/NewPasswordModal.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography } from '@mui/material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function NewPasswordModal({ open, email, resetCode, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (newPassword.trim() === '') {
      setErrorMsg('Password cannot be empty');
      return;
    }
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword
      });
      // Optionally show a success message
      onClose();
      navigate('/');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Password reset failed');
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Set New Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="New Password"
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {errorMsg && (
          <Typography color="error" variant="body2" mt={1}>
            {errorMsg}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NewPasswordModal;
