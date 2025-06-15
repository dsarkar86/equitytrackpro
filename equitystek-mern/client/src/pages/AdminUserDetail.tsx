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
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Payments as PaymentsIcon,
  Build as BuildIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  LockReset as LockResetIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'owner' | 'tradesperson' | 'investor' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

interface Property {
  _id: string;
  name: string;
  address: string;
  propertyType: string;
  createdAt: string;
}

interface Subscription {
  _id: string;
  planId: string;
  planName: string;
  propertyCount: number;
  status: string;
  currentPeriodEnd: string;
  price: number;
}

interface MaintenanceRecord {
  _id: string;
  propertyId: string;
  title: string;
  status: string;
  priority: string;
  date: string;
}

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State for the user data
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: ''
  });
  
  // Reset password dialog state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Delete user dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // User's properties, subscriptions, and maintenance records
  const [properties, setProperties] = useState<Property[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Check if user is admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If id is "new", we're creating a new user
        if (id === 'new') {
          setUser(null);
          setEditMode(true);
          setFormData({
            username: '',
            email: '',
            role: 'owner'
          });
          setLoading(false);
          return;
        }
        
        // Fetch user data
        const userResponse = await axios.get(`/api/admin/users/${id}`);
        setUser(userResponse.data);
        setFormData({
          username: userResponse.data.username,
          email: userResponse.data.email,
          role: userResponse.data.role
        });
        
        // Fetch user's properties
        const propertiesResponse = await axios.get(`/api/admin/users/${id}/properties`);
        setProperties(propertiesResponse.data);
        
        // Fetch user's subscription
        try {
          const subscriptionResponse = await axios.get(`/api/admin/users/${id}/subscription`);
          setSubscription(subscriptionResponse.data);
        } catch (err) {
          // User might not have a subscription
          setSubscription(null);
        }
        
        // Fetch user's maintenance records
        const maintenanceResponse = await axios.get(`/api/admin/users/${id}/maintenance`);
        setMaintenanceRecords(maintenanceResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load user data');
        setLoading(false);
        toast.error('Failed to load user data');
      }
    };
    
    if (currentUser && currentUser.role === 'admin') {
      fetchData();
    }
  }, [id, currentUser]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };
  
  // Handle save user
  const handleSaveUser = async () => {
    try {
      if (!formData.username || !formData.email || !formData.role) {
        toast.error('All fields are required');
        return;
      }
      
      if (id === 'new') {
        // Create new user
        await axios.post('/api/admin/users', {
          ...formData,
          password: 'ChangeMe123!' // Default password
        });
        toast.success('User created successfully');
        navigate('/admin/dashboard');
      } else {
        // Update existing user
        await axios.patch(`/api/admin/users/${id}`, formData);
        setUser({
          ...user!,
          ...formData
        });
        setEditMode(false);
        toast.success('User updated successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };
  
  // Handle reset password
  const handleResetPassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      await axios.post(`/api/admin/users/${id}/reset-password`, {
        newPassword
      });
      
      setResetDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password reset successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setDeleteDialogOpen(false);
      toast.success('User deleted successfully');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'canceled':
      case 'failed':
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
            Error Loading User
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
            <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
            {id === 'new' ? 'Add New User' : (user?.username || 'User Details')}
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            {id === 'new' ? 'Add New User' : (user?.username || 'User Details')}
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
      
      {/* User Form or User Info */}
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
                Edit User
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete User
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      User Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Username:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {user?.username}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Email:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {user?.email}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Role:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Chip 
                          label={user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} 
                          color={user?.role === 'admin' ? 'secondary' : 'primary'}
                          size="small" 
                        />
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Joined:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Last Login:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body1">
                          {user?.lastLogin ? formatDate(user.lastLogin) : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<LockResetIcon />}
                        onClick={() => setResetDialogOpen(true)}
                        fullWidth
                      >
                        Reset Password
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Account Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                          <HomeIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            Properties
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {properties.length}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                          <BuildIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            Maintenance Records
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {maintenanceRecords.length}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body2" color="text.secondary">
                            Current Subscription:
                          </Typography>
                          {subscription ? (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {subscription.planName}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                  Status: 
                                  <Chip 
                                    label={subscription.status} 
                                    color={getStatusColor(subscription.status) as any}
                                    size="small" 
                                    sx={{ ml: 1 }}
                                  />
                                </Typography>
                                <Typography variant="body2">
                                  Expires: {formatDate(subscription.currentPeriodEnd)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                  Properties: {subscription.propertyCount}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  ${subscription.price}/month
                                </Typography>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic' }}>
                              No active subscription
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            {/* Edit Mode or New User Form */}
            <Typography variant="h6" gutterBottom>
              {id === 'new' ? 'New User Information' : 'Edit User Information'}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="tradesperson">Tradesperson</MenuItem>
                    <MenuItem value="investor">Investor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {id === 'new' && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Note: A default password will be set for the new user. They will need to reset it on first login.
                  </Typography>
                </Grid>
              )}
              
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
                          username: user?.username || '',
                          email: user?.email || '',
                          role: user?.role || 'owner'
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
                    onClick={handleSaveUser}
                  >
                    {id === 'new' ? 'Create User' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
      
      {/* User Details Tabs - Only show if viewing existing user */}
      {id !== 'new' && !editMode && (
        <Paper sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Properties" icon={<HomeIcon />} iconPosition="start" />
            <Tab label="Maintenance Records" icon={<BuildIcon />} iconPosition="start" />
            <Tab label="Subscription" icon={<PaymentsIcon />} iconPosition="start" />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            {/* Properties Tab */}
            {tabValue === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  User's Properties
                </Typography>
                
                {properties.length > 0 ? (
                  <List>
                    {properties.map((property) => (
                      <Paper key={property._id} sx={{ mb: 2, p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {property.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {property.address}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip 
                                label={property.propertyType.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                Added: {formatDate(property.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/admin/properties/${property._id}`}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4, fontStyle: 'italic' }}>
                    This user has no properties registered.
                  </Typography>
                )}
              </>
            )}
            
            {/* Maintenance Records Tab */}
            {tabValue === 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  User's Maintenance Records
                </Typography>
                
                {maintenanceRecords.length > 0 ? (
                  <List>
                    {maintenanceRecords.map((record) => (
                      <Paper key={record._id} sx={{ mb: 2, p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {record.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Property: {properties.find(p => p._id === record.propertyId)?.name || 'Unknown'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip 
                                label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                size="small"
                                color={getStatusColor(record.status) as any}
                              />
                              <Chip 
                                label={record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                                size="small"
                                color={
                                  record.priority === 'high' 
                                    ? 'error' 
                                    : record.priority === 'medium' 
                                      ? 'warning' 
                                      : 'info'
                                }
                              />
                              <Typography variant="caption" color="text.secondary">
                                Date: {formatDate(record.date)}
                              </Typography>
                            </Box>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            component={Link}
                            to={`/admin/maintenance/${record._id}`}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4, fontStyle: 'italic' }}>
                    This user has no maintenance records.
                  </Typography>
                )}
              </>
            )}
            
            {/* Subscription Tab */}
            {tabValue === 2 && (
              <>
                <Typography variant="h6" gutterBottom>
                  User's Subscription
                </Typography>
                
                {subscription ? (
                  <Box sx={{ mt: 2 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" gutterBottom>
                          {subscription.planName}
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <List>
                              <ListItem divider>
                                <ListItemText 
                                  primary="Status" 
                                  secondary={
                                    <Chip 
                                      label={subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)} 
                                      color={getStatusColor(subscription.status) as any}
                                      size="small" 
                                      sx={{ mt: 1 }}
                                    />
                                  }
                                />
                              </ListItem>
                              
                              <ListItem divider>
                                <ListItemText 
                                  primary="Billing Period Ends" 
                                  secondary={formatDate(subscription.currentPeriodEnd)}
                                />
                              </ListItem>
                              
                              <ListItem>
                                <ListItemText 
                                  primary="Properties" 
                                  secondary={subscription.propertyCount}
                                />
                              </ListItem>
                            </List>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                              <Typography variant="h6" gutterBottom>
                                Monthly Billing
                              </Typography>
                              <Typography variant="h4" fontWeight="bold">
                                ${subscription.price}
                              </Typography>
                              <Typography variant="body2">
                                Next payment due on {formatDate(subscription.currentPeriodEnd)}
                              </Typography>
                              
                              <Box sx={{ mt: 2 }}>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  component={Link}
                                  to={`/admin/subscriptions/${subscription._id}`}
                                  fullWidth
                                >
                                  Manage Subscription
                                </Button>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      This user doesn't have an active subscription.
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      to={`/admin/subscriptions/new?userId=${id}`}
                    >
                      Create Subscription
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset User Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new password for this user. They will need to use this password to log in next time.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleResetPassword} color="primary" variant="contained">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone, and all associated data may be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserDetail;