import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  ReceiptLong as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface Receipt {
  _id: string;
  userId: string;
  subscriptionId: string;
  receiptNumber: string;
  planName: string;
  planDetails: {
    name: string;
    price: number;
    propertyAllowance: number;
    billingPeriod: string;
  };
  amount: number;
  date: string;
  dueDate?: string;
  paymentMethod: string;
  paymentDetails?: {
    brand: string;
    last4: string;
  };
  status: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  taxes?: {
    description: string;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  billingAddress?: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
}

const ReceiptPage: React.FC = () => {
  const { receiptId } = useParams<{ receiptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Component states
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printLoading, setPrintLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Fetch receipt data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch receipt
        const receiptResponse = await axios.get(`/api/receipts/${receiptId}`);
        setReceipt(receiptResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Receipt loading error:', err);
        setError(err.response?.data?.message || 'Failed to load receipt');
        setLoading(false);
        toast.error('Unable to load receipt information');
      }
    };
    
    fetchData();
  }, [receiptId]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle print receipt
  const handlePrintReceipt = () => {
    setPrintLoading(true);
    
    // Use browser's print functionality
    setTimeout(() => {
      window.print();
      setPrintLoading(false);
    }, 500);
  };
  
  // Handle download receipt
  const handleDownloadReceipt = async () => {
    try {
      setDownloadLoading(true);
      
      // Request PDF download
      const response = await axios.get(`/api/receipts/${receiptId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${receipt?.receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setDownloadLoading(false);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
      setDownloadLoading(false);
    }
  };
  
  // Handle email receipt
  const handleEmailReceipt = async () => {
    try {
      setEmailLoading(true);
      
      // Request to email receipt
      await axios.post(`/api/receipts/${receiptId}/email`);
      
      toast.success('Receipt sent to your email');
      setEmailLoading(false);
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Failed to send receipt to email');
      setEmailLoading(false);
    }
  };
  
  // Main loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading receipt...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (error || !receipt) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Receipt Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            {error || 'The requested receipt could not be found.'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/subscription/manage"
          >
            Back to Subscription
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }} className="receipt-page">
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }} className="no-print">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReceiptIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Receipt
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Receipt #{receipt.receiptNumber}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/subscription/manage"
          >
            Back
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrintReceipt}
            disabled={printLoading}
          >
            {printLoading ? 'Printing...' : 'Print'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReceipt}
            disabled={downloadLoading}
          >
            {downloadLoading ? 'Downloading...' : 'Download'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleEmailReceipt}
            disabled={emailLoading}
          >
            {emailLoading ? 'Sending...' : 'Email'}
          </Button>
        </Box>
      </Box>
      
      {/* Receipt Document */}
      <Paper sx={{ p: 4, mb: 4 }} className="receipt-document">
        {/* Receipt Header */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Equitystek
              </Typography>
              <Typography variant="body2">
                123 Business Street
              </Typography>
              <Typography variant="body2">
                Sydney, NSW 2000
              </Typography>
              <Typography variant="body2">
                Australia
              </Typography>
              <Typography variant="body2">
                ABN: 12 345 678 901
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                RECEIPT
              </Typography>
              <Typography variant="body2">
                <strong>Receipt #:</strong> {receipt.receiptNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(receipt.date)}
              </Typography>
              {receipt.dueDate && (
                <Typography variant="body2">
                  <strong>Due Date:</strong> {formatDate(receipt.dueDate)}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Status:</strong>{' '}
                <Box 
                  component="span" 
                  sx={{ 
                    color: receipt.status === 'paid' ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}
                >
                  {receipt.status.toUpperCase()}
                </Box>
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Bill To */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            BILL TO
          </Typography>
          {receipt.billingAddress ? (
            <Box>
              <Typography variant="body2">
                {receipt.billingAddress.name}
              </Typography>
              {receipt.billingAddress.company && (
                <Typography variant="body2">
                  {receipt.billingAddress.company}
                </Typography>
              )}
              <Typography variant="body2">
                {receipt.billingAddress.address}
              </Typography>
              <Typography variant="body2">
                {receipt.billingAddress.city}, {receipt.billingAddress.state} {receipt.billingAddress.postalCode}
              </Typography>
              <Typography variant="body2">
                {receipt.billingAddress.country}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2">
                {user?.username}
              </Typography>
              <Typography variant="body2">
                {user?.email}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Receipt Items */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell align="center"><strong>Quantity</strong></TableCell>
                <TableCell align="right"><strong>Unit Price</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
              
              {/* Subtotal Row */}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <strong>Subtotal</strong>
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(receipt.subtotal)}
                </TableCell>
              </TableRow>
              
              {/* Tax Rows */}
              {receipt.taxes && receipt.taxes.map((tax, index) => (
                <TableRow key={`tax-${index}`}>
                  <TableCell colSpan={3} align="right">
                    {tax.description} ({tax.rate}%)
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(tax.amount)}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Total Row */}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ borderBottom: 'none' }}>
                  <Typography variant="subtitle1"><strong>Total</strong></Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: 'none' }}>
                  <Typography variant="subtitle1"><strong>{formatCurrency(receipt.total)}</strong></Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Payment Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            PAYMENT INFORMATION
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Payment Method:</strong> {receipt.paymentMethod}
              </Typography>
              {receipt.paymentDetails && (
                <Typography variant="body2">
                  {receipt.paymentDetails.brand} ending in {receipt.paymentDetails.last4}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Date Paid:</strong> {formatDate(receipt.date)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        {/* Notes */}
        {receipt.notes && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" gutterBottom>
              NOTES
            </Typography>
            <Typography variant="body2">
              {receipt.notes}
            </Typography>
          </Box>
        )}
        
        {/* Thank You */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" gutterBottom>
            Thank You For Your Business
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please contact us if you have any questions about this receipt.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            support@equitystek.com | +61 2 1234 5678
          </Typography>
        </Box>
      </Paper>
      
      {/* Print Styles (hidden in normal view) */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .receipt-document {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default ReceiptPage;