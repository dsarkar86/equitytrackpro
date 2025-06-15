import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  CircularProgress,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Card input styles
const cardElementOptions = {
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
  hidePostalCode: true,
};

// Add/Update Payment Method Form
const PaymentMethodForm: React.FC<{
  isUpdate: boolean;
  paymentMethodId?: string;
  onSuccess: () => void;
}> = ({ isUpdate, paymentMethodId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [makeDefault, setMakeDefault] = useState(true);
  const [cardError, setCardError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      return;
    }
    
    setLoading(true);
    setCardError(null);
    
    try {
      if (isUpdate && paymentMethodId) {
        // Update existing payment method
        const result = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined,
          },
        });
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        // Send to backend to update the payment method
        await axios.post(`/api/payment-methods/${paymentMethodId}/update`, {
          newPaymentMethodId: result.paymentMethod.id,
          makeDefault,
        });
      } else {
        // Add new payment method
        const result = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined,
          },
        });
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        // Send to backend to save the payment method
        await axios.post('/api/payment-methods', {
          paymentMethodId: result.paymentMethod.id,
          makeDefault,
        });
      }
      
      // Success
      setSuccess(true);
      toast.success(`Payment method ${isUpdate ? 'updated' : 'added'} successfully`);
      
      // Redirect after a short delay
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('Payment method error:', error);
      setCardError(error.message || 'An error occurred with your payment method');
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      {success ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {isUpdate ? 'Payment Method Updated' : 'Payment Method Added'}
          </Typography>
          <Typography variant="body1" paragraph>
            Your card has been saved successfully.
          </Typography>
        </Box>
      ) : (
        <>
          <TextField
            label="Cardholder Name"
            variant="outlined"
            fullWidth
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Card Information
            </Typography>
            <CardElement options={cardElementOptions} />
          </Paper>
          
          {!isUpdate && (
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Card Preferences</FormLabel>
              <RadioGroup
                value={makeDefault ? 'yes' : 'no'}
                onChange={(e) => setMakeDefault(e.target.value === 'yes')}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Make this my default payment method" />
                <FormControlLabel value="no" control={<Radio />} label="Keep my current default method" />
              </RadioGroup>
            </FormControl>
          )}
          
          {cardError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {cardError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/subscription/manage')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading || !stripe}
            >
              {loading ? 'Processing...' : isUpdate ? 'Update Payment Method' : 'Add Payment Method'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

// Payment Method Page (with Stripe Elements Provider)
const PaymentMethod: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const isUpdate = !!id;
  
  // Success handler
  const handleSuccess = () => {
    navigate('/subscription/manage');
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CreditCardIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              {isUpdate ? 'Update Payment Method' : 'Add Payment Method'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {isUpdate ? 'Update your card information' : 'Add a new credit or debit card'}
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/subscription/manage"
        >
          Back to Subscription
        </Button>
      </Box>
      
      {/* Main Content */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Elements stripe={stripePromise}>
            <PaymentMethodForm 
              isUpdate={isUpdate} 
              paymentMethodId={id}
              onSuccess={handleSuccess}
            />
          </Elements>
        </CardContent>
      </Card>
      
      {/* Security Information */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Security Information
        </Typography>
        <Typography variant="body2" paragraph>
          Equitystek uses Stripe for secure payment processing. Your card information is never stored on our servers and is protected with bank-grade encryption.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                What happens to my card details?
              </Typography>
              <Typography variant="body2">
                Your card details are sent directly to Stripe through a secure connection. We only store a reference token that allows us to charge your card for future payments.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Is my information safe?
              </Typography>
              <Typography variant="body2">
                Yes, Stripe is a PCI-DSS Level 1 certified payment processor, which is the highest level of certification available in the payments industry.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PaymentMethod;