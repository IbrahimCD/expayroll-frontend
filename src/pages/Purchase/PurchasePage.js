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
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../services/api';

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
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Products
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', supplierId: '', defaultUnitPrice: 0, rebateAmount: 0 });
  const [editingProduct, setEditingProduct] = useState(null);

  // Purchase Form
  const [formDate, setFormDate] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [formProducts, setFormProducts] = useState([]);
  const [total, setTotal] = useState(0);

  // Invoices
  const [invoices, setInvoices] = useState([]);

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
      fetchSuppliers();
      fetchProducts();
      fetchInvoices();
    }
  }, [locationId]);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await api.get(`/purchases/suppliers/${locationId}`);
      setSuppliers(res.data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await api.get(`/purchases/products/${locationId}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    try {
      const res = await api.get(`/purchases/invoices/${locationId}`);
      setInvoices(res.data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
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
      alert('Invoice saved. You can also find it under the Invoices tab.');
      handleResetForm();
      fetchInvoices();
      setTab(3); // Switch to invoices tab
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating invoice');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/purchases/invoices/${id}`);
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
    } catch (err) {
      alert('Error downloading CSV');
    }
  };

  // View invoice
  const handleViewInvoice = (invoice) => {
    const lines = invoice.items.map(i => 
      `• ${i.name} — Qty ${i.qty}, Unit ${fmt(i.unitPrice)}, Amount ${fmt(i.amount)}, Default ${fmt(i.defaultPrice)}, Var ${fmt(i.variance)}`
    ).join('\n');
    const dateStr = new Date(invoice.date).toISOString().split('T')[0];
    alert(`${dateStr} — ${invoice.supplierId?.name || 'Unknown'}\n\n${lines}\n\nTotal: ${fmt(invoice.total)}`);
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
                    {suppliers.map(s => (
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
              {suppliers.length === 0 && <Typography color="text.secondary">No suppliers yet.</Typography>}
            </Box>
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={tab} index={2}>
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
                    {suppliers.map(s => (
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
              {products.length === 0 && <Typography color="text.secondary">No products yet.</Typography>}
            </Box>
          </TabPanel>

          {/* Invoices Tab */}
          <TabPanel value={tab} index={3}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Saved invoices. You can download any invoice as CSV.
            </Typography>
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
                      <IconButton onClick={() => handleViewInvoice(inv)}>
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
              {invoices.length === 0 && <Typography color="text.secondary">No invoices yet.</Typography>}
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Container>
  );
}

