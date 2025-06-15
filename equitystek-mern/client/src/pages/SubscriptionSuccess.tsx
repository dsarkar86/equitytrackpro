import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  ArrowForward as ArrowForwardIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the current subscription
        const response = await axios.get('/api/subscription/current');
        setSubscriptionDetails(response.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load subscription information');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Redirect to dashboard after 10 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Subscription
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/dashboard"
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{ mb: 4 }}>
          <CheckCircleIcon 
            color="success" 
            sx={{ fontSize: 72, mb: 2 }} 
          />
          <Typography variant="h4" gutterBottom>
            Subscription Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for subscribing to Equitystek. Your subscription is now active.
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {subscriptionDetails && (
          <Grid container spacing={3} sx={{ textAlign: 'left', mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Subscription Plan
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {subscriptionDetails.planName || 'Premium Plan'}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Active
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Property Count
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {subscriptionDetails.propertyCount} properties
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Monthly Payment
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                ${subscriptionDetails.price}/month
              </Typography>
            </Grid>
          </Grid>
        )}
        
        <Typography variant="body2" color="text.secondary" paragraph>
          You will be redirected to the dashboard in a few seconds.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            component={Link}
            to="/dashboard"
            startIcon={<HomeIcon />}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            component={Link}
            to="/subscription/manage"
            startIcon={<ArrowForwardIcon />}
          >
            Manage Subscription
          </Button>
          
          <Button
            variant="outlined"
            component={Link}
            to="/receipts"
            startIcon={<ReceiptIcon />}
          >
            View Receipts
          </Button>
        </Box>
      </Paper>
      
      {/* Australian Data Compliance */}
      <Paper sx={{ p: 3, mt: 4, backgroundColor: '#f5f5f5', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Your subscription data is securely stored in compliance with Australian data protection regulations.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SubscriptionSuccess;