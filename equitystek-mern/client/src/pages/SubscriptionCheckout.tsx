import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
  PaymentOutlined as PaymentIcon,
  LockOutlined as LockIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Load Stripe outside of component to avoid recreating Stripe object
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  features: string[];
  basePrice: number;
  propertyPrice: number;
  maxProperties: number | null;
  isPopular: boolean;
}

interface QueryParams {
  properties?: string;
}

// Checkout form component
const CheckoutForm: React.FC<{
  plan: SubscriptionPlan;
  propertyCount: number;
  clientSecret: string;
}> = ({ plan, propertyCount, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Calculate total price
  const totalPrice = plan.basePrice + (propertyCount - 1) * plan.propertyPrice;
  
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
      
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name
          }
        }
      });
      
      if (error) {
        setCardError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment succeeded
        toast.success('Subscription created successfully!');
        navigate('/subscription/success');
      } else {
        setCardError('Payment processing error. Please try again.');
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
            Payment Information
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
              `Pay $${totalPrice}/month`
            )}
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            You'll be charged immediately and then monthly on this date
          </Typography>
        </Grid>
      </Grid>
    </form>
  );
};

// Main checkout page component
const SubscriptionCheckout: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [propertyCount, setPropertyCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  
  // Parse query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertiesParam = queryParams.get('properties');
    
    if (propertiesParam) {
      const count = parseInt(propertiesParam, 10);
      if (!isNaN(count) && count > 0) {
        setPropertyCount(count);
      }
    }
  }, [location.search]);
  
  // Fetch plan details and create payment intent
  useEffect(() => {
    const fetchData = async () => {
      if (!planId) return;
      
      try {
        setLoading(true);
        
        // Fetch plan details
        const planResponse = await axios.get(`/api/subscription/plans/${planId}`);
        setPlan(planResponse.data);
        
        // Create payment intent
        const intentResponse = await axios.post('/api/subscription/create-intent', {
          planId,
          propertyCount
        });
        
        setClientSecret(intentResponse.data.clientSecret);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load subscription data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [planId, propertyCount]);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    if (!plan) return 0;
    return plan.basePrice + (propertyCount - 1) * plan.propertyPrice;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !plan) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Subscription
          </Typography>
          <Typography paragraph>
            {error || 'Subscription plan not found'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/subscription"
            startIcon={<ArrowBackIcon />}
          >
            Back to Plans
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
            to="/subscription" 
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Subscription Plans
          </Link>
          <Typography color="text.primary">Checkout</Typography>
        </Breadcrumbs>
      </Box>
      
      <Typography variant="h4" gutterBottom>
        <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Complete Your Subscription
      </Typography>
      
      <Grid container spacing={4}>
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                {plan.name} Plan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.description}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Base Price:</Typography>
              <Typography variant="body2">${plan.basePrice}/month</Typography>
            </Box>
            
            {propertyCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Additional Properties ({propertyCount - 1}):
                </Typography>
                <Typography variant="body2">
                  ${(propertyCount - 1) * plan.propertyPrice}/month
                </Typography>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary">
                ${calculateTotalPrice()}/month
              </Typography>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/subscription"
                startIcon={<ArrowBackIcon />}
              >
                Back to Plans
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Payment Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  plan={plan} 
                  propertyCount={propertyCount} 
                  clientSecret={clientSecret} 
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

export default SubscriptionCheckout;