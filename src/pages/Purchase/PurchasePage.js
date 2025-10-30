// frontend/src/pages/Purchase/PurchasePage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  LinearProgress,
  Pagination
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';
import Papa from 'papaparse';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PurchasePage() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suppliers
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersForDropdowns, setSuppliersForDropdowns] = useState([]); // All suppliers for dropdowns
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierPagination, setSupplierPagination] = useState(null);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Products
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', supplierId: '', defaultUnitPrice: 0, rebateAmount: 0 });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [productSupplierFilter, setProductSupplierFilter] = useState('');
  const [productPagination, setProductPagination] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Purchase Form
  const [formDate, setFormDate] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [formProducts, setFormProducts] = useState([]);
  const [total, setTotal] = useState(0);

  // Invoices
  const [invoices, setInvoices] = useState([]);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceSupplierFilter, setInvoiceSupplierFilter] = useState('');
  const [invoiceStartDate, setInvoiceStartDate] = useState('');
  const [invoiceEndDate, setInvoiceEndDate] = useState('');
  const [invoicePagination, setInvoicePagination] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Bulk Upload
  const [bulkCsvFile, setBulkCsvFile] = useState(null);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkParsedData, setBulkParsedData] = useState([]);
  const [bulkParsing, setBulkParsing] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkResults, setBulkResults] = useState(null);

  // Helper: Format number to 2 decimals
  const fmt = (n) => (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Fetch location info
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await api.get(`/locations/${locationId}`);
        setLocation(res.data);
      } catch (err) {
        console.error('Error fetching location:', err);
      } finally {
        setLoading(false);
      }
    };
    if (locationId) {
      fetchLocation();
    }
  }, [locationId]);

  // Fetch all suppliers for dropdowns when location changes
  useEffect(() => {
    if (locationId) {
      fetchAllSuppliers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  // Fetch suppliers when page or search changes
  useEffect(() => {
    if (locationId) {
      fetchSuppliers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, supplierPage]);

  // Debounced search for suppliers
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationId) {
        setSupplierPage(1);
        fetchSuppliers();
      }
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierSearch]);

  // Fetch products when page or filters change
  useEffect(() => {
    if (locationId) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, productPage, productSupplierFilter]);

  // Debounced search for products
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationId) {
        setProductPage(1);
        fetchProducts();
      }
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch]);

  // Fetch invoices when page or filters change
  useEffect(() => {
    if (locationId) {
      fetchInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, invoicePage, invoiceSupplierFilter, invoiceStartDate, invoiceEndDate]);

  // Debounced search for invoices
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationId) {
        setInvoicePage(1);
        fetchInvoices();
      }
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceSearch]);

  // Fetch all suppliers for dropdowns (no pagination)
  const fetchAllSuppliers = async () => {
    try {
      const params = {
        page: 1,
        limit: 1000, // Fetch all suppliers for dropdowns
        search: ''
      };
      const res = await api.get(`/purchases/suppliers/${locationId}`, { params });
      setSuppliersForDropdowns(res.data.data || []);
    } catch (err) {
      console.error('Error fetching all suppliers:', err);
    }
  };

  // Fetch suppliers (with pagination)
  const fetchSuppliers = async () => {
    setLoadingSuppliers(true);
    try {
      const params = {
        page: supplierPage,
        limit: 20,
        search: supplierSearch
      };
      const res = await api.get(`/purchases/suppliers/${locationId}`, { params });
      setSuppliers(res.data.data || []);
      setSupplierPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch products (with pagination and filters)
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = {
        page: productPage,
        limit: 20,
        search: productSearch,
        supplier: productSupplierFilter || undefined
      };
      const res = await api.get(`/purchases/products/${locationId}`, { params });
      setProducts(res.data.data || []);
      setProductPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch invoices (with pagination and filters)
  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const params = {
        page: invoicePage,
        limit: 20,
        search: invoiceSearch,
        supplier: invoiceSupplierFilter || undefined,
        startDate: invoiceStartDate || undefined,
        endDate: invoiceEndDate || undefined
      };
      const res = await api.get(`/purchases/invoices/${locationId}`, { params });
      setInvoices(res.data.data || []);
      setInvoicePagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Add supplier
  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) {
      alert('Enter a supplier name');
      return;
    }
    try {
      await api.post('/purchases/suppliers', { name: newSupplierName.trim(), locationId });
      setNewSupplierName('');
      setSupplierPage(1);
      fetchAllSuppliers(); // Refresh dropdown list
      fetchSuppliers();
      fetchProducts(); // Refresh products dropdown
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding supplier');
    }
  };

  // Update supplier
  const handleUpdateSupplier = async (id, newName) => {
    if (!newName.trim()) return;
    try {
      await api.put(`/purchases/suppliers/${id}`, { name: newName.trim() });
      setEditingSupplier(null);
      setSupplierPage(1);
      fetchSuppliers();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating supplier');
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Delete supplier and its products?')) return;
    try {
      await api.delete(`/purchases/suppliers/${id}`);
      setSupplierPage(1);
      fetchSuppliers();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting supplier');
    }
  };

  // Add product
  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.supplierId) {
      alert('Please fill product name and supplier');
      return;
    }
    try {
      await api.post('/purchases/products', { ...newProduct, locationId });
      setNewProduct({ name: '', supplierId: '', defaultUnitPrice: 0, rebateAmount: 0 });
      setProductPage(1);
      fetchProducts();
      if (selectedSupplier === newProduct.supplierId) {
        loadProductsForSupplier(newProduct.supplierId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding product');
    }
  };

  // Update product
  const handleUpdateProduct = async (id, updates) => {
    try {
      await api.put(`/purchases/products/${id}`, updates);
      setEditingProduct(null);
      setProductPage(1);
      fetchProducts();
      if (selectedSupplier) {
        loadProductsForSupplier(selectedSupplier);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating product');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await api.delete(`/purchases/products/${id}`);
      setProductPage(1);
      fetchProducts();
      if (selectedSupplier) {
        loadProductsForSupplier(selectedSupplier);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  // Load products for supplier in form
  const loadProductsForSupplier = async (supplierId) => {
    if (!supplierId) {
      setFormProducts([]);
      setTotal(0);
      return;
    }
    try {
      const res = await api.get(`/purchases/products/supplier/${supplierId}/${locationId}`);
      const prods = (res.data || []).map(p => ({
        productId: p._id,
        name: p.name,
        qty: 0,
        unitPrice: p.defaultUnitPrice,
        defaultPrice: p.defaultUnitPrice,
        amount: 0,
        variance: 0
      }));
      setFormProducts(prods);
      calculateTotal(prods);
    } catch (err) {
      console.error('Error loading products:', err);
      setFormProducts([]);
    }
  };

  // Handle supplier change in form
  useEffect(() => {
    if (selectedSupplier) {
      loadProductsForSupplier(selectedSupplier);
    } else {
      setFormProducts([]);
      setTotal(0);
    }
  }, [selectedSupplier]);

  // Recalculate row
  const recalcRow = (index) => {
    const updated = [...formProducts];
    const item = updated[index];
    item.amount = (item.qty || 0) * (item.unitPrice || 0);
    item.variance = (item.unitPrice || 0) - (item.defaultPrice || 0);
    setFormProducts(updated);
    calculateTotal(updated);
  };

  // Calculate total
  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.amount || 0), 0);
    setTotal(sum);
  };

  // Initialize form
  const handleResetForm = () => {
    setFormDate('');
    setSelectedSupplier('');
    setFormProducts([]);
    setTotal(0);
  };

  // Submit invoice
  const handleSubmitInvoice = async () => {
    if (!formDate) {
      alert('Please pick a date');
      return;
    }
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }
    const items = formProducts.filter(p => p.qty > 0).map(p => ({
      productId: p.productId,
      name: p.name,
      qty: p.qty,
      unitPrice: p.unitPrice,
      amount: p.amount,
      defaultPrice: p.defaultPrice,
      variance: p.variance
    }));
    if (items.length === 0) {
      alert('No products listed for this supplier');
      return;
    }
    try {
      const res = await api.post('/purchases/invoices', {
        date: formDate,
        supplierId: selectedSupplier,
        locationId,
        items
      });
      // Download CSV
      const invoiceId = res.data.invoice._id;
      const csvRes = await api.get(`/purchases/invoices/${invoiceId}/csv`, { responseType: 'blob' });
      const blob = new Blob([csvRes.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formDate} - ${suppliers.find(s => s._id === selectedSupplier)?.name || 'invoice'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert('Invoice saved. You can also find it under the Invoices tab.');
      handleResetForm();
      fetchInvoices();
      setTab(4); // Switch to Invoices tab
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating invoice');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/purchases/invoices/${id}`);
      setInvoicePage(1);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting invoice');
    }
  };

  // Download invoice CSV
  const handleDownloadCSV = async (invoiceId) => {
    try {
      const res = await api.get(`/purchases/invoices/${invoiceId}/csv`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const invoice = invoices.find(inv => inv._id === invoiceId);
      const dateStr = new Date(invoice.date).toISOString().split('T')[0];
      a.download = `${dateStr} - ${invoice.supplierId?.name || 'invoice'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error downloading CSV');
    }
  };

  // View invoice - navigate to details page
  const handleViewInvoice = (invoiceId) => {
    navigate(`/purchases/${locationId}/invoice/${invoiceId}`);
  };

  // Bulk Upload handlers
  const handleBulkFileChange = (e) => {
    setBulkCsvFile(e.target.files[0] || null);
    setBulkCsvText('');
    setBulkParsedData([]);
    setBulkMessage('');
    setBulkResults(null);
  };

  const handleUploadCSV = () => {
    if (!bulkCsvFile) {
      setBulkMessage('Please select a CSV file.');
      return;
    }
    setBulkParsing(true);
    setBulkMessage('Parsing CSV...');

    Papa.parse(bulkCsvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data?.length) {
          setBulkMessage('No rows found in CSV.');
          setBulkParsing(false);
          return;
        }
        setBulkParsedData(results.data);
        setBulkMessage(`File parsed successfully! Found ${results.data.length} rows. Preview below.`);
        setBulkParsing(false);
      },
      error: (err) => {
        console.error('Papa Parse error:', err);
        setBulkMessage(`CSV parse error: ${err.message}`);
        setBulkParsing(false);
      }
    });
  };

  const handlePasteCSV = () => {
    if (!bulkCsvText.trim()) {
      setBulkMessage('Please paste some CSV data first.');
      return;
    }
    try {
      const results = Papa.parse(bulkCsvText.trim(), {
        header: true,
        skipEmptyLines: true
      });
      if (!results.data?.length) {
        setBulkMessage('No rows found in the pasted CSV text.');
        return;
      }
      setBulkParsedData(results.data);
      setBulkMessage(`Pasted CSV parsed successfully! Found ${results.data.length} rows. Preview below.`);
    } catch (err) {
      console.error('Papa parse error:', err);
      setBulkMessage(`Error parsing pasted CSV: ${err.message}`);
    }
  };

  const handleSubmitBulkCreate = async () => {
    if (bulkParsedData.length === 0) {
      setBulkMessage('No data to submit.');
      return;
    }

    // Validate row limit
    if (bulkParsedData.length > 1000) {
      setBulkMessage('Error: Maximum 1000 rows allowed per bulk upload. Please split your data into smaller batches.');
      return;
    }

    setBulkUploading(true);
    setBulkMessage('Creating products...');
    setBulkResults(null);

    try {
      const res = await api.post('/purchases/products/bulk-create', {
        locationId,
        products: bulkParsedData.map(row => ({
          supplier: row.Supplier || row.supplier,
          name: row['Product Name'] || row.name,
          defaultUnitPrice: row['Default Unit Price'] || 0,
          rebateAmount: row['Rebate Amount'] || 0
        }))
      });

      setBulkResults(res.data);
      
      if (res.data.created > 0) {
        // Refresh data
        setSupplierPage(1);
        setProductPage(1);
        fetchSuppliers();
        fetchProducts();
        // Stay on Bulk Upload tab to see results
      }

      setBulkMessage(`Bulk create completed! Created: ${res.data.created}, Failed: ${res.data.failed}`);
    } catch (err) {
      console.error('Error in bulk create:', err);
      setBulkMessage(err.response?.data?.message || 'Error creating products.');
    } finally {
      setBulkUploading(false);
    }
  };

  const handleClearBulkData = () => {
    // Confirm before clearing if there's data
    if (bulkParsedData.length > 0 || bulkResults) {
      if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        return;
      }
    }
    
    setBulkCsvFile(null);
    setBulkCsvText('');
    setBulkParsedData([]);
    setBulkMessage('');
    setBulkResults(null);
  };

  const handleDownloadTemplate = () => {
    const template = 'Supplier,Product Name,Default Unit Price,Rebate Amount\nABC Supplier,Pen,10,1\nXYZ Corp,Notebook,5.50,0.5';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-bulk-upload-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadFailedCSV = () => {
    if (!bulkResults?.failedProducts || bulkResults.failedProducts.length === 0) {
      return;
    }

    // Helper function to escape CSV fields
    const escapeCSV = (value) => {
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Supplier', 'Product Name', 'Default Unit Price', 'Rebate Amount', 'Error'];
    const rows = bulkResults.failedProducts.map(item => [
      escapeCSV(item.supplier),
      escapeCSV(item.name),
      escapeCSV(item.defaultUnitPrice),
      escapeCSV(item.rebateAmount),
      escapeCSV(item.error)
    ]);
    const csvContent = [headers.map(escapeCSV), ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed-products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Purchase Module - {location?.name || 'Unknown Location'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/purchases')}>
          Change Location
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label="Purchase Form" />
            <Tab label="Suppliers" />
            <Tab label="Products" />
            <Tab label="Bulk Upload" />
            <Tab label="Invoices" />
          </Tabs>

          {/* Purchase Form Tab */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    label="Supplier"
                  >
                    <MenuItem value="">— Select —</MenuItem>
                    {suppliersForDropdowns.map(s => (
                      <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mb: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
              Select a supplier to auto-load its products. Edit Qty and Unit Price; amounts & variance compute automatically.
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleResetForm}>Initialize Form</Button>
              <Button variant="contained" onClick={handleSubmitInvoice}>Submit Invoice</Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Default Unit Price</TableCell>
                    <TableCell align="right">Price Variance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No products loaded. Select a supplier.</TableCell>
                    </TableRow>
                  ) : (
                    formProducts.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.qty}
                            onChange={(e) => {
                              item.qty = Number(e.target.value) || 0;
                              recalcRow(idx);
                            }}
                            sx={{ width: 100 }}
                            inputProps={{ min: 0, step: 1 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) => {
                              item.unitPrice = Number(e.target.value) || 0;
                              recalcRow(idx);
                            }}
                            sx={{ width: 130 }}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell align="right">{fmt(item.amount)}</TableCell>
                        <TableCell align="right">{fmt(item.defaultPrice)}</TableCell>
                        <TableCell align="right">{fmt(item.variance)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Totals:</strong></TableCell>
                    <TableCell align="right"><strong>{fmt(total)}</strong></TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Suppliers Tab */}
          <TabPanel value={tab} index={1}>
            {/* Add new supplier */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                placeholder="New supplier name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                fullWidth
                onKeyPress={(e) => e.key === 'Enter' && handleAddSupplier()}
              />
              <Button variant="contained" onClick={handleAddSupplier}>Add Supplier</Button>
            </Box>

            {/* Search and filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Search Suppliers"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Search by name..."
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button variant="outlined" onClick={() => setSupplierSearch('')}>
                    Clear Search
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Loading indicator */}
            {loadingSuppliers && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Pagination info */}
            {supplierPagination && !loadingSuppliers && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {suppliers.length} of {supplierPagination.total} suppliers
              </Typography>
            )}

            {/* Suppliers list */}
            {!loadingSuppliers && (
            <Box>
              {suppliers.map(s => (
                <Card key={s._id} sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>{editingSupplier === s._id ? (
                    <TextField
                      defaultValue={s.name}
                      onBlur={(e) => handleUpdateSupplier(s._id, e.target.value)}
                      autoFocus
                    />
                  ) : s.name}</Typography>
                  <Box>
                    <IconButton onClick={() => setEditingSupplier(editingSupplier === s._id ? null : s._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteSupplier(s._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              ))}
              {suppliers.length === 0 && <Typography color="text.secondary">No suppliers found.</Typography>}
            </Box>
            )}

            {/* Pagination controls */}
            {supplierPagination && supplierPagination.pages > 1 && !loadingSuppliers && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={supplierPagination.pages}
                  page={supplierPagination.page}
                  onChange={(e, value) => setSupplierPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={tab} index={2}>
            {/* Add new product */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Product Name"
                  placeholder="e.g. Pen"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    value={newProduct.supplierId}
                    onChange={(e) => setNewProduct({ ...newProduct, supplierId: e.target.value })}
                    label="Supplier"
                  >
                    {suppliersForDropdowns.map(s => (
                      <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Default Unit Price"
                  type="number"
                  value={newProduct.defaultUnitPrice}
                  onChange={(e) => setNewProduct({ ...newProduct, defaultUnitPrice: Number(e.target.value) || 0 })}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  label="Rebate Amount"
                  type="number"
                  value={newProduct.rebateAmount}
                  onChange={(e) => setNewProduct({ ...newProduct, rebateAmount: Number(e.target.value) || 0 })}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button variant="contained" fullWidth onClick={handleAddProduct}>Add Product</Button>
              </Grid>
            </Grid>

            {/* Search and filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Search Products"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Search by product name..."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Supplier</InputLabel>
                    <Select
                      value={productSupplierFilter}
                      onChange={(e) => setProductSupplierFilter(e.target.value)}
                      label="Filter by Supplier"
                    >
                      <MenuItem value="">All Suppliers</MenuItem>
                      {suppliersForDropdowns.map(s => (
                        <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" fullWidth onClick={() => {
                    setProductSearch('');
                    setProductSupplierFilter('');
                  }}>
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Loading indicator */}
            {loadingProducts && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Pagination info */}
            {productPagination && !loadingProducts && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {products.length} of {productPagination.total} products
              </Typography>
            )}

            {/* Products list */}
            {!loadingProducts && (
            <Box>
              {products.map(p => (
                <Card key={p._id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1"><strong>{p.name}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Chip label={p.supplierId?.name || 'Unknown'} size="small" sx={{ mr: 1 }} />
                        Default: {fmt(p.defaultUnitPrice)} • Rebate: {fmt(p.rebateAmount)}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => {
                        const newName = prompt('Product name:', p.name) || p.name;
                        const newSup = prompt('Supplier ID:', p.supplierId?._id || '') || p.supplierId?._id;
                        const newPrice = parseFloat(prompt('Default Unit Price:', p.defaultUnitPrice)) || 0;
                        const newReb = parseFloat(prompt('Rebate Amount:', p.rebateAmount)) || 0;
                        handleUpdateProduct(p._id, { name: newName, supplierId: newSup, defaultUnitPrice: newPrice, rebateAmount: newReb });
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteProduct(p._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
              {products.length === 0 && <Typography color="text.secondary">No products found.</Typography>}
            </Box>
            )}

            {/* Pagination controls */}
            {productPagination && productPagination.pages > 1 && !loadingProducts && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={productPagination.pages}
                  page={productPagination.page}
                  onChange={(e, value) => setProductPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </TabPanel>

          {/* Bulk Upload Tab */}
          <TabPanel value={tab} index={3}>
            {/* Section A: Instructions & Template */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Bulk Product Upload</Typography>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>CSV Format:</strong> Supplier,Product Name,Default Unit Price,Rebate Amount
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Example:</strong>
                </Typography>
                <Box component="pre" sx={{ fontSize: '0.875rem', mb: 1 }}>
                  ABC Supplier,Pen,10,1{'\n'}
                  XYZ Corp,Notebook,5.50,0.5
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                  size="small"
                >
                  Download Template
                </Button>
              </Paper>
            </Box>

            {/* Section B: Upload Options */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Option 1: Upload CSV File
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleBulkFileChange}
                      style={{ display: 'none' }}
                      id="csv-file-upload"
                    />
                    <label htmlFor="csv-file-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                        Choose File
                      </Button>
                    </label>
                    {bulkCsvFile && (
                      <Typography variant="body2" color="text.secondary">
                        {bulkCsvFile.name}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      onClick={handleUploadCSV}
                      disabled={!bulkCsvFile || bulkParsing}
                    >
                      {bulkParsing ? 'Parsing...' : 'Upload CSV'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Option 2: Paste CSV Content
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Paste CSV data here..."
                    value={bulkCsvText}
                    onChange={(e) => setBulkCsvText(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Button variant="contained" onClick={handlePasteCSV} disabled={!bulkCsvText}>
                    Parse Pasted CSV
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            {/* Message Display */}
            {bulkMessage && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {bulkMessage}
                </Typography>
              </Box>
            )}

            {/* Section C: Preview Table */}
            {bulkParsedData.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Preview ({bulkParsedData.length} rows)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={handleClearBulkData}>
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitBulkCreate}
                      disabled={bulkUploading}
                    >
                      {bulkUploading ? 'Creating...' : 'Submit Bulk Create'}
                    </Button>
                  </Box>
                </Box>
                {bulkUploading && <LinearProgress sx={{ mb: 2 }} />}
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Supplier</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell align="right">Default Unit Price</TableCell>
                        <TableCell align="right">Rebate Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bulkParsedData.slice(0, 50).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.Supplier || row.supplier || '-'}</TableCell>
                          <TableCell>{row['Product Name'] || row.name || '-'}</TableCell>
                          <TableCell align="right">{row['Default Unit Price'] || '0'}</TableCell>
                          <TableCell align="right">{row['Rebate Amount'] || '0'}</TableCell>
                        </TableRow>
                      ))}
                      {bulkParsedData.length > 50 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            ... and {bulkParsedData.length - 50} more rows
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Section D: Results Display */}
            {bulkResults && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Results</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {bulkResults.created > 0 && (
                    <Chip
                      label={`Success: ${bulkResults.created}`}
                      color="success"
                      sx={{ fontSize: '1rem', padding: '8px' }}
                    />
                  )}
                  {bulkResults.failed > 0 && (
                    <Chip
                      label={`Failed: ${bulkResults.failed}`}
                      color="error"
                      sx={{ fontSize: '1rem', padding: '8px' }}
                    />
                  )}
                </Box>

                {bulkResults.failedProducts && bulkResults.failedProducts.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2">Failed Products</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GetAppIcon />}
                        onClick={handleDownloadFailedCSV}
                      >
                        Download Failed Rows CSV
                      </Button>
                    </Box>
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Row</TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell>Product Name</TableCell>
                            <TableCell align="right">Default Unit Price</TableCell>
                            <TableCell align="right">Rebate Amount</TableCell>
                            <TableCell>Error</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bulkResults.failedProducts.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.row}</TableCell>
                              <TableCell>{item.supplier}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell align="right">{item.defaultUnitPrice}</TableCell>
                              <TableCell align="right">{item.rebateAmount}</TableCell>
                              <TableCell>
                                <Typography variant="caption" color="error">
                                  {item.error}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>

          {/* Invoices Tab */}
          <TabPanel value={tab} index={4}>
            {/* Search and filters */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Search by Supplier"
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Search supplier name..."
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Supplier</InputLabel>
                    <Select
                      value={invoiceSupplierFilter}
                      onChange={(e) => setInvoiceSupplierFilter(e.target.value)}
                      label="Filter by Supplier"
                    >
                      <MenuItem value="">All Suppliers</MenuItem>
                      {suppliersForDropdowns.map(s => (
                        <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={invoiceStartDate}
                    onChange={(e) => setInvoiceStartDate(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="End Date"
                    type="date"
                    value={invoiceEndDate}
                    onChange={(e) => setInvoiceEndDate(e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button variant="outlined" fullWidth onClick={() => {
                    setInvoiceSearch('');
                    setInvoiceSupplierFilter('');
                    setInvoiceStartDate('');
                    setInvoiceEndDate('');
                  }}>
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Loading indicator */}
            {loadingInvoices && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Pagination info */}
            {invoicePagination && !loadingInvoices && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {invoices.length} of {invoicePagination.total} invoices
              </Typography>
            )}

            {/* Invoices list */}
            {!loadingInvoices && (
            <Box>
              {invoices.map(inv => {
                const dateStr = new Date(inv.date).toISOString().slice(0, 10);
                return (
                  <Card key={inv._id} sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1"><strong>{dateStr} — {inv.supplierId?.name || 'Unknown'}</strong></Typography>
                      <Typography variant="body2" color="text.secondary">
                        {inv.items.length} items • Total {fmt(inv.total)}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleViewInvoice(inv._id)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDownloadCSV(inv._id)}>
                        <GetAppIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteInvoice(inv._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                );
              })}
              {invoices.length === 0 && <Typography color="text.secondary">No invoices found.</Typography>}
            </Box>
            )}

            {/* Pagination controls */}
            {invoicePagination && invoicePagination.pages > 1 && !loadingInvoices && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={invoicePagination.pages}
                  page={invoicePagination.page}
                  onChange={(e, value) => setInvoicePage(value)}
                  color="primary"
                />
              </Box>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}

