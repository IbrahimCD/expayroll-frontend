// src/layout/MainLayout.js
import React from 'react';
import { Box, Container } from '@mui/material';
import NavBar from './NavBar';

function MainLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        fontFamily: `'Merriweather', serif`,
      }}
    >
      <NavBar />

      {/* 
        Use a Container with:
          - maxWidth={false} to span the entire width
          - disableGutters to remove default left/right padding
      */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          mt: 4, // optional top margin
          mb: 4  // optional bottom margin
        }}
      >
        {/* 
          This Box is your “white content area.”
          Feel free to adjust padding (p) or remove it if you want zero spacing there too.
        */}
        <Box
          sx={{
            backgroundColor: '#fff',
            p: 3,           // controls the inner padding
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}

export default MainLayout;
