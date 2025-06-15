import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Payments as PaymentsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Receipt {
  _id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  date: string;
  receiptNumber: string;
  stripePaymentIntentId: string;
  description: string;
}

const ReceiptHistory: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Totals
  const [totalSpent, setTotalSpent] = useState(0);
  
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/receipts');
        setReceipts(response.data);
        
        // Calculate total spent
        const total = response.data.reduce((sum: number, receipt: Receipt) => sum + receipt.amount, 0);
        setTotalSpent(total);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load receipts');
        setLoading(false);
        toast.error('Failed to load receipts');
      }
    };
    
    fetchReceipts();
  }, []);
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Download receipt PDF
  const handleDownloadReceipt = async (receiptId: string) => {
    try {
      const response = await axios.get(`/api/receipts/${receiptId}/download`, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Receipt downloaded successfully');
    } catch (err: any) {
      toast.error('Failed to download receipt');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography variant="h5" gutterBottom>
            Error Loading Receipts
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/dashboard"
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
        >
          <Link 
            to="/" 
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link 
            to="/subscription/manage" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <PaymentsIcon sx={{ mr: 0.5 }} fontSize="small" />
            Manage Subscription
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="small" />
            Receipt History
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Receipt History
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${totalSpent.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Receipts
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {receipts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Latest Receipt
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="medium">
                {receipts.length > 0 ? formatDate(receipts[0].date) : 'No receipts yet'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Receipts Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt Number</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No receipts found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                receipts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((receipt) => (
                    <TableRow key={receipt._id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ReceiptIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {receipt.receiptNumber}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(receipt.date)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{receipt.description}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="medium">
                          ${receipt.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadReceipt(receipt._id)}
                        >
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={receipts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Australian Data Compliance Notice */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle2" gutterBottom>
          Australian Data Compliance
        </Typography>
        <Typography variant="body2">
          All receipt information is securely stored in compliance with Australian Financial Services regulations. Receipt data is encrypted and stored within Australian borders.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip label="Australian Data Compliant" color="primary" size="small" />
        </Box>
      </Paper>
    </Container>
  );
};

export default ReceiptHistory;