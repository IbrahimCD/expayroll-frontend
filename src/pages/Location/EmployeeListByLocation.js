// frontend/src/pages/Location/EmployeeListByLocation.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Vintage/classic theme colors
const HEADING_COLOR = '#5e4b33'; // Warm brown
const BUTTON_COLOR = '#c1a266'; // Gold accent

export default function EmployeeListByLocation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get(`/locations/${id}/employees`);
        setEmployees(res.data || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, [id]);

  // Helper function to return a color based on employee status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Employed':
        return 'green';
      case 'On Leave':
        return 'orange';
      case 'Left':
        return 'red';
      default:
        return 'grey';
    }
  };

  return (
    <Container sx={{ mt: 4, fontFamily: `'Merriweather', serif` }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 'bold', color: HEADING_COLOR }}
      >
        Employees in Location
      </Typography>

      <Grid container spacing={3}>
        {employees.map((emp) => {
          const displayName =
            emp.preferredName || emp.firstName || emp.lastName || 'U';
          return (
            <Grid item xs={12} sm={6} md={4} key={emp._id}>
              <Card
                sx={{
                  textAlign: 'center',
                  // Vintage parchment style
                  backgroundColor: 'rgb(253, 253, 253)',
                  border: '1px solidrgb(255, 255, 255)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  borderRadius: 2,
                  fontFamily: `'Merriweather', serif`,
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/employees/details/${emp._id}`)}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 1,
                        backgroundColor: '#e0d2be', // subtle beige if no image
                      }}
                      src={emp.profilePic || undefined}
                    >
                      {displayName.charAt(0)}
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{ color: HEADING_COLOR, fontWeight: 'bold' }}
                    >
                      {displayName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: HEADING_COLOR }}>
                      {emp.email}
                    </Typography>
                    <Typography variant="body2" sx={{ color: HEADING_COLOR }}>
                      Phone: {emp.mobileNo || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: HEADING_COLOR }}>
                      Payroll ID: {emp.payrollId || 'N/A'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: getStatusColor(emp.status),
                        fontWeight: 'bold',
                        mt: 1,
                      }}
                    >
                      Status: {emp.status}
                    </Typography>
                    {emp.payStructure && emp.payStructure.payStructureName && (
                      <Chip
                        label={`Pay Structure: ${emp.payStructure.payStructureName}`}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: BUTTON_COLOR,
                          color: '#fff',
                          fontFamily: `'Merriweather', serif`,
                        }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}

        {employees.length === 0 && (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              sx={{ fontFamily: `'Merriweather', serif` }}
            >
              No employees found for this location.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/locations')}
          sx={{
            mt: 2,
            bgcolor: BUTTON_COLOR,
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: 'none',
            fontFamily: `'Merriweather', serif`,
            ':hover': {
              bgcolor: '#ae8e55',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },
          }}
        >
          Back to Locations
        </Button>
      </Box>
    </Container>
  );
}
