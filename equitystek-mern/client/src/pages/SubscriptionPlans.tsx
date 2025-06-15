import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Payments as PaymentsIcon,
  NavigateNext as NavigateNextIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

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

interface UserSubscription {
  _id: string;
  userId: string;
  planId: string;
  propertyCount: number;
  status: string;
  currentPeriodEnd: string;
  stripeSubscriptionId?: string;
  startDate: string;
  price: number;
}

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [propertyCount, setPropertyCount] = useState(1);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch subscription plans
        const plansResponse = await axios.get('/api/subscription/plans');
        setPlans(plansResponse.data);
        
        // Fetch current subscription if user is logged in
        if (user) {
          const subscriptionResponse = await axios.get('/api/subscription/current');
          setCurrentSubscription(subscriptionResponse.data);
          
          // Set property count to user's current count
          if (subscriptionResponse.data) {
            setPropertyCount(subscriptionResponse.data.propertyCount);
          }
          
          // Also fetch user's property count if no subscription
          if (!subscriptionResponse.data) {
            const propertiesResponse = await axios.get('/api/properties');
            setPropertyCount(propertiesResponse.data.length || 1);
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load subscription data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Check if user has active subscription
  const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active';
  
  // Calculate remaining days in current subscription
  const getRemainingDays = () => {
    if (!currentSubscription) return 0;
    
    const currentPeriodEnd = new Date(currentSubscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = currentPeriodEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Calculate price for a plan based on property count
  const calculatePrice = (plan: SubscriptionPlan) => {
    return plan.basePrice + (propertyCount - 1) * plan.propertyPrice;
  };
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    // If user already has this plan, go to manage subscription
    if (hasActiveSubscription && currentSubscription?.planId === planId) {
      navigate('/subscription/manage');
      return;
    }
    
    // Otherwise go to checkout with selected plan
    navigate(`/subscription/checkout/${planId}?properties=${propertyCount}`);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2 }}>
        <PaymentsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Subscription Plans
      </Typography>
      
      {/* Current Subscription Summary */}
      {hasActiveSubscription && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Your Current Subscription
              </Typography>
              <Typography variant="body1">
                You are currently on the {plans.find(p => p._id === currentSubscription?.planId)?.name || 'Standard'} plan
                with {currentSubscription?.propertyCount} properties.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Your subscription will renew in {getRemainingDays()} days.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/subscription/manage"
                endIcon={<NavigateNextIcon />}
              >
                Manage Subscription
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Error Message */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {/* Pricing Plans */}
      <Typography variant="h5" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        All plans include access to property management, maintenance tracking, and valuation tools.
        Select the plan that best fits your needs.
      </Typography>
      
      {/* Property Count Disclaimer */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary">
          * Prices shown are based on managing {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}.
          {hasActiveSubscription && ' You can change your property count in the Manage Subscription page.'}
        </Typography>
      </Box>
      
      {/* Plan Cards */}
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan._id}>
            <Card 
              raised={plan.isPopular} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)'
                }
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: -30,
                    transform: 'rotate(45deg)',
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                    py: 0.5,
                    px: 3,
                    zIndex: 1
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">POPULAR</Typography>
                </Box>
              )}
              
              <CardHeader
                title={plan.name}
                titleTypographyProps={{ align: 'center', variant: 'h5', fontWeight: 'bold' }}
                sx={{
                  backgroundColor: plan.isPopular ? 'primary.light' : 'grey.100',
                  color: plan.isPopular ? 'primary.contrastText' : 'text.primary',
                  pb: 1
                }}
              />
              
              <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography component="h2" variant="h3" color="text.primary">
                    ${calculatePrice(plan)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                  
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        plan.maxProperties 
                          ? `Up to ${plan.maxProperties} properties`
                          : 'Unlimited properties'
                      } 
                    />
                  </ListItem>
                  
                  {/* Base price info */}
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LocalOfferIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body2">
                        ${plan.basePrice}/mo base + ${plan.propertyPrice}/mo per additional property
                      </Typography>
                    </ListItemText>
                  </ListItem>
                </List>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pb: 3, px: 2 }}>
                <Button
                  fullWidth
                  variant={plan.isPopular ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => handleSelectPlan(plan._id)}
                  size="large"
                >
                  {hasActiveSubscription && currentSubscription?.planId === plan._id
                    ? 'Current Plan'
                    : hasActiveSubscription
                    ? 'Change Plan'
                    : 'Select Plan'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Australian Data Compliance Notice */}
      <Paper sx={{ p: 3, mt: 6, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Australian Data Compliance
        </Typography>
        <Typography variant="body2" paragraph>
          All Equitystek plans comply with Australian data protection regulations. Your data is securely stored within Australian borders 
          and managed according to Australian Privacy Principles (APPs).
        </Typography>
        <Chip label="Australian Data Compliant" color="primary" size="small" />
      </Paper>
    </Container>
  );
};

export default SubscriptionPlans;