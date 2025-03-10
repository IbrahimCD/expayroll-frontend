// src/pages/LoginSignup/VerificationModal.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography } from '@mui/material';
import api from '../../services/api';

function VerificationModal({ open, email, onClose, onSuccess }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    try {
      const res = await api.post('/auth/verify', { email, verificationCode });
      // If verification succeeds, you may automatically log in the user here
      onSuccess();
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Verification Code</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Verification code sent to provider for email: <strong>{email}</strong>
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Verification Code"
          type="text"
          fullWidth
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        {errorMsg && (
          <Typography color="error" variant="body2" mt={1}>
            {errorMsg}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleVerify} variant="contained" color="primary">
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VerificationModal;
