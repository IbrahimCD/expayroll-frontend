// frontend/src/pages/Employee/CreateEmployeePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  Grow,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  // Basic Info states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [gender, setGender] = useState('Other');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [payrollId, setPayrollId] = useState('');
  const [status, setStatus] = useState('Employed');

  // NEW optional fields:
  const [title, setTitle] = useState(''); // Ms, Mr, etc.
  const [commencementDate, setCommencementDate] = useState('');

  // Base Location & Location Access
  const [baseLocationId, setBaseLocationId] = useState('');
  const [locationAccess, setLocationAccess] = useState([]);
  const [locations, setLocations] = useState([]);

  // Pay Structure states
  const [payStructureName, setPayStructureName] = useState('');
  const [hasDailyRates, setHasDailyRates] = useState(false);

  // NI daily rates
  const [niDayMode, setNiDayMode] = useState('NONE');
  const [niRegularDays, setNiRegularDays] = useState(0);
  const [niRegularDayRate, setNiRegularDayRate] = useState(0);
  const [niExtraDayRate, setNiExtraDayRate] = useState(0);
  const [niExtraShiftRate, setNiExtraShiftRate] = useState(0);

  // Cash daily rates
  const [cashDayMode, setCashDayMode] = useState('NONE');
  const [cashRegularDays, setCashRegularDays] = useState(0);
  const [cashRegularDayRate, setCashRegularDayRate] = useState(0);
  const [cashExtraDayRate, setCashExtraDayRate] = useState(0);
  const [cashExtraShiftRate, setCashExtraShiftRate] = useState(0);

  // Hourly
  const [hasHourlyRates, setHasHourlyRates] = useState(false);
  const [niHoursMode, setNiHoursMode] = useState('NONE');
  const [minNiHours, setMinNiHours] = useState(0);
  const [maxNiHours, setMaxNiHours] = useState(0);
  const [percentageNiHours, setPercentageNiHours] = useState(0);
  const [niRatePerHour, setNiRatePerHour] = useState(0);
  const [fixedNiHours, setFixedNiHours] = useState(0);

  const [cashHoursMode, setCashHoursMode] = useState('NONE');
  const [minCashHours, setMinCashHours] = useState(0);
  const [maxCashHours, setMaxCashHours] = useState(0);
  const [percentageCashHours, setPercentageCashHours] = useState(0);
  const [cashRatePerHour, setCashRatePerHour] = useState(0);

  // Other Considerations
  const [hasOtherConsiderations, setHasOtherConsiderations] = useState(false);
  const [note, setNote] = useState('');
  const [niAdditions, setNiAdditions] = useState([{ name: '', amount: 0 }]);
  const [niDeductions, setNiDeductions] = useState([{ name: '', amount: 0 }]);
  const [cashAdditions, setCashAdditions] = useState([{ name: '', amount: 0 }]);
  const [cashDeductions, setCashDeductions] = useState([{ name: '', amount: 0 }]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        setLocations(res.data || []);
      } catch (err) {
        console.error('Fetch locations error:', err);
      }
    };
    fetchLocations();
  }, []);

  // Dynamic additions/deductions
  const addNiAddition = () => setNiAdditions([...niAdditions, { name: '', amount: 0 }]);
  const handleNiAddChange = (idx, field, val) => {
    const arr = [...niAdditions];
    arr[idx][field] = val;
    setNiAdditions(arr);
  };

  const addNiDeduction = () => setNiDeductions([...niDeductions, { name: '', amount: 0 }]);
  const handleNiDeductionChange = (idx, field, val) => {
    const arr = [...niDeductions];
    arr[idx][field] = val;
    setNiDeductions(arr);
  };

  const addCashAddition = () => setCashAdditions([...cashAdditions, { name: '', amount: 0 }]);
  const handleCashAddChange = (idx, field, val) => {
    const arr = [...cashAdditions];
    arr[idx][field] = val;
    setCashAdditions(arr);
  };

  const addCashDeduction = () => setCashDeductions([...cashDeductions, { name: '', amount: 0 }]);
  const handleCashDeductionChange = (idx, field, val) => {
    const arr = [...cashDeductions];
    arr[idx][field] = val;
    setCashDeductions(arr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Basic validations from before (in case you have them)
    if (hasDailyRates && hasHourlyRates) {
      setMessage('Error: You cannot have both daily rates and hourly rates enabled.');
      return;
    }
    if (niDayMode === 'ALL' && cashDayMode === 'ALL') {
      setMessage('Error: niDayMode=ALL and cashDayMode=ALL is not allowed.');
      return;
    }
    if ((niHoursMode === 'ALL' || niHoursMode === 'CUSTOM') && cashHoursMode === 'ALL') {
      setMessage('Error: niHoursMode=(ALL or CUSTOM) and cashHoursMode=ALL is not allowed.');
      return;
    }

    // Build dailyRates object
    const dailyRates = {
      niDayMode,
      ni_regularDays: niRegularDays,
      ni_regularDayRate: niRegularDayRate,
      ni_extraDayRate: niDayMode === 'ALL' ? niExtraDayRate : 0,
      ni_extraShiftRate: niDayMode === 'ALL' ? niExtraShiftRate : 0,
      cashDayMode,
      cash_regularDays: cashRegularDays,
      cash_regularDayRate: cashRegularDayRate,
      cash_extraDayRate: cashDayMode === 'ALL' ? cashExtraDayRate : 0,
      cash_extraShiftRate: cashDayMode === 'ALL' ? cashExtraShiftRate : 0,
    };

    const payStructure = {
      payStructureName,
      hasDailyRates,
      dailyRates,
      hasHourlyRates,
      hourlyRates: {
        niHoursMode,
        minNiHours,
        maxNiHours,
        percentageNiHours,
        niRatePerHour,
        fixedNiHours,
        cashHoursMode,
        minCashHours,
        maxCashHours,
        percentageCashHours,
        cashRatePerHour,
      },
      hasOtherConsiderations,
      otherConsiderations: {
        note,
        niAdditions,
        niDeductions,
        cashAdditions,
        cashDeductions,
      },
    };

    // Build the overall payload
    const payload = {
      // Basic info
      firstName,
      lastName,
      preferredName,
      gender,
      dateOfBirth: dateOfBirth || null,
      mobileNo,
      email,
      address,
      payrollId,
      status,

      // NEW optional fields:
      title, // Ms, Mr, etc. If user left blank, it's just ""
      commencementDate: commencementDate || null,

      // Locations
      baseLocationId,
      locationAccess,

      // Pay structure
      payStructure,
    };

    try {
      const res = await api.post('/employees', payload);
      setMessage(res.data.message);
      navigate('/employees');
    } catch (err) {
      console.error('Create Employee error:', err);
      setMessage(err.response?.data?.message || 'Failed to create employee.');
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Grow in timeout={1000}>
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Typography variant="h4" gutterBottom>
                Create Employee
              </Typography>
              <Typography variant="h6" gutterBottom>
                Basic Info
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* Title (Optional) */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Title</InputLabel>
                <Select
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  <MenuItem value="">(None)</MenuItem>
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Miss">Miss</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              {/* Commencement Date (Optional) */}
              <TextField
                label="Commencement Date"
                type="date"
                value={commencementDate}
                onChange={(e) => setCommencementDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Preferred Name"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                fullWidth
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Mobile No"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Payroll ID"
                value={payrollId}
                onChange={(e) => setPayrollId(e.target.value)}
                fullWidth
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Left">Left</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Base Location</InputLabel>
                <Select
                  label="Base Location"
                  value={baseLocationId}
                  onChange={(e) => setBaseLocationId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>-- Select --</em>
                  </MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      {loc.locationName || loc.name || loc.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Multi-select for Location Access */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Location Access</InputLabel>
                <Select
                  multiple
                  value={locationAccess}
                  onChange={(e) => setLocationAccess(e.target.value)}
                  input={<OutlinedInput label="Location Access" />}
                  renderValue={(selected) =>
                    locations
                      .filter((loc) => selected.includes(loc._id))
                      .map((loc) => loc.name)
                      .join(', ')
                  }
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      <Checkbox checked={locationAccess.indexOf(loc._id) > -1} />
                      <ListItemText primary={`${loc.name} (${loc.code})`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Pay Structure
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TextField
                  label="Pay Structure Name"
                  value={payStructureName}
                  onChange={(e) => setPayStructureName(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                {/* Has Daily Rates Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={hasDailyRates}
                      onChange={(e) => setHasDailyRates(e.target.checked)}
                    />
                  }
                  label="Has Daily Rates?"
                />
                {hasDailyRates && (
                  <Box sx={{ pl: 2 }}>
                    {/* NI Daily Rates Section */}
                    <Typography variant="subtitle1">NI Day Mode</Typography>
                    <Select
                      value={niDayMode}
                      onChange={(e) => setNiDayMode(e.target.value)}
                      sx={{ mb: 2, width: '200px' }}
                    >
                      <MenuItem value="NONE">NONE</MenuItem>
                      <MenuItem value="ALL">ALL</MenuItem>
                      <MenuItem value="FIXED">FIXED</MenuItem>
                    </Select>
                    {niDayMode === 'ALL' && (
                      <Box sx={{ pl: 2 }}>
                        <TextField
                          label="NI Regular Days"
                          type="number"
                          value={niRegularDays}
                          onChange={(e) => setNiRegularDays(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="NI Regular Day Rate"
                          type="number"
                          value={niRegularDayRate}
                          onChange={(e) => setNiRegularDayRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="NI Extra Day Rate"
                          type="number"
                          value={niExtraDayRate}
                          onChange={(e) => setNiExtraDayRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="NI Extra Shift Rate"
                          type="number"
                          value={niExtraShiftRate}
                          onChange={(e) => setNiExtraShiftRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    )}
                    {niDayMode === 'FIXED' && (
                      <Box sx={{ pl: 2 }}>
                        <TextField
                          label="NI Regular Days"
                          type="number"
                          value={niRegularDays}
                          onChange={(e) => setNiRegularDays(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="NI Regular Day Rate"
                          type="number"
                          value={niRegularDayRate}
                          onChange={(e) => setNiRegularDayRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    )}

                    {/* Cash Daily Rates Section */}
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Cash Day Mode
                    </Typography>
                    <Select
                      value={cashDayMode}
                      onChange={(e) => setCashDayMode(e.target.value)}
                      sx={{ mb: 2, width: '200px' }}
                    >
                      <MenuItem value="NONE">NONE</MenuItem>
                      <MenuItem value="ALL">ALL</MenuItem>
                    </Select>
                    {cashDayMode === 'ALL' && (
                      <Box sx={{ pl: 2 }}>
                        <TextField
                          label="Cash Regular Days"
                          type="number"
                          value={cashRegularDays}
                          onChange={(e) => setCashRegularDays(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="Cash Regular Day Rate"
                          type="number"
                          value={cashRegularDayRate}
                          onChange={(e) => setCashRegularDayRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="Cash Extra Day Rate"
                          type="number"
                          value={cashExtraDayRate}
                          onChange={(e) => setCashExtraDayRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="Cash Extra Shift Rate"
                          type="number"
                          value={cashExtraShiftRate}
                          onChange={(e) => setCashExtraShiftRate(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    )}
                  </Box>
                )}

                {/* Has Hourly Rates Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={hasHourlyRates}
                      onChange={(e) => setHasHourlyRates(e.target.checked)}
                    />
                  }
                  label="Has Hourly Rates?"
                />
                {hasHourlyRates && (
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="subtitle1">NI Hours Mode</Typography>
                    <Select
                      value={niHoursMode}
                      onChange={(e) => setNiHoursMode(e.target.value)}
                      sx={{ mb: 2, width: '200px' }}
                    >
                      <MenuItem value="ALL">ALL</MenuItem>
                      <MenuItem value="NONE">NONE</MenuItem>
                      <MenuItem value="CUSTOM">CUSTOM</MenuItem>
                      <MenuItem value="FIXED">FIXED</MenuItem>
                    </Select>
                    {niHoursMode === 'CUSTOM' && (
                      <Box>
                        <TextField
                          label="Min NI Hours"
                          type="number"
                          value={minNiHours}
                          onChange={(e) => setMinNiHours(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="Max NI Hours"
                          type="number"
                          value={maxNiHours}
                          onChange={(e) => setMaxNiHours(+e.target.value)}
                          margin="normal"
                          sx={{ ml: 2 }}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="% NI Hours"
                          type="number"
                          value={percentageNiHours}
                          onChange={(e) => setPercentageNiHours(+e.target.value)}
                          margin="normal"
                          sx={{ ml: 2 }}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    )}
                    {niHoursMode === 'FIXED' && (
                      <Box>
                        <TextField
                          label="Fixed NI Hours"
                          type="number"
                          value={fixedNiHours}
                          onChange={(e) => setFixedNiHours(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    )}
                    <TextField
                      label="NI Rate Per Hour"
                      type="number"
                      value={niRatePerHour}
                      onChange={(e) => setNiRatePerHour(+e.target.value)}
                      margin="normal"
                      fullWidth
                      inputProps={{ onWheel: (e) => e.target.blur() }}
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Cash Hours Mode
                    </Typography>
                    <Select
                      value={cashHoursMode}
                      onChange={(e) => setCashHoursMode(e.target.value)}
                      sx={{ mb: 2, width: '200px' }}
                    >
                      <MenuItem value="REST">REST</MenuItem>
                      <MenuItem value="ALL">ALL</MenuItem>
                      <MenuItem value="NONE">NONE</MenuItem>
                      <MenuItem value="CUSTOM">CUSTOM</MenuItem>
                    </Select>
                    {cashHoursMode === 'CUSTOM' && (
                      <Box>
                        <TextField
                          label="Min Cash Hours"
                          type="number"
                          value={minCashHours}
                          onChange={(e) => setMinCashHours(+e.target.value)}
                          margin="normal"
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="Max Cash Hours"
                          type="number"
                          value={maxCashHours}
                          onChange={(e) => setMaxCashHours(+e.target.value)}
                          margin="normal"
                          sx={{ ml: 2 }}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                        <TextField
                          label="% Cash Hours"
                          type="number"
                          value={percentageCashHours}
                          onChange={(e) => setPercentageCashHours(+e.target.value)}
                          margin="normal"
                          sx={{ ml: 2 }}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    )}
                    <TextField
                      label="Cash Rate Per Hour"
                      type="number"
                      value={cashRatePerHour}
                      onChange={(e) => setCashRatePerHour(+e.target.value)}
                      margin="normal"
                      fullWidth
                      inputProps={{ onWheel: (e) => e.target.blur() }}
                    />
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={hasOtherConsiderations}
                      onChange={(e) => setHasOtherConsiderations(e.target.checked)}
                    />
                  }
                  label="Has Other Considerations?"
                />
                {hasOtherConsiderations && (
                  <Box sx={{ pl: 2, pt: 1 }}>
                    <TextField
                      label="Note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      NI Additions
                    </Typography>
                    {niAdditions.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField
                          label="Name"
                          value={item.name}
                          onChange={(e) => handleNiAddChange(idx, 'name', e.target.value)}
                        />
                        <TextField
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleNiAddChange(idx, 'amount', +e.target.value)}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    ))}
                    <Button variant="outlined" onClick={addNiAddition} sx={{ mt: 1 }}>
                      Add NI Addition
                    </Button>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      NI Deductions
                    </Typography>
                    {niDeductions.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField
                          label="Name"
                          value={item.name}
                          onChange={(e) => handleNiDeductionChange(idx, 'name', e.target.value)}
                        />
                        <TextField
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleNiDeductionChange(idx, 'amount', +e.target.value)}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    ))}
                    <Button variant="outlined" onClick={addNiDeduction} sx={{ mt: 1 }}>
                      Add NI Deduction
                    </Button>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Cash Additions
                    </Typography>
                    {cashAdditions.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField
                          label="Name"
                          value={item.name}
                          onChange={(e) => handleCashAddChange(idx, 'name', e.target.value)}
                        />
                        <TextField
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleCashAddChange(idx, 'amount', +e.target.value)}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    ))}
                    <Button variant="outlined" onClick={addCashAddition} sx={{ mt: 1 }}>
                      Add Cash Addition
                    </Button>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Cash Deductions
                    </Typography>
                    {cashDeductions.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <TextField
                          label="Name"
                          value={item.name}
                          onChange={(e) => handleCashDeductionChange(idx, 'name', e.target.value)}
                        />
                        <TextField
                          label="Amount"
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleCashDeductionChange(idx, 'amount', +e.target.value)}
                          inputProps={{ onWheel: (e) => e.target.blur() }}
                        />
                      </Box>
                    ))}
                    <Button variant="outlined" onClick={addCashDeduction} sx={{ mt: 1 }}>
                      Add Cash Deduction
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0px 8px 20px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  Save Employee
                </Button>
              </Box>
            </form>
            {message && (
              <Typography sx={{ mt: 2, color: 'red', fontWeight: 'bold' }}>
                {message}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grow>
    </Container>
  );
}
