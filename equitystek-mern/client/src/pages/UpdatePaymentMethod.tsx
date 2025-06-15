import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  NavigateNext as NavigateNextIcon,
  LockOutlined as LockIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

// Load Stripe outside of component
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

// Payment method update form component
const UpdatePaymentForm: React.FC<{
  clientSecret: string;
  currentPaymentMethod: any;
}> = ({ clientSecret, currentPaymentMethod }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    if (!name.trim()) {
      setCardError('Please enter the name on card');
      return;
    }
    
    setLoading(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      // Update payment method
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name
          }
        }
      });
      
      if (error) {
        setCardError(error.message || 'Payment method update failed');
      } else if (setupIntent?.status === 'succeeded') {
        // Payment method updated successfully
        toast.success('Payment method updated successfully!');
        navigate('/subscription/manage');
      } else {
        setCardError('Payment method update failed. Please try again.');
      }
    } catch (err: any) {
      setCardError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            <LockIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
            New Payment Method
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Name on Card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            variant="outlined"
            placeholder="John Smith"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </Box>
          {cardError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {cardError}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!stripe || loading}
            sx={{ py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Update Payment Method'
            )}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

// Main component
const UpdatePaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user has active subscription
        const subscriptionResponse = await axios.get('/api/subscription/current');
        
        if (!subscriptionResponse.data) {
          // No subscription found, redirect to plans
          navigate('/subscription');
          return;
        }
        
        // Set current payment method if available
        if (subscriptionResponse.data.paymentMethod) {
          setCurrentPaymentMethod(subscriptionResponse.data.paymentMethod);
        }
        
        // Create setup intent for updating payment method
        const setupResponse = await axios.post('/api/subscription/create-setup-intent');
        setClientSecret(setupResponse.data.clientSecret);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load payment update form');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, user]);
  
  // Format card display
  const formatCardDetails = () => {
    if (!currentPaymentMethod) return 'No payment method on file';
    
    const { brand, last4, expMonth, expYear } = currentPaymentMethod;
    return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ending in ${last4} (Expires ${expMonth}/${expYear})`;
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
            Error
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/subscription/manage"
          >
            Back to Subscription
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
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link 
            to="/subscription/manage" 
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Manage Subscription
          </Link>
          <Typography color="text.primary">Update Payment Method</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        <CreditCardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Update Payment Method
      </Typography>
      
      <Grid container spacing={4}>
        {/* Current Payment Method */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Current Payment Method
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {currentPaymentMethod ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditCardIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body1">
                  {formatCardDetails()}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No payment method currently on file
              </Typography>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/subscription/manage"
                startIcon={<ArrowBackIcon />}
              >
                Back to Subscription
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Payment Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <UpdatePaymentForm 
                  clientSecret={clientSecret} 
                  currentPaymentMethod={currentPaymentMethod} 
                />
              </Elements>
            )}
          </Paper>
          
          {/* Security Notice */}
          <Card sx={{ mt: 3, bgcolor: '#f9f9f9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LockIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" fontWeight="medium">
                  Secure Payment Processing
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Your payment information is securely processed using Stripe. 
                We never store your complete credit card details on our servers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UpdatePaymentMethod;