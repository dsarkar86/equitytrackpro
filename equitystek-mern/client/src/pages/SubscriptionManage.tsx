import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CardHeader,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  ReceiptLong as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  CreditCard as CreditCardIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  HomeWork as PropertyIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  propertyAllowance: number;
  features: string[];
  recommended?: boolean;
}

interface Subscription {
  _id: string;
  planId: string;
  planName: string;
  userId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  pricePerMonth: number;
  propertyAllowance: number;
  propertyCount: number;
  features: string[];
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
}

interface Receipt {
  _id: string;
  userId: string;
  subscriptionId: string;
  receiptNumber: string;
  planName: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
  stripePaymentIntentId?: string;
}

interface StripeCard {
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  last4: string;
  id: string;
}

const SubscriptionManage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Component states
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<StripeCard[]>([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current subscription
        try {
          const subscriptionResponse = await axios.get('/api/subscription');
          setSubscription(subscriptionResponse.data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setSubscription(null);
        }
        
        setLoading(false);
        
        // Fetch subscription plans (in parallel)
        setLoadingPlans(true);
        try {
          const plansResponse = await axios.get('/api/subscription-plans');
          setSubscriptionPlans(plansResponse.data);
          setLoadingPlans(false);
        } catch (error) {
          console.error('Error fetching subscription plans:', error);
          setLoadingPlans(false);
          toast.error('Unable to load subscription plans');
        }
        
        // Fetch payment methods (in parallel)
        setLoadingPaymentMethods(true);
        try {
          const paymentMethodsResponse = await axios.get('/api/payment-methods');
          setPaymentMethods(paymentMethodsResponse.data.paymentMethods || []);
          setDefaultPaymentMethod(paymentMethodsResponse.data.defaultPaymentMethod || null);
          setLoadingPaymentMethods(false);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
          setLoadingPaymentMethods(false);
        }
        
        // Fetch receipts (in parallel)
        setLoadingReceipts(true);
        try {
          const receiptsResponse = await axios.get('/api/receipts');
          setReceipts(receiptsResponse.data);
          setLoadingReceipts(false);
        } catch (error) {
          console.error('Error fetching receipts:', error);
          setLoadingReceipts(false);
        }
      } catch (err: any) {
        console.error('Subscription loading error:', err);
        setLoading(false);
        toast.error('Error loading subscription data');
      }
    };
    
    fetchData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
  
  // Handle upgrade plan
  const handleUpgradePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setUpgradeDialogOpen(true);
  };
  
  // Handle cancel subscription
  const handleCancelSubscription = () => {
    setCancelDialogOpen(true);
  };
  
  // Confirm upgrade plan
  const confirmUpgradePlan = async () => {
    if (!selectedPlan) return;
    
    setActionLoading(true);
    
    try {
      await axios.post('/api/subscription/upgrade', {
        planId: selectedPlan._id
      });
      
      toast.success(`Successfully upgraded to ${selectedPlan.name} plan`);
      setUpgradeDialogOpen(false);
      
      // Refresh subscription data
      const subscriptionResponse = await axios.get('/api/subscription');
      setSubscription(subscriptionResponse.data);
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade subscription plan');
      setActionLoading(false);
    }
  };
  
  // Confirm cancel subscription
  const confirmCancelSubscription = async () => {
    if (!subscription) return;
    
    setActionLoading(true);
    
    try {
      await axios.post('/api/subscription/cancel');
      
      toast.success('Subscription will be canceled at the end of the current billing period');
      setCancelDialogOpen(false);
      
      // Refresh subscription data
      const subscriptionResponse = await axios.get('/api/subscription');
      setSubscription(subscriptionResponse.data);
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
      setActionLoading(false);
    }
  };
  
  // Handle reactivate subscription
  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    setActionLoading(true);
    
    try {
      await axios.post('/api/subscription/reactivate');
      
      toast.success('Your subscription has been reactivated');
      
      // Refresh subscription data
      const subscriptionResponse = await axios.get('/api/subscription');
      setSubscription(subscriptionResponse.data);
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast.error('Failed to reactivate subscription');
      setActionLoading(false);
    }
  };
  
  // Handle add payment method
  const handleAddPaymentMethod = () => {
    navigate('/payment-methods/add');
  };
  
  // Handle update payment method
  const handleUpdatePaymentMethod = (paymentMethodId: string) => {
    navigate(`/payment-methods/${paymentMethodId}/update`);
  };
  
  // Handle set default payment method
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await axios.post('/api/payment-methods/default', {
        paymentMethodId
      });
      
      setDefaultPaymentMethod(paymentMethodId);
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };
  
  // Handle view receipt
  const handleViewReceipt = (receiptId: string) => {
    navigate(`/receipts/${receiptId}`);
  };
  
  // Main loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading subscription information...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
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
          <ReceiptIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Subscription Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your subscription plan and payment details
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/"
        >
          Back to Dashboard
        </Button>
      </Box>
      
      {/* Main Content */}
      <Box>
        {/* Current Subscription Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Current Subscription
          </Typography>
          
          {subscription ? (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h5" component="h3">
                          {subscription.planName}
                        </Typography>
                        <Chip 
                          label={subscription.status.toUpperCase()} 
                          color={subscription.status === 'active' ? 'success' : 'default'}
                          size="small"
                          sx={{ ml: 2 }}
                        />
                        {subscription.cancelAtPeriodEnd && (
                          <Chip 
                            label="Cancels at period end" 
                            color="warning"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                      <Typography variant="body1">
                        {formatCurrency(subscription.pricePerMonth)} per month
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Current Period
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {formatDate(subscription.currentPeriodStart)} to {formatDate(subscription.currentPeriodEnd)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PropertyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Property Allowance
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {subscription.propertyCount} of {subscription.propertyAllowance} properties used
                        </Typography>
                        {subscription.propertyCount >= subscription.propertyAllowance && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <WarningIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="warning.main">
                              Limit reached. Upgrade to add more.
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Plan Features
                    </Typography>
                    <List dense>
                      {subscription.features.map((feature, index) => (
                        <ListItem key={index} dense disableGutters>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Subscription Actions
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {!subscription.cancelAtPeriodEnd ? (
                          <>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setActiveTab(1)}
                              startIcon={<MoneyIcon />}
                              fullWidth
                            >
                              Change Plan
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={handleCancelSubscription}
                              startIcon={<CloseIcon />}
                              fullWidth
                              disabled={actionLoading}
                            >
                              {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReactivateSubscription}
                            startIcon={<CheckIcon />}
                            fullWidth
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          onClick={() => setActiveTab(2)}
                          startIcon={<CreditCardIcon />}
                          fullWidth
                        >
                          Manage Payment Methods
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveTab(3)}
                          startIcon={<HistoryIcon />}
                          fullWidth
                        >
                          Billing History
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" gutterBottom>
                  No Active Subscription
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You currently don't have an active subscription. Choose a plan to get started.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setActiveTab(1)}
                >
                  Choose a Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
        
        {/* Tabs for Plan Selection, Payment Methods, and Billing History */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="subscription management tabs"
          >
            <Tab 
              label="Overview" 
              id="tab-0" 
              aria-controls="tabpanel-0" 
              icon={<HomeIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Change Plan" 
              id="tab-1" 
              aria-controls="tabpanel-1" 
              icon={<MoneyIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Payment Methods" 
              id="tab-2" 
              aria-controls="tabpanel-2" 
              icon={<CreditCardIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Billing History" 
              id="tab-3" 
              aria-controls="tabpanel-3" 
              icon={<HistoryIcon />}
              iconPosition="start"
            />
          </Tabs>
          
          <Divider />
          
          {/* Overview Tab */}
          <Box
            role="tabpanel"
            hidden={activeTab !== 0}
            id="tabpanel-0"
            aria-labelledby="tab-0"
            sx={{ mt: 3 }}
          >
            {activeTab === 0 && (
              <Typography variant="body1">
                Use the tabs above to manage your subscription, change your plan, or view your billing history.
              </Typography>
            )}
          </Box>
          
          {/* Change Plan Tab */}
          <Box
            role="tabpanel"
            hidden={activeTab !== 1}
            id="tabpanel-1"
            aria-labelledby="tab-1"
            sx={{ mt: 3 }}
          >
            {activeTab === 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Available Subscription Plans
                </Typography>
                
                {loadingPlans ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {subscriptionPlans.map((plan) => (
                      <Grid item xs={12} md={4} key={plan._id}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            border: plan.recommended ? `2px solid ${theme.palette.primary.main}` : undefined,
                            boxShadow: plan.recommended ? 3 : 1
                          }}
                        >
                          {plan.recommended && (
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: 15, 
                                right: 0,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                py: 0.5,
                                px: 2,
                                borderTopLeftRadius: 4,
                                borderBottomLeftRadius: 4,
                                fontWeight: 'bold',
                                fontSize: '0.8rem'
                              }}
                            >
                              RECOMMENDED
                            </Box>
                          )}
                          
                          <CardHeader
                            title={plan.name}
                            titleTypographyProps={{ variant: 'h6' }}
                            sx={{
                              bgcolor: subscription?.planId === plan._id ? 'primary.light' : 'background.paper',
                              color: subscription?.planId === plan._id ? 'primary.contrastText' : 'text.primary',
                              borderBottom: 1,
                              borderColor: 'divider'
                            }}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h5" color="primary" gutterBottom>
                              {formatCurrency(plan.price)}<Typography variant="body2" component="span" color="text.secondary">/month</Typography>
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {plan.description}
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" gutterBottom>
                                <Box component="span" fontWeight="bold">Property Allowance:</Box> {plan.propertyAllowance} properties
                              </Typography>
                              
                              <Divider sx={{ my: 1.5 }} />
                              
                              <List dense>
                                {plan.features.map((feature, index) => (
                                  <ListItem key={index} dense disableGutters>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      <CheckIcon color="success" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={feature} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          </CardContent>
                          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            {subscription?.planId === plan._id ? (
                              <Button
                                fullWidth
                                variant="outlined"
                                disabled
                                startIcon={<CheckCircleIcon />}
                              >
                                Current Plan
                              </Button>
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => handleUpgradePlan(plan)}
                              >
                                {subscription ? 'Switch to This Plan' : 'Select This Plan'}
                              </Button>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
          
          {/* Payment Methods Tab */}
          <Box
            role="tabpanel"
            hidden={activeTab !== 2}
            id="tabpanel-2"
            aria-labelledby="tab-2"
            sx={{ mt: 3 }}
          >
            {activeTab === 2 && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Typography variant="h6">
                    Payment Methods
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CreditCardIcon />}
                    onClick={handleAddPaymentMethod}
                  >
                    Add Payment Method
                  </Button>
                </Box>
                
                {loadingPaymentMethods ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : paymentMethods.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" paragraph>
                      You don't have any payment methods saved yet.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<CreditCardIcon />}
                      onClick={handleAddPaymentMethod}
                    >
                      Add Payment Method
                    </Button>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {paymentMethods.map((card) => (
                      <Grid item xs={12} sm={6} md={4} key={card.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start'
                            }}>
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  {card.brand.toUpperCase()}
                                </Typography>
                                <Typography variant="body1">
                                  •••• •••• •••• {card.last4}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
                                </Typography>
                              </Box>
                              {defaultPaymentMethod === card.id && (
                                <Chip label="Default" color="primary" size="small" />
                              )}
                            </Box>
                          </CardContent>
                          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleUpdatePaymentMethod(card.id)}
                                >
                                  Update
                                </Button>
                              </Grid>
                              <Grid item xs={6}>
                                {defaultPaymentMethod !== card.id && (
                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleSetDefaultPaymentMethod(card.id)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Box>
          
          {/* Billing History Tab */}
          <Box
            role="tabpanel"
            hidden={activeTab !== 3}
            id="tabpanel-3"
            aria-labelledby="tab-3"
            sx={{ mt: 3 }}
          >
            {activeTab === 3 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Billing History
                </Typography>
                
                {loadingReceipts ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : receipts.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1">
                      No billing history available yet.
                    </Typography>
                  </Paper>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Receipt #</TableCell>
                          <TableCell>Plan</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {receipts.map((receipt) => (
                          <TableRow key={receipt._id}>
                            <TableCell>{formatDate(receipt.date)}</TableCell>
                            <TableCell>{receipt.receiptNumber}</TableCell>
                            <TableCell>{receipt.planName}</TableCell>
                            <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={receipt.status.toUpperCase()} 
                                color={receipt.status === 'paid' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                onClick={() => handleViewReceipt(receipt._id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Plan Change
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change your subscription to the {selectedPlan?.name} plan? Your subscription will be updated immediately and you will be charged a prorated amount for the remainder of your billing cycle.
          </DialogContentText>
          
          {selectedPlan && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                New Plan Details:
              </Typography>
              <Typography variant="body1">
                {selectedPlan.name} - {formatCurrency(selectedPlan.price)}/month
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Includes {selectedPlan.propertyAllowance} properties
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmUpgradePlan} 
            variant="contained" 
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Subscription
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription? Your subscription will remain active until the end of your current billing period on {subscription ? formatDate(subscription.currentPeriodEnd) : ''}.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error.main">
              After cancellation, you'll lose access to:
            </Typography>
            <List dense>
              <ListItem dense disableGutters>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CloseIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Adding new properties beyond your current limit" />
              </ListItem>
              <ListItem dense disableGutters>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CloseIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Advanced valuation features" />
              </ListItem>
              <ListItem dense disableGutters>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CloseIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Premium support" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Subscription
          </Button>
          <Button 
            onClick={confirmCancelSubscription} 
            variant="contained" 
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionManage;