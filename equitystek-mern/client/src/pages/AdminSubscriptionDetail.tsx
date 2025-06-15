import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Breadcrumbs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Payments as PaymentsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  propertyPrice: number;
  maxProperties: number | null;
}

interface Subscription {
  _id: string;
  userId: string;
  planId: string;
  planName: string;
  propertyCount: number;
  status: 'active' | 'canceled' | 'past_due' | 'paused';
  currentPeriodEnd: string;
  startDate: string;
  price: number;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface Receipt {
  _id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  date: string;
  receiptNumber: string;
  description: string;
}

const AdminSubscriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State for the subscription data
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    planId: '',
    status: '',
    propertyCount: 0,
    currentPeriodEnd: '',
    price: 0
  });
  
  // Delete subscription dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Generate receipt dialog state
  const [generateReceiptDialogOpen, setGenerateReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState({
    amount: 0,
    description: ''
  });
  
  // Check if user is admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Fetch subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If id is "new", we're creating a new subscription
        if (id === 'new') {
          // Get the userId from query params if available
          const params = new URLSearchParams(window.location.search);
          const userId = params.get('userId');
          
          // If userId is provided, fetch the user
          if (userId) {
            const userResponse = await axios.get(`/api/admin/users/${userId}`);
            setUser(userResponse.data);
          }
          
          // Fetch available subscription plans
          const plansResponse = await axios.get('/api/subscription/plans');
          setPlans(plansResponse.data);
          
          setSubscription(null);
          setEditMode(true);
          setFormData({
            planId: plansResponse.data.length > 0 ? plansResponse.data[0]._id : '',
            status: 'active',
            propertyCount: 1,
            currentPeriodEnd: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            price: plansResponse.data.length > 0 ? plansResponse.data[0].basePrice : 0
          });
          setLoading(false);
          return;
        }
        
        // Fetch subscription data
        const subscriptionResponse = await axios.get(`/api/admin/subscriptions/${id}`);
        setSubscription(subscriptionResponse.data);
        
        // Fetch associated user
        const userResponse = await axios.get(`/api/admin/users/${subscriptionResponse.data.userId}`);
        setUser(userResponse.data);
        
        // Fetch available subscription plans
        const plansResponse = await axios.get('/api/subscription/plans');
        setPlans(plansResponse.data);
        
        // Fetch subscription receipts
        const receiptsResponse = await axios.get(`/api/admin/subscriptions/${id}/receipts`);
        setReceipts(receiptsResponse.data);
        
        // Set form data
        setFormData({
          planId: subscriptionResponse.data.planId,
          status: subscriptionResponse.data.status,
          propertyCount: subscriptionResponse.data.propertyCount,
          currentPeriodEnd: format(new Date(subscriptionResponse.data.currentPeriodEnd), 'yyyy-MM-dd'),
          price: subscriptionResponse.data.price
        });
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load subscription data');
        setLoading(false);
        toast.error('Failed to load subscription data');
      }
    };
    
    if (currentUser && currentUser.role === 'admin') {
      fetchData();
    }
  }, [id, currentUser]);
  
  // Calculate price when plan or property count changes
  useEffect(() => {
    if (plans.length === 0) return;
    
    const selectedPlan = plans.find(plan => plan._id === formData.planId);
    if (!selectedPlan) return;
    
    const price = selectedPlan.basePrice + (formData.propertyCount - 1) * selectedPlan.propertyPrice;
    setFormData(prev => ({ ...prev, price }));
  }, [formData.planId, formData.propertyCount, plans]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };
  
  // Handle save subscription
  const handleSaveSubscription = async () => {
    try {
      if (!formData.planId || !formData.status || formData.propertyCount < 1) {
        toast.error('All fields are required and property count must be at least 1');
        return;
      }
      
      if (id === 'new') {
        // Create new subscription
        if (!user) {
          toast.error('You must select a user for the subscription');
          return;
        }
        
        await axios.post('/api/admin/subscriptions', {
          ...formData,
          userId: user._id
        });
        
        toast.success('Subscription created successfully');
        navigate('/admin/dashboard');
      } else {
        // Update existing subscription
        await axios.patch(`/api/admin/subscriptions/${id}`, formData);
        
        // Update subscription object
        const planName = plans.find(p => p._id === formData.planId)?.name || '';
        setSubscription({
          ...subscription!,
          ...formData,
          planName
        });
        
        setEditMode(false);
        toast.success('Subscription updated successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save subscription');
    }
  };
  
  // Handle delete subscription
  const handleDeleteSubscription = async () => {
    try {
      await axios.delete(`/api/admin/subscriptions/${id}`);
      setDeleteDialogOpen(false);
      toast.success('Subscription deleted successfully');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete subscription');
    }
  };
  
  // Handle generate receipt
  const handleGenerateReceipt = async () => {
    try {
      if (receiptData.amount <= 0 || !receiptData.description) {
        toast.error('Please enter a valid amount and description');
        return;
      }
      
      await axios.post('/api/admin/receipts/generate', {
        userId: subscription?.userId,
        subscriptionId: subscription?._id,
        amount: receiptData.amount,
        description: receiptData.description
      });
      
      // Refresh receipts
      const receiptsResponse = await axios.get(`/api/admin/subscriptions/${id}/receipts`);
      setReceipts(receiptsResponse.data);
      
      setGenerateReceiptDialogOpen(false);
      setReceiptData({ amount: 0, description: '' });
      toast.success('Receipt generated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate receipt');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  // Format card display
  const formatCardDetails = () => {
    if (!subscription?.paymentMethod) return 'No payment method on file';
    
    const { brand, last4, expMonth, expYear } = subscription.paymentMethod;
    return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ending in ${last4} (Expires ${expMonth}/${expYear})`;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };
  
  // Get remaining days
  const getRemainingDays = () => {
    if (!subscription) return 0;
    
    const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = currentPeriodEnd.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
      case 'paused':
        return 'warning';
      case 'canceled':
      case 'past_due':
        return 'error';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && id !== 'new') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography variant="h5" gutterBottom>
            Error Loading Subscription
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/admin/dashboard"
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
            to="/admin/dashboard" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="small" />
            Admin Dashboard
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <PaymentsIcon sx={{ mr: 0.5 }} fontSize="small" />
            {id === 'new' ? 'Add New Subscription' : 'Subscription Details'}
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentsIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            {id === 'new' ? 'Add New Subscription' : `Subscription ${subscription?.planName}`}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/admin/dashboard"
        >
          Back to Dashboard
        </Button>
      </Box>
      
      {/* Subscription Form or Subscription Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        {id !== 'new' && !editMode ? (
          <>
            {/* View Mode */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ mr: 1 }}
              >
                Edit Subscription
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Subscription
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Subscription Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Plan:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1" fontWeight="medium">
                          {subscription?.planName}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Status:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Chip 
                          label={subscription?.status.charAt(0).toUpperCase() + subscription?.status.slice(1)} 
                          color={getStatusColor(subscription?.status || '') as any}
                          size="small" 
                        />
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Properties:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {subscription?.propertyCount}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Current Period Ends:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {formatDate(subscription?.currentPeriodEnd || '')} ({getRemainingDays()} days)
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Price:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1" fontWeight="medium" color="primary.main">
                          {formatCurrency(subscription?.price || 0)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Start Date:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {formatDate(subscription?.startDate || '')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        {user?.username || 'Unknown User'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {user?.email || 'No email address'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Role:
                    </Typography>
                    <Chip 
                      label={user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || 'Unknown'} 
                      color={user?.role === 'admin' ? 'secondary' : 'primary'}
                      size="small" 
                      sx={{ mb: 2 }}
                    />
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      component={Link}
                      to={`/admin/users/${user?._id}`}
                      sx={{ mt: 1 }}
                    >
                      View User Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Payment Information */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Payment Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" gutterBottom>
                      {subscription?.paymentMethod ? (
                        <>
                          <strong>Payment Method:</strong> {formatCardDetails()}
                        </>
                      ) : (
                        'No payment method on file'
                      )}
                    </Typography>
                    
                    {subscription?.stripeCustomerId && (
                      <Typography variant="body2" color="text.secondary">
                        Stripe Customer ID: {subscription.stripeCustomerId}
                      </Typography>
                    )}
                    
                    {subscription?.stripeSubscriptionId && (
                      <Typography variant="body2" color="text.secondary">
                        Stripe Subscription ID: {subscription.stripeSubscriptionId}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Button
                      variant="outlined"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setGenerateReceiptDialogOpen(true)}
                      fullWidth
                    >
                      Generate Manual Receipt
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Edit Mode or New Subscription Form */}
            <Typography variant="h6" gutterBottom>
              {id === 'new' ? 'New Subscription Information' : 'Edit Subscription Information'}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {id === 'new' && !user && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body1" color="warning.dark">
                  Please select a user for this subscription. You can add the subscription from the user's detail page.
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  component={Link}
                  to="/admin/dashboard"
                  sx={{ mt: 1 }}
                >
                  Back to Dashboard
                </Button>
              </Box>
            )}
            
            {(id !== 'new' || user) && (
              <>
                {/* User Info (if creating new subscription) */}
                {id === 'new' && user && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Creating subscription for: {user.username} ({user.email})
                    </Typography>
                  </Box>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Subscription Plan</InputLabel>
                      <Select
                        name="planId"
                        value={formData.planId}
                        onChange={handleInputChange}
                        label="Subscription Plan"
                      >
                        {plans.map(plan => (
                          <MenuItem key={plan._id} value={plan._id}>
                            {plan.name} - ${plan.basePrice}/mo base + ${plan.propertyPrice}/mo per property
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        label="Status"
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="paused">Paused</MenuItem>
                        <MenuItem value="canceled">Canceled</MenuItem>
                        <MenuItem value="past_due">Past Due</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="propertyCount"
                      label="Number of Properties"
                      type="number"
                      value={formData.propertyCount}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="currentPeriodEnd"
                      label="Current Period End Date"
                      type="date"
                      value={formData.currentPeriodEnd}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="price"
                      label="Monthly Price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                      InputProps={{ 
                        readOnly: true,
                        startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
                      }}
                      helperText="Price is calculated automatically based on the plan and number of properties"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (id === 'new') {
                            navigate('/admin/dashboard');
                          } else {
                            setEditMode(false);
                            setFormData({
                              planId: subscription?.planId || '',
                              status: subscription?.status || 'active',
                              propertyCount: subscription?.propertyCount || 1,
                              currentPeriodEnd: subscription?.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), 'yyyy-MM-dd') : '',
                              price: subscription?.price || 0
                            });
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveSubscription}
                      >
                        {id === 'new' ? 'Create Subscription' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}
      </Paper>
      
      {/* Receipts */}
      {id !== 'new' && !editMode && (
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ReceiptIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Receipt History
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {receipts.length > 0 ? (
              <List>
                {receipts.map((receipt) => (
                  <Paper
                    key={receipt._id}
                    elevation={1}
                    sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}
                  >
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Receipt #:
                        </Typography>
                        <Typography variant="body1">
                          {receipt.receiptNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Date:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(receipt.date)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Amount:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatCurrency(receipt.amount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/admin/receipts/${receipt._id}`}
                        >
                          View
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Description: {receipt.description}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 3, fontStyle: 'italic' }}>
                No receipts found for this subscription.
              </Typography>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Plan Information */}
      {id !== 'new' && !editMode && plans.length > 0 && (
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Plan Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {plans.map((plan) => (
              plan._id === subscription?.planId && (
                <Accordion key={plan._id} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {plan.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body1" paragraph>
                          {plan.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Base Price:
                        </Typography>
                        <Typography variant="body1">
                          ${plan.basePrice}/month
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Per Additional Property:
                        </Typography>
                        <Typography variant="body1">
                          ${plan.propertyPrice}/month
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          Max Properties:
                        </Typography>
                        <Typography variant="body1">
                          {plan.maxProperties ? plan.maxProperties : 'Unlimited'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Delete Subscription Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this subscription? This action cannot be undone.
            The user will lose access to all subscription benefits.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteSubscription} color="error" variant="contained">
            Delete Subscription
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Generate Receipt Dialog */}
      <Dialog open={generateReceiptDialogOpen} onClose={() => setGenerateReceiptDialogOpen(false)}>
        <DialogTitle>Generate Manual Receipt</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a manual receipt for this subscription. This can be used for tracking payments made outside of the system.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={receiptData.amount}
            onChange={(e) => setReceiptData({ ...receiptData, amount: Number(e.target.value) })}
            variant="outlined"
            InputProps={{ startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box> }}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={receiptData.description}
            onChange={(e) => setReceiptData({ ...receiptData, description: e.target.value })}
            variant="outlined"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateReceiptDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateReceipt} color="primary" variant="contained">
            Generate Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSubscriptionDetail;