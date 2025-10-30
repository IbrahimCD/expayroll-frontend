// frontend/src/pages/Purchase/InvoiceDetailsPage.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Grow,
  Grid,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Helper: Format a number to 2 decimals
const fmt = (n) => (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InvoiceDetailsPage() {
  const { locationId, invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);

  // Fetch Invoice by ID
  const fetchInvoice = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.get(`/purchases/invoices/${invoiceId}/details`);
      setInvoice(res.data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err.response?.data?.message || 'Failed to fetch invoice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line
  }, [invoiceId]);

  // Delete invoice handler
  const handleDeleteInvoice = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/purchases/invoices/${invoiceId}`);
      setMessage('Invoice deleted successfully.');
      setTimeout(() => {
        navigate(`/purchases/${locationId}`);
      }, 1500);
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError(err.response?.data?.message || 'Failed to delete invoice.');
      setDeleting(false);
    }
  };

  // Download CSV handler
  const handleDownloadCSV = async () => {
    try {
      const res = await api.get(`/purchases/invoices/${invoiceId}/csv`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date(invoice.date).toISOString().split('T')[0];
      a.download = `${dateStr} - ${invoice.supplierId?.name || 'invoice'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading CSV');
    }
  };

  // Handle download menu
  const handleDownloadMenuOpen = (event) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadAnchorEl(null);
  };

  // Download Excel
  const handleDownloadExcel = async () => {
    try {
      const res = await api.get(`/purchases/invoices/${invoiceId}/csv`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date(invoice.date).toISOString().split('T')[0];
      a.download = `${dateStr} - ${invoice.supplierId?.name || 'invoice'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading Excel file');
    }
    handleDownloadMenuClose();
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      let yPos = 40;
      
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('INVOICE', margin, yPos);
      yPos += 30;
      
      // Invoice details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date(invoice.date).toLocaleDateString();
      doc.text(`Date: ${dateStr}`, margin, yPos);
      yPos += 20;
      doc.text(`Supplier: ${invoice.supplierId?.name || 'Unknown'}`, margin, yPos);
      yPos += 20;
      const locationText = invoice.locationId?.code 
        ? `${invoice.locationId.name} (${invoice.locationId.code})`
        : invoice.locationId?.name || 'Unknown';
      doc.text(`Location: ${locationText}`, margin, yPos);
      yPos += 30;
      
      // Items table
      const tableData = invoice.items.map(item => [
        item.name,
        item.qty.toString(),
        item.unitPrice.toFixed(2),
        item.amount.toFixed(2),
        item.defaultPrice.toFixed(2),
        item.variance.toFixed(2)
      ]);
      
      doc.autoTable({
        head: [['Product', 'Qty', 'Unit Price', 'Amount', 'Default Price', 'Variance']],
        body: tableData,
        startY: yPos,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { 
          fillColor: [66, 139, 202],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 160 },
          1: { halign: 'center', cellWidth: 50 },
          2: { halign: 'right', cellWidth: 70 },
          3: { halign: 'right', cellWidth: 70 },
          4: { halign: 'right', cellWidth: 80 },
          5: { halign: 'right', cellWidth: 70 }
        }
      });
      
      // Total
      yPos = doc.lastAutoTable.finalY + 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const totalText = `Total: ${invoice.total.toFixed(2)}`;
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text(totalText, pageWidth - margin - 100, yPos);
      
      // Save
      const fileName = `${dateStr} - ${invoice.supplierId?.name || 'invoice'}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error downloading PDF');
    }
    handleDownloadMenuClose();
  };

  // Rendering states
  if (loading) {
    return (
      <Container
        sx={{
          mt: 4,
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Loading invoice details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, pt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/purchases/${locationId}`)}>
          Back to Purchase Module
        </Button>
      </Container>
    );
  }

  if (!invoice) {
    return (
      <Container sx={{ mt: 4, pt: 4 }}>
        <Typography>No invoice data found.</Typography>
        <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate(`/purchases/${locationId}`)} sx={{ mt: 2 }}>
          Back to Purchase Module
        </Button>
      </Container>
    );
  }

  const { date, supplierId, locationId: locData, items, total, createdAt } = invoice;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4
      }}
    >
      <Container>
        <Grow in={true} timeout={800}>
          <Card
            sx={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              boxShadow: 6,
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <CardContent>
              {/* Header with Back Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Invoice Details
                </Typography>
                <IconButton
                  onClick={() => navigate(`/purchases/${locationId}`)}
                  sx={{ backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#e0e0e0' } }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              {/* Invoice Information Card */}
              <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', borderLeft: '4px solid #1976d2' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">
                        Invoice Date
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">
                        Supplier
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {supplierId?.name || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {locData?.name || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {new Date(createdAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Invoice Items Table */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Product Items ({items.length} items)
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#1976d2' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Default Price</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Variance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f0f0f0' },
                          transition: 'background 0.3s'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'medium' }}>{item.name}</TableCell>
                        <TableCell align="right">{item.qty}</TableCell>
                        <TableCell align="right">{fmt(item.unitPrice)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {fmt(item.amount)}
                        </TableCell>
                        <TableCell align="right">{fmt(item.defaultPrice)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 'bold',
                            backgroundColor: item.variance > 0 ? '#ffebee' : item.variance < 0 ? '#e8f5e9' : 'transparent',
                            color: item.variance > 0 ? '#d32f2f' : item.variance < 0 ? '#388e3c' : 'inherit'
                          }}
                        >
                          {item.variance > 0 ? '+' : ''}{fmt(item.variance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Grand Total
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {fmt(total)}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={handleDownloadMenuOpen}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteInvoice}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Invoice'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        {/* Download Menu */}
        <Menu
          anchorEl={downloadAnchorEl}
          open={Boolean(downloadAnchorEl)}
          onClose={handleDownloadMenuClose}
        >
          <MenuItem onClick={handleDownloadExcel}>
            <GetAppIcon sx={{ mr: 1 }} fontSize="small" />
            Download Excel
          </MenuItem>
          <MenuItem onClick={handleDownloadPDF}>
            <GetAppIcon sx={{ mr: 1 }} fontSize="small" />
            Download PDF
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
}

