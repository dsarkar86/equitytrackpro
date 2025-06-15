import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  CardActions,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Construction as ConstructionIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon,
  ReceiptLong as ReceiptIcon,
  Notifications as NotificationIcon,
  Dashboard as DashboardIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import PropertyCard from '../components/ui/PropertyCard';
import MaintenanceRecord from '../components/ui/MaintenanceRecord';

interface Property {
  _id: string;
  name: string;
  address: string;
  propertyType: string;
  purchasePrice: number;
  purchaseDate: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  createdAt: string;
}

interface MaintenanceRecord {
  _id: string;
  propertyId: string;
  propertyName?: string;
  title: string;
  description: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cost?: number;
  dueDate?: string;
  completedDate?: string;
  category: string;
  assignedTo?: string;
  documents?: string[];
  createdAt: string;
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
}

interface PropertyValueSummary {
  _id: string;
  name: string;
  purchasePrice: number;
  currentValue: number;
  growth: number;
  growthPercentage: number;
}

interface Notification {
  id: string;
  type: 'maintenance' | 'valuation' | 'subscription' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
  propertyId?: string;
  urgency?: 'low' | 'medium' | 'high';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // Component states
  const [properties, setProperties] = useState<Property[]>([]);
  const [recentMaintenance, setRecentMaintenance] = useState<MaintenanceRecord[]>([]);
  const [pendingMaintenance, setPendingMaintenance] = useState<MaintenanceRecord[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [propertyValues, setPropertyValues] = useState<PropertyValueSummary[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [valuationLoading, setValuationLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading your dashboard...');
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingMessage('Fetching your properties...');
        
        // Fetch properties
        const propertiesResponse = await axios.get('/api/properties');
        setProperties(propertiesResponse.data);
        
        // Fetch subscription data
        setLoadingMessage('Checking your subscription...');
        try {
          const subscriptionResponse = await axios.get('/api/subscription');
          setSubscription(subscriptionResponse.data);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setSubscription(null);
        }
        
        setLoading(false);
        
        // Fetch maintenance records (in parallel)
        setMaintenanceLoading(true);
        try {
          const maintenanceResponse = await axios.get('/api/maintenance');
          
          // Filter recent and pending maintenance
          const allRecords = maintenanceResponse.data;
          
          // Get recent maintenance (last 5)
          const sortedByDate = [...allRecords].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentMaintenance(sortedByDate.slice(0, 5));
          
          // Get pending/urgent maintenance
          const pending = allRecords.filter(
            record => record.status !== 'completed' && 
            (record.priority === 'high' || record.priority === 'urgent')
          );
          setPendingMaintenance(pending);
          
          setMaintenanceLoading(false);
        } catch (error) {
          console.error('Error fetching maintenance:', error);
          setMaintenanceLoading(false);
        }
        
        // Fetch property valuations (in parallel)
        setValuationLoading(true);
        try {
          if (propertiesResponse.data.length > 0) {
            const valueSummaries: PropertyValueSummary[] = [];
            
            // For each property, get the latest valuation
            for (const property of propertiesResponse.data) {
              try {
                const valuationsResponse = await axios.get(`/api/properties/${property._id}/valuations`);
                
                if (valuationsResponse.data.length > 0) {
                  // Sort and get the latest valuation
                  const sortedValuations = [...valuationsResponse.data].sort(
                    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
                  
                  const latestValue = sortedValuations[0].value;
                  const growth = latestValue - property.purchasePrice;
                  const growthPercentage = (growth / property.purchasePrice) * 100;
                  
                  valueSummaries.push({
                    _id: property._id,
                    name: property.name,
                    purchasePrice: property.purchasePrice,
                    currentValue: latestValue,
                    growth,
                    growthPercentage
                  });
                } else {
                  // If no valuations, use purchase price as current value
                  valueSummaries.push({
                    _id: property._id,
                    name: property.name,
                    purchasePrice: property.purchasePrice,
                    currentValue: property.purchasePrice,
                    growth: 0,
                    growthPercentage: 0
                  });
                }
              } catch (error) {
                console.error(`Error fetching valuations for property ${property._id}:`, error);
              }
            }
            
            setPropertyValues(valueSummaries);
          }
          
          setValuationLoading(false);
        } catch (error) {
          console.error('Error fetching valuations:', error);
          setValuationLoading(false);
        }
        
        // Fetch notifications (simulated - would connect to real API)
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'maintenance',
            title: 'Maintenance due',
            message: 'Annual HVAC service is due in 7 days',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            propertyId: propertiesResponse.data[0]?._id,
            urgency: 'medium'
          },
          {
            id: '2',
            type: 'subscription',
            title: 'Subscription renewing',
            message: 'Your subscription will renew in 5 days',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            read: true,
            urgency: 'low'
          },
          {
            id: '3',
            type: 'valuation',
            title: 'Property value increased',
            message: 'Main Street property value increased by 5.2%',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            read: false,
            propertyId: propertiesResponse.data[0]?._id,
            urgency: 'low'
          }
        ];
        
        setNotifications(sampleNotifications);
        
      } catch (err: any) {
        console.error('Dashboard loading error:', err);
        setLoading(false);
        setMaintenanceLoading(false);
        setValuationLoading(false);
        toast.error('Error loading dashboard data');
      }
    };
    
