// frontend/src/pages/Employee/EmployeeDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Grid,
  Chip,
  Button
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  // Destructure pay structure for readability
  const { payStructure } = employee;

  return (
    <Container sx={{ mt: 4, backgroundColor: '#fff', fontFamily: "'Merriweather', serif" }}>
      <Card
        sx={{
          borderRadius: 3,
          p: 2,
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          animation: `${fadeInUp} 0.8s ease-out`,
          backgroundColor: '#fff',
          position: 'relative'
        }}
      >
        <CardContent>
          {/* Edit Button positioned at top right */}
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/employees/edit/${employee._id}`)}
            >
              Edit
            </Button>
          </Box>

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
                  <strong>Employee ID:</strong> {employee._id}
                </Typography>
              </Grid>

              {/* Title (Optional field) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Title:</strong> {employee.title || 'N/A'}
                </Typography>
              </Grid>

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

              {/* Age (computed on the server) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Age:</strong> {employee.age || 'N/A'}
                </Typography>
              </Grid>

              {/* Date of Birth */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Date of Birth:</strong>{' '}
                  {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>

              {/* Commencement Date (Optional) */}
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Commencement Date:</strong>{' '}
                  {employee.commencementDate
                    ? new Date(employee.commencementDate).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Mobile:</strong> {employee.mobileNo || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
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

              {/* Description if it exists */}
              {employee.description && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Description:</strong> {employee.description}
                  </Typography>
                </Grid>
              )}
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
          {payStructure && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#333', fontWeight: 'bold' }}>
                Pay Structure
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                <Typography variant="body1">
                  <strong>Name:</strong> {payStructure.payStructureName || 'N/A'}
                </Typography>
              </Box>

              {/* Daily Rates Section */}
              {payStructure.hasDailyRates && payStructure.dailyRates && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Daily Rates
                  </Typography>
                  <Typography variant="body2">
                    <strong>NI Day Mode:</strong> {payStructure.dailyRates.niDayMode || 'N/A'}
                  </Typography>
                  {payStructure.dailyRates.niRates && (
                    <Box sx={{ pl: 2, mt: 1 }}>
                      <Typography variant="body2">
                        <strong>NI Regular Days:</strong>{' '}
                        {payStructure.dailyRates.niRates.regularDays}
                      </Typography>
                      <Typography variant="body2">
                        <strong>NI Regular Day Rate:</strong>{' '}
                        {payStructure.dailyRates.niRates.regularDayRate}
                      </Typography>
                      {payStructure.dailyRates.niDayMode === 'ALL' && (
                        <>
                          <Typography variant="body2">
                            <strong>NI Extra Day Rate:</strong>{' '}
                            {payStructure.dailyRates.niRates.extraDayRate}
                          </Typography>
                          <Typography variant="body2">
                            <strong>NI Extra Shift Rate:</strong>{' '}
                            {payStructure.dailyRates.niRates.extraShiftRate}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Cash Day Mode:</strong> {payStructure.dailyRates.cashDayMode || 'N/A'}
                  </Typography>
                  {payStructure.dailyRates.cashRates && (
                    <Box sx={{ pl: 2, mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Cash Regular Days:</strong>{' '}
                        {payStructure.dailyRates.cashRates.regularDays}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Cash Regular Day Rate:</strong>{' '}
                        {payStructure.dailyRates.cashRates.regularDayRate}
                      </Typography>
                      {payStructure.dailyRates.cashDayMode === 'ALL' && (
                        <>
                          <Typography variant="body2">
                            <strong>Cash Extra Day Rate:</strong>{' '}
                            {payStructure.dailyRates.cashRates.extraDayRate}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Cash Extra Shift Rate:</strong>{' '}
                            {payStructure.dailyRates.cashRates.extraShiftRate}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Hourly Rates Section */}
              {payStructure.hasHourlyRates && payStructure.hourlyRates && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Hourly Rates
                  </Typography>
                  <Typography variant="body2">
                    <strong>NI Hours Mode:</strong> {payStructure.hourlyRates.niHoursMode || 'N/A'}
                  </Typography>
                  <Box sx={{ pl: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Min NI Hours:</strong> {payStructure.hourlyRates.minNiHours}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Max NI Hours:</strong> {payStructure.hourlyRates.maxNiHours}
                    </Typography>
                    <Typography variant="body2">
                      <strong>% NI Hours:</strong> {payStructure.hourlyRates.percentageNiHours}
                    </Typography>
                    <Typography variant="body2">
                      <strong>NI Rate Per Hour:</strong> {payStructure.hourlyRates.niRatePerHour}
                    </Typography>
                    {payStructure.hourlyRates.niHoursMode === 'FIXED' && (
                      <Typography variant="body2">
                        <strong>Fixed NI Hours:</strong> {payStructure.hourlyRates.fixedNiHours}
                      </Typography>
                    )}
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Cash Hours Mode:</strong>{' '}
                    {payStructure.hourlyRates.cashHoursMode || 'N/A'}
                  </Typography>
                  <Box sx={{ pl: 2, mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Min Cash Hours:</strong> {payStructure.hourlyRates.minCashHours}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Max Cash Hours:</strong> {payStructure.hourlyRates.maxCashHours}
                    </Typography>
                    <Typography variant="body2">
                      <strong>% Cash Hours:</strong> {payStructure.hourlyRates.percentageCashHours}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cash Rate Per Hour:</strong> {payStructure.hourlyRates.cashRatePerHour}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Other Considerations Section */}
              {payStructure.hasOtherConsiderations && payStructure.otherConsiderations && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Other Considerations
                  </Typography>
                  <Typography variant="body2">
                    <strong>Note:</strong> {payStructure.otherConsiderations.note || 'N/A'}
                  </Typography>
                  {payStructure.otherConsiderations.niAdditions &&
                    payStructure.otherConsiderations.niAdditions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          NI Additions:
                        </Typography>
                        {payStructure.otherConsiderations.niAdditions.map((item, idx) => (
                          <Typography key={idx} variant="body2">
                            {item.name ? `${item.name} : ${item.amount}` : item.amount}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  {payStructure.otherConsiderations.niDeductions &&
                    payStructure.otherConsiderations.niDeductions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          NI Deductions:
                        </Typography>
                        {payStructure.otherConsiderations.niDeductions.map((item, idx) => (
                          <Typography key={idx} variant="body2">
                            {item.name ? `${item.name} : ${item.amount}` : item.amount}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  {payStructure.otherConsiderations.cashAdditions &&
                    payStructure.otherConsiderations.cashAdditions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Cash Additions:
                        </Typography>
                        {payStructure.otherConsiderations.cashAdditions.map((item, idx) => (
                          <Typography key={idx} variant="body2">
                            {item.name ? `${item.name} : ${item.amount}` : item.amount}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  {payStructure.otherConsiderations.cashDeductions &&
                    payStructure.otherConsiderations.cashDeductions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Cash Deductions:
                        </Typography>
                        {payStructure.otherConsiderations.cashDeductions.map((item, idx) => (
                          <Typography key={idx} variant="body2">
                            {item.name ? `${item.name} : ${item.amount}` : item.amount}
                          </Typography>
                        ))}
                      </Box>
                    )}
                </Box>
              )}
            </Box>
          )}

          {/* Meta Information Section */}
          <Box sx={{ mt: 2, pl: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Meta Information
            </Typography>
            <Typography variant="body2">
              <strong>Created At:</strong>{' '}
              {employee.createdAt ? new Date(employee.createdAt).toLocaleString() : 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Last Updated:</strong>{' '}
              {employee.updatedAt ? new Date(employee.updatedAt).toLocaleString() : 'N/A'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
