import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Payments as PaymentsIcon,
  Build as BuildIcon,
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
// Import recharts components for analytics
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Define interfaces for our data
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

interface Property {
  _id: string;
  name: string;
  userId: string;
  address: string;
  propertyType: string;
  createdAt: string;
}

interface Subscription {
  _id: string;
  userId: string;
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
  userId: string;
  title: string;
  status: string;
  priority: string;
  cost: number;
  date: string;
}

interface Receipt {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  receiptNumber: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentSignups: User[];
  userGrowthData: any[];
  revenueTrendData: any[];
  planDistributionData: any[];
  propertyTypeData: any[];
}

// Admin Dashboard component
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // State for the dashboard data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/');
    }
  }, [user, navigate]);
  
  // Fetch all admin data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          statsResponse,
          usersResponse, 
          propertiesResponse, 
          subscriptionsResponse, 
          maintenanceResponse,
          receiptsResponse
        ] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/users'),
          axios.get('/api/admin/properties'),
          axios.get('/api/admin/subscriptions'),
          axios.get('/api/admin/maintenance'),
          axios.get('/api/admin/receipts')
        ]);
        
        setStats(statsResponse.data);
        setUsers(usersResponse.data);
        setProperties(propertiesResponse.data);
        setSubscriptions(subscriptionsResponse.data);
        setMaintenanceRecords(maintenanceResponse.data);
        setReceipts(receiptsResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load admin data');
        setLoading(false);
        toast.error('Failed to load admin dashboard data');
      }
    };
    
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user]);
  
  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
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
  
  // Dashboard charts colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
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
            Error Loading Admin Dashboard
          </Typography>
          <Typography paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/"
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            Admin Dashboard
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Manage users, subscriptions, and monitor platform performance
        </Typography>
      </Box>
      
      {/* Stats Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Users
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="primary.main">
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.activeUsers} active users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HomeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Properties
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="primary.main">
                  {stats.totalProperties}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Managed on the platform
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaymentsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Subscriptions
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="primary.main">
                  {stats.activeSubscriptions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active of {stats.totalSubscriptions} total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Revenue
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" color="primary.main">
                  {formatCurrency(stats.monthlyRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This month ({formatCurrency(stats.totalRevenue)} total)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Charts & Analytics */}
      {stats && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* User Growth Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.userGrowthData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke={theme.palette.primary.main}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Revenue Trend Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.revenueTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill={theme.palette.primary.main} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Subscription Plan Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Subscription Plan Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.planDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Subscribers']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          {/* Property Type Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Property Type Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.propertyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Properties']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Recent Activity and Data Tables */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Recent Activity" icon={<NotificationsIcon />} iconPosition="start" />
          <Tab label="Users" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Subscriptions" icon={<PaymentsIcon />} iconPosition="start" />
          <Tab label="Properties" icon={<HomeIcon />} iconPosition="start" />
          <Tab label="Maintenance" icon={<BuildIcon />} iconPosition="start" />
          <Tab label="Receipts" icon={<ReceiptIcon />} iconPosition="start" />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {/* Recent Activity Tab */}
          {tabValue === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              
              <Grid container spacing={3}>
                {/* Recent Sign-ups */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Recent Sign-ups
                    </Typography>
                    <List>
                      {stats?.recentSignups.map((user) => (
                        <ListItem key={user._id} divider>
                          <ListItemIcon>
                            <PeopleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={user.username}
                            secondary={`${user.email} | Joined: ${formatDate(user.createdAt)}`}
                          />
                          <Button
                            size="small"
                            component={Link}
                            to={`/admin/users/${user._id}`}
                            endIcon={<NavigateNextIcon />}
                          >
                            View
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
                
                {/* Pending Maintenance */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Pending Maintenance Tasks
                    </Typography>
                    <List>
                      {maintenanceRecords
                        .filter(record => record.status === 'pending')
                        .slice(0, 5)
                        .map((record) => (
                          <ListItem key={record._id} divider>
                            <ListItemIcon>
                              <BuildIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText
                              primary={record.title}
                              secondary={`Priority: ${record.priority} | Date: ${formatDate(record.date)}`}
                            />
                            <Button
                              size="small"
                              component={Link}
                              to={`/admin/maintenance/${record._id}`}
                              endIcon={<NavigateNextIcon />}
                            >
                              View
                            </Button>
                          </ListItem>
                        ))}
                    </List>
                  </Paper>
                </Grid>
                
                {/* Expiring Subscriptions */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Soon Expiring Subscriptions
                    </Typography>
                    <List>
                      {subscriptions
                        .filter(sub => {
                          const expiryDate = new Date(sub.currentPeriodEnd);
                          const now = new Date();
                          const diffTime = expiryDate.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays <= 7 && sub.status === 'active';
                        })
                        .slice(0, 5)
                        .map((sub) => (
                          <ListItem key={sub._id} divider>
                            <ListItemIcon>
                              <WarningIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`${sub.planName} (${formatCurrency(sub.price)}/month)`}
                              secondary={`Expires: ${formatDate(sub.currentPeriodEnd)} | Properties: ${sub.propertyCount}`}
                            />
                            <Button
                              size="small"
                              component={Link}
                              to={`/admin/subscriptions/${sub._id}`}
                              endIcon={<NavigateNextIcon />}
                            >
                              View
                            </Button>
                          </ListItem>
                        ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Users Tab */}
          {tabValue === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Users
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/admin/users/new"
                >
                  Add New User
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Joined Date</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                              color={user.role === 'admin' ? 'secondary' : 'primary'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              component={Link}
                              to={`/admin/users/${user._id}`}
                            >
                              View / Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
          
          {/* Subscriptions Tab */}
          {tabValue === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                Subscriptions
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Plan</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Properties</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Next Billing</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscriptions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((subscription) => (
                        <TableRow key={subscription._id}>
                          <TableCell>{subscription.planName}</TableCell>
                          <TableCell>
                            {users.find(u => u._id === subscription.userId)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>{subscription.propertyCount}</TableCell>
                          <TableCell>
                            <Chip 
                              label={subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)} 
                              color={getStatusColor(subscription.status) as any}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{formatDate(subscription.currentPeriodEnd)}</TableCell>
                          <TableCell>{formatCurrency(subscription.price)}/month</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              component={Link}
                              to={`/admin/subscriptions/${subscription._id}`}
                            >
                              View / Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={subscriptions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
          
          {/* Properties Tab */}
          {tabValue === 3 && (
            <>
              <Typography variant="h6" gutterBottom>
                Properties
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Added Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {properties
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((property) => (
                        <TableRow key={property._id}>
                          <TableCell>{property.name}</TableCell>
                          <TableCell>{property.address}</TableCell>
                          <TableCell>
                            {property.propertyType.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </TableCell>
                          <TableCell>
                            {users.find(u => u._id === property.userId)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>{formatDate(property.createdAt)}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              component={Link}
                              to={`/admin/properties/${property._id}`}
                            >
                              View / Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={properties.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
          
          {/* Maintenance Tab */}
          {tabValue === 4 && (
            <>
              <Typography variant="h6" gutterBottom>
                Maintenance Records
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Property</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceRecords
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>{record.title}</TableCell>
                          <TableCell>
                            {properties.find(p => p._id === record.propertyId)?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.status.charAt(0).toUpperCase() + record.status.slice(1)} 
                              color={getStatusColor(record.status) as any}
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.priority.charAt(0).toUpperCase() + record.priority.slice(1)} 
                              color={
                                record.priority === 'high' 
                                  ? 'error' 
                                  : record.priority === 'medium' 
                                    ? 'warning' 
                                    : 'info'
                              }
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{formatCurrency(record.cost)}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              component={Link}
                              to={`/admin/maintenance/${record._id}`}
                            >
                              View / Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={maintenanceRecords.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
          
          {/* Receipts Tab */}
          {tabValue === 5 && (
            <>
              <Typography variant="h6" gutterBottom>
                Receipt History
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Receipt #</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {receipts
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((receipt) => (
                        <TableRow key={receipt._id}>
                          <TableCell>{receipt.receiptNumber}</TableCell>
                          <TableCell>
                            {users.find(u => u._id === receipt.userId)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>{formatCurrency(receipt.amount)}</TableCell>
                          <TableCell>{formatDate(receipt.date)}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              component={Link}
                              to={`/admin/receipts/${receipt._id}`}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
            </>
          )}
        </Box>
      </Paper>
      
      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/admin/users/new"
              startIcon={<PeopleIcon />}
            >
              Add User
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/admin/reports"
              startIcon={<AssessmentIcon />}
            >
              Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/admin/subscriptions/plans"
              startIcon={<PaymentsIcon />}
            >
              Manage Plans
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/admin/maintenance/pending"
              startIcon={<BuildIcon />}
            >
              Pending Maintenance
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/admin/receipts/generate"
              startIcon={<ReceiptIcon />}
            >
              Generate Receipt
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/admin/backup"
              startIcon={<CheckCircleIcon />}
            >
              System Backup
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;