    fetchData();
  }, []);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Calculate portfolio summary
  const calculatePortfolioSummary = () => {
    if (propertyValues.length === 0) {
      return {
        totalValue: 0,
        totalGrowth: 0,
        averageGrowthPercentage: 0
      };
    }
    
    const totalValue = propertyValues.reduce((sum, property) => sum + property.currentValue, 0);
    const totalGrowth = propertyValues.reduce((sum, property) => sum + property.growth, 0);
    const averageGrowthPercentage = propertyValues.reduce((sum, property) => sum + property.growthPercentage, 0) / propertyValues.length;
    
    return {
      totalValue,
      totalGrowth,
      averageGrowthPercentage
    };
  };
  
  const portfolioSummary = calculatePortfolioSummary();
  
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
            {loadingMessage}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Welcome Header */}
      <Box sx={{ 
        mb: 5,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.username}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Dashboard | {new Date().toLocaleDateString('en-AU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/properties/add"
          >
            Add Property
          </Button>
          <IconButton
            color="primary"
            aria-label="refresh"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Subscription Alert for Limits */}
      {subscription && subscription.propertyCount >= subscription.propertyAllowance && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              component={Link}
              to="/subscription/manage"
            >
              Upgrade
            </Button>
          }
        >
          <AlertTitle>Subscription Limit Reached</AlertTitle>
          You've used {subscription.propertyCount} of {subscription.propertyAllowance} properties in your {subscription.planName} plan. 
          Upgrade your plan to add more properties.
        </Alert>
      )}
      
      {/* Properties Overview */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h5" component="h2">
            Your Properties
          </Typography>
          <Button
            component={Link}
            to="/properties"
            endIcon={<ArrowForwardIcon />}
          >
            View All
          </Button>
        </Box>
        
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Properties Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Add your first property to start tracking its maintenance and value.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              to="/properties/add"
            >
              Add Your First Property
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {properties.slice(0, 3).map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <PropertyCard property={property} />
              </Grid>
            ))}
            {properties.length > 3 && (
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 5
                  }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {properties.length - 3} More Properties
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View all your properties
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      component={Link} 
                      to="/properties"
                      variant="outlined"
                    >
                      View All Properties
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
      
      {/* Main Dashboard Widgets */}
      <Grid container spacing={4}>
        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Property Count */}
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Properties
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="medium">
                  {properties.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subscription && (
                    <>
                      {properties.length} of {subscription.propertyAllowance} allowed
                    </>
                  )}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Maintenance Count */}
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ConstructionIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Pending Maintenance
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="medium">
                  {maintenanceLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    pendingMaintenance.length
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pendingMaintenance.filter(m => m.priority === 'urgent').length} urgent tasks
                </Typography>
              </Paper>
            </Grid>
            
            {/* Portfolio Value */}
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Portfolio Value
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="medium">
                  {valuationLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    formatCurrency(portfolioSummary.totalValue)
                  )}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={portfolioSummary.totalGrowth > 0 ? 'success.main' : portfolioSummary.totalGrowth < 0 ? 'error.main' : 'text.secondary'}
                >
                  {portfolioSummary.totalGrowth > 0 ? '↑ ' : portfolioSummary.totalGrowth < 0 ? '↓ ' : ''}
                  {formatPercentage(portfolioSummary.averageGrowthPercentage)} average growth
                </Typography>
              </Paper>
            </Grid>
            
            {/* Subscription Status */}
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Subscription
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="medium">
                  {subscription ? subscription.planName : 'No Subscription'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subscription ? formatCurrency(subscription.pricePerMonth) + '/month' : 'Upgrade to add more properties'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Notifications Section */}
        <Grid item xs={12} md={6} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Notifications
                  </Typography>
                </Box>
                <Chip 
                  label={`${notifications.filter(n => !n.read).length} new`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {notifications.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No notifications
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {notifications.map((notification) => (
                    <Box key={notification.id} sx={{ mb: 2 }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          bgcolor: notification.read ? 'transparent' : 'action.hover'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          {notification.urgency === 'high' ? (
                            <WarningIcon color="error" sx={{ mr: 1.5, mt: 0.5 }} />
                          ) : notification.urgency === 'medium' ? (
                            <WarningIcon color="warning" sx={{ mr: 1.5, mt: 0.5 }} />
                          ) : (
                            <InfoIcon color="info" sx={{ mr: 1.5, mt: 0.5 }} />
                          )}
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {notification.title}
                              {!notification.read && (
                                <Chip 
                                  label="NEW" 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1, height: 18, fontSize: '0.6rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {new Date(notification.date).toLocaleDateString('en-AU', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                          {notification.propertyId && (
                            <Button
                              size="small"
                              component={Link}
                              to={
                                notification.type === 'maintenance'
                                  ? `/properties/${notification.propertyId}/maintenance`
                                  : notification.type === 'valuation'
                                  ? `/properties/${notification.propertyId}/valuation`
                                  : `/properties/${notification.propertyId}`
                              }
                              variant="outlined"
                              sx={{ ml: 1, minWidth: 0, p: '4px 8px' }}
                            >
                              View
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                  <Button 
                    fullWidth
                    variant="text"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    View All Notifications
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Maintenance */}
        <Grid item xs={12} md={6} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ConstructionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Recent Maintenance
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to="/maintenance"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {maintenanceLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : recentMaintenance.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    No maintenance records yet
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to="/maintenance/add"
                    startIcon={<AddIcon />}
                  >
                    Add Maintenance Record
                  </Button>
                </Box>
              ) : (
                <Box>
                  {recentMaintenance.map((record) => (
                    <Box key={record._id} sx={{ mb: 2 }}>
                      <MaintenanceRecord record={record} showProperty compact />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Property Value Highlights */}
        <Grid item xs={12} xl={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Property Value Insights
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  to="/portfolio"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                >
                  Full Analysis
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {valuationLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : propertyValues.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Add properties to see valuation insights
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to="/properties/add"
                    startIcon={<AddIcon />}
                  >
                    Add Property
                  </Button>
                </Box>
              ) : (
                <Box>
                  {/* Best Performing Property */}
                  {propertyValues.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Best Performing Property
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'success.light',
                          color: 'success.dark'
                        }}
                      >
                        {(() => {
                          // Find best performing property
                          const sortedByPerformance = [...propertyValues].sort(
                            (a, b) => b.growthPercentage - a.growthPercentage
                          );
                          const bestProperty = sortedByPerformance[0];
                          
                          return (
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {bestProperty.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" fontWeight="medium">
                                  {formatPercentage(bestProperty.growthPercentage)} growth
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Current value: {formatCurrency(bestProperty.currentValue)}
                              </Typography>
                              <Typography variant="body2">
                                Total growth: {formatCurrency(bestProperty.growth)}
                              </Typography>
                              <Button
                                size="small"
                                component={Link}
                                to={`/properties/${bestProperty._id}/valuation`}
                                sx={{ mt: 1 }}
                                variant="outlined"
                                color="inherit"
                              >
                                View Details
                              </Button>
                            </Box>
                          );
                        })()}
                      </Paper>
                    </Box>
                  )}
                  
                  {/* Properties Needing Attention */}
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Properties Needing Attention
                  </Typography>
                  
                  {propertyValues.filter(p => p.growthPercentage < 0).length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          All properties are performing well!
                        </Typography>
                      </Box>
                    </Paper>
                  ) : (
                    propertyValues
                      .filter(p => p.growthPercentage < 0)
                      .sort((a, b) => a.growthPercentage - b.growthPercentage)
                      .slice(0, 2)
                      .map(property => (
                        <Paper 
                          key={property._id}
                          variant="outlined" 
                          sx={{ p: 2, mb: 2 }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle2">
                                {property.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" color="error.main">
                                  {formatPercentage(property.growthPercentage)} growth
                                </Typography>
                              </Box>
                            </Box>
                            <Button
                              size="small"
                              component={Link}
                              to={`/properties/${property._id}/valuation`}
                              variant="outlined"
                            >
                              View
                            </Button>
                          </Box>
                        </Paper>
                      ))
                  )}
                  
                  {/* Add Valuation Reminder */}
                  {propertyValues.filter(p => p.growth === 0).length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <AlertTitle>Update Valuations</AlertTitle>
                      {propertyValues.filter(p => p.growth === 0).length} of your properties need 
                      valuation updates to track growth.
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Quick Links */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/properties/add"
                  sx={{ py: 2 }}
                  startIcon={<HomeIcon />}
                >
                  Add Property
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/maintenance/add"
                  sx={{ py: 2 }}
                  startIcon={<ConstructionIcon />}
                >
                  Log Maintenance
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/portfolio"
                  sx={{ py: 2 }}
                  startIcon={<AccountBalanceIcon />}
                >
                  View Portfolio
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/subscription/manage"
                  sx={{ py: 2 }}
                  startIcon={<ReceiptIcon />}
                >
                  Manage Subscription
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;