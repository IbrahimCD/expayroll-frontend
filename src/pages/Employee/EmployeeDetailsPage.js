import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Grid,
  Chip
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

// Fade-in and slide-up animation
const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Pulsating gear glow behind the header text
const gearGlow = keyframes`
  0% { text-shadow: 0 0 5px #a88c5f; }
  50% { text-shadow: 0 0 20px #c1a266; }
  100% { text-shadow: 0 0 5px #a88c5f; }
`;

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');

  // Fetch employee details
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${employeeId}`);
        setEmployee(res.data.employee);
      } catch (err) {
        console.error('Error fetching employee details:', err);
        setError('Error fetching employee details');
      }
    };
    fetchEmployee();
  }, [employeeId]);

  // Fetch locations for lookup (base location, location access, etc.)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        setLocations(res.data || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Helper: Get a location object by its ID.
  const getLocationById = (id) => locations.find((loc) => loc._id === id);

  // Determine base location name.
  const baseLocationObj = employee?.baseLocationId ? getLocationById(employee.baseLocationId) : null;
  const baseLocationName = baseLocationObj
    ? (baseLocationObj.locationName || baseLocationObj.name || baseLocationObj.code)
    : 'N/A';

  if (error) {
    return (
      <Container sx={{ mt: 4, backgroundColor: '#fff' }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!employee) {
    return (
      <Container sx={{ mt: 4, backgroundColor: '#fff' }}>
        <Typography>Loading employee details...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, backgroundColor: '#fff', fontFamily: "'Merriweather', serif" }}>
      <Card
        sx={{
          borderRadius: 3,
          p: 2,
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          animation: `${fadeInUp} 0.8s ease-out`,
          backgroundColor: '#fff'
        }}
      >
        <CardContent>
          {/* Header with gear glow */}
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#a88c5f',
              animation: `${gearGlow} 3s infinite`
            }}
          >
            {employee.preferredName || `${employee.firstName} ${employee.lastName}`}
          </Typography>
          <Divider sx={{ mb: 2, borderColor: '#a88c5f' }} />

          {/* Basic Information Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold' }}>
              Basic Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>First Name:</strong> {employee.firstName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Last Name:</strong> {employee.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Preferred Name:</strong> {employee.preferredName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Gender:</strong> {employee.gender}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Date of Birth:</strong>{' '}
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Mobile:</strong> {employee.mobileNo || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Email:</strong> {employee.email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Address:</strong> {employee.address || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Payroll ID:</strong> {employee.payrollId || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Status:</strong> {employee.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Base Location:</strong> {baseLocationName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  <strong>Description:</strong> {employee.description || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Location Access Section */}
          {employee.locationAccess && employee.locationAccess.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>
                Location Access
              </Typography>
              <Box sx={{ mt: 1 }}>
                {employee.locationAccess.map((locId) => {
                  const locObj = getLocationById(locId);
                  return (
                    <Chip
                      key={locId}
                      label={locObj ? (locObj.locationName || locObj.name || locObj.code) : 'Unknown'}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Pay Structure Section */}
          {employee.payStructure && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold' }}>
                Pay Structure
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> {employee.payStructure.payStructureName || 'N/A'}
                </Typography>

                {/* Daily Rates Section */}
                {employee.payStructure.hasDailyRates && employee.payStructure.dailyRates && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Daily Rates:
                    </Typography>

                    {/* NI Daily Rates */}
                    <Box sx={{ mt: 1, ml: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        NI Daily Rates
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mode:</strong> {employee.payStructure.dailyRates.niDayMode || 'N/A'}
                      </Typography>
                      {employee.payStructure.dailyRates.niDayMode === 'ALL' &&
                        employee.payStructure.dailyRates.niRates && (
                          <>
                            <Typography variant="body2">
                              <strong>Regular Days:</strong> {employee.payStructure.dailyRates.niRates.regularDays}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Regular Day Rate:</strong> {employee.payStructure.dailyRates.niRates.regularDayRate}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Extra Day Rate:</strong> {employee.payStructure.dailyRates.niRates.extraDayRate}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Extra Shift Rate:</strong> {employee.payStructure.dailyRates.niRates.extraShiftRate}
                            </Typography>
                          </>
                        )}
                      {employee.payStructure.dailyRates.niDayMode === 'FIXED' &&
                        employee.payStructure.dailyRates.niRates && (
                          <>
                            <Typography variant="body2">
                              <strong>Regular Days:</strong> {employee.payStructure.dailyRates.niRates.regularDays}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Regular Day Rate:</strong> {employee.payStructure.dailyRates.niRates.regularDayRate}
                            </Typography>
                          </>
                        )}
                    </Box>

                    {/* Cash Daily Rates */}
                    <Box sx={{ mt: 2, ml: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Cash Daily Rates
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mode:</strong> {employee.payStructure.dailyRates.cashDayMode || 'N/A'}
                      </Typography>
                      {employee.payStructure.dailyRates.cashDayMode === 'ALL' &&
                        employee.payStructure.dailyRates.cashRates && (
                          <>
                            <Typography variant="body2">
                              <strong>Regular Days:</strong> {employee.payStructure.dailyRates.cashRates.regularDays}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Regular Day Rate:</strong> {employee.payStructure.dailyRates.cashRates.regularDayRate}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Extra Day Rate:</strong> {employee.payStructure.dailyRates.cashRates.extraDayRate}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Extra Shift Rate:</strong> {employee.payStructure.dailyRates.cashRates.extraShiftRate}
                            </Typography>
                          </>
                        )}
                    </Box>
                  </Box>
                )}

                {/* Hourly Rates Section */}
                {employee.payStructure.hasHourlyRates && employee.payStructure.hourlyRates && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Hourly Rates:
                    </Typography>
                    <Typography variant="body2">
                      <strong>NI Hours Mode:</strong> {employee.payStructure.hourlyRates.niHoursMode || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>NI Rate Per Hour:</strong> {employee.payStructure.hourlyRates.niRatePerHour ?? 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cash Hours Mode:</strong> {employee.payStructure.hourlyRates.cashHoursMode || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cash Rate Per Hour:</strong> {employee.payStructure.hourlyRates.cashRatePerHour ?? 'N/A'}
                    </Typography>
                  </Box>
                )}

                {/* Other Considerations Section */}
                {employee.payStructure.hasOtherConsiderations &&
                  employee.payStructure.otherConsiderations && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        Other Considerations:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Note:</strong> {employee.payStructure.otherConsiderations.note || 'N/A'}
                      </Typography>
                      {employee.payStructure.otherConsiderations.niAdditions &&
                        employee.payStructure.otherConsiderations.niAdditions.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={`NI Add: ${item.name} - ${item.amount}`}
                            color="primary"
                            size="small"
                            sx={{ mr: 1, mt: 1 }}
                          />
                        ))}
                      {employee.payStructure.otherConsiderations.niDeductions &&
                        employee.payStructure.otherConsiderations.niDeductions.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={`NI Deduct: ${item.name} - ${item.amount}`}
                            color="secondary"
                            size="small"
                            sx={{ mr: 1, mt: 1 }}
                          />
                        ))}
                    </Box>
                  )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
