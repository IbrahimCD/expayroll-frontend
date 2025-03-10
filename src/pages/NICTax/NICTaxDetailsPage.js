// frontend/src/pages/NICTax/NICTaxDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function NICTaxDetailsPage() {
  const { nictaxId } = useParams();
  const navigate = useNavigate();
  const [nictax, setNictax] = useState(null);
  const [error, setError] = useState('');

  const fetchNICTaxRecord = async () => {
    setError('');
    try {
      const res = await api.get(`/nictax/${nictaxId}`);
      setNictax(res.data.nictax);
    } catch (err) {
      console.error('Error fetching NIC & Tax details:', err);
      setError(err.response?.data?.message || 'Failed to fetch NIC & Tax details');
    }
  };

  useEffect(() => {
    fetchNICTaxRecord();
    // eslint-disable-next-line
  }, [nictaxId]);

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!nictax) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading NIC & Tax record...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {nictax.recordName}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Date Range:</strong>{' '}
            {new Date(nictax.startDate).toLocaleDateString()} -{' '}
            {new Date(nictax.endDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Base Location:</strong>{' '}
            {nictax.baseLocationId?.name || 'Unknown'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Status:</strong> {nictax.status}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Description:</strong> {nictax.description || 'N/A'}
          </Typography>

          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Entries
          </Typography>
          {(!nictax.entries || nictax.entries.length === 0) ? (
            <Typography>No entries found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>E'es NIC</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>E'er NIC</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>E'es Tax</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nictax.entries.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{entry.employeeName}</TableCell>
                    <TableCell>{entry.eesNIC}</TableCell>
                    <TableCell>{entry.erNIC}</TableCell>
                    <TableCell>{entry.eesTax}</TableCell>
                    <TableCell>{entry.notes || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/nictax')}>
          Back to NIC & Tax List
        </Button>
        <Button
          variant="contained"
          sx={{ ml: 2 }}
          onClick={() => navigate(`/nictax/edit/${nictax._id}`)}
        >
          Edit
        </Button>
      </Box>
    </Container>
  );
}
