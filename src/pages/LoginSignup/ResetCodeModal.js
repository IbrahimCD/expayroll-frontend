// src/pages/LoginSignup/ResetCodeModal.js
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { keyframes } from '@mui/system';
import NewPasswordModal from './NewPasswordModal';

// Optional gentle fadeIn for the dialog if you'd like
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function ResetCodeModal({ open, email, onClose }) {
  const [resetCode, setResetCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openNewPasswordModal, setOpenNewPasswordModal] = useState(false);

  const handleSubmit = () => {
    if (resetCode.trim() === '') {
      setErrorMsg('Reset code cannot be empty');
    } else {
      setOpenNewPasswordModal(true);
    }
  };

  const handleClose = () => {
    setResetCode('');
    setErrorMsg('');
    onClose();
  };

  const handleNewPasswordSuccess = () => {
    setOpenNewPasswordModal(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        // Vintage style overrides
        sx={{
          '& .MuiDialog-paper': {
            // parchment background
            backgroundColor: 'rgba(255, 250, 240, 0.9)',
            border: '1px solid #c1b099',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            borderRadius: 2,
            fontFamily: `'Merriweather', serif`,
            animation: `${fadeIn} 0.5s ease-out`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#5e4b33',
            fontFamily: 'Merriweather, serif',
            fontWeight: 'bold',
          }}
        >
          Enter Reset Code
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" gutterBottom sx={{ fontFamily: 'Merriweather, serif' }}>
            A reset code has been sent for email: <strong>{email}</strong>
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reset Code"
            type="text"
            fullWidth
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Merriweather, serif',
              },
            }}
          />
          {errorMsg && (
            <Typography color="error" variant="body2" mt={1} sx={{ fontFamily: 'Merriweather, serif' }}>
              {errorMsg}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              fontFamily: 'Merriweather, serif',
              ':hover': { textDecoration: 'underline' },
            }}
          >
            Cancel
          </Button>
          {/* Vintage accent button */}
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#c1a266',
              color: '#fff',
              fontFamily: 'Merriweather, serif',
              fontWeight: 'bold',
              boxShadow: 'none',
              ':hover': {
                bgcolor: '#ae8e55',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
            }}
          >
            Submit Code
          </Button>
        </DialogActions>
      </Dialog>

      <NewPasswordModal
        open={openNewPasswordModal}
        email={email}
        resetCode={resetCode}
        onClose={handleNewPasswordSuccess}
      />
    </>
  );
}

export default ResetCodeModal;
