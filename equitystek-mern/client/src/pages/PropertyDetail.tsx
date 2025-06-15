import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  House as HouseIcon,
  Build as BuildIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  description: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  image?: string;
  features: string[];
  notes: string;
}

interface MaintenanceRecord {
  _id: string;
  propertyId: string;
  title: string;
  description: string;
  date: string;
  cost: number;
  status: 'pending' | 'completed' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        
        // Fetch property details
        const propertyResponse = await axios.get(`/api/properties/${id}`);
        setProperty(propertyResponse.data);
        setEditedProperty(propertyResponse.data);
        
        // Fetch maintenance records for this property
        const maintenanceResponse = await axios.get(`/api/maintenance/property/${id}`);
        setMaintenanceRecords(maintenanceResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property data');
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [id]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteProperty = async () => {
    try {
      await axios.delete(`/api/properties/${id}`);
      toast.success('Property deleted successfully');
      navigate('/properties');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete property');
      handleDeleteDialogClose();
    }
  };
  
  const handleEditToggle = () => {
    if (editMode && property) {
      // Discard changes and reset form
      setEditedProperty(property);
    }
    setEditMode(!editMode);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedProperty) return;
    
    const { name, value } = e.target;
    setEditedProperty({
      ...editedProperty,
      [name]: name === 'purchasePrice' || name === 'currentValue' 
        ? parseFloat(value) 
        : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editedProperty) return;
    
    try {
      const response = await axios.patch(`/api/properties/${id}`, editedProperty);
      setProperty(response.data);
      setEditMode(false);
      toast.success('Property updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update property');
    }
  };
  
  // Format property type display
  const formatPropertyType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Calculate total maintenance costs
  const totalMaintenanceCosts = maintenanceRecords.reduce((total, record) => total + record.cost, 0);
  
  // Calculate property value change
  const calculateValueChange = () => {
    if (!property) return { amount: 0, percentage: 0 };
    
    const difference = property.currentValue - property.purchasePrice;
    const percentage = (difference / property.purchasePrice) * 100;
    
    return {
      amount: difference,
      percentage: percentage
    };
  };
  
  const valueChange = calculateValueChange();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !property) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography variant="h5" gutterBottom>
            Error
          </Typography>
          <Typography>
            {error || 'Property not found'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/properties"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Properties
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header with property name and actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                component={Link}
                to="/properties"
                startIcon={<ArrowBackIcon />}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              {editMode ? (
                <TextField
                  name="name"
                  value={editedProperty?.name || ''}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  label="Property Name"
                />
              ) : (
                <Typography variant="h4" component="h1">
                  <HouseIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                  {property.name}
                </Typography>
              )}
            </Box>
            {!editMode && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label={formatPropertyType(property.type)} 
                  sx={{ mr: 1, fontWeight: 'medium' }}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {property.address}
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              {editMode ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditToggle}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteDialogOpen}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="property tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<HouseIcon />} iconPosition="start" />
          <Tab label="Maintenance" icon={<BuildIcon />} iconPosition="start" />
          <Tab label="Valuation" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Documents" icon={<DescriptionIcon />} iconPosition="start" />
        </Tabs>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            {/* Left column - Property image and details */}
            <Grid item xs={12} md={6}>
              {editMode ? (
                <Box component="form" sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        name="type"
                        select
                        label="Property Type"
                        value={editedProperty?.type || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      >
                        <MenuItem value="single_family">Single Family</MenuItem>
                        <MenuItem value="condominium">Condominium</MenuItem>
                        <MenuItem value="townhouse">Townhouse</MenuItem>
                        <MenuItem value="multi_family">Multi-Family</MenuItem>
                        <MenuItem value="commercial">Commercial</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="address"
                        label="Address"
                        value={editedProperty?.address || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="purchaseDate"
                        label="Purchase Date"
                        type="date"
                        value={editedProperty?.purchaseDate.split('T')[0] || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="purchasePrice"
                        label="Purchase Price ($)"
                        type="number"
                        value={editedProperty?.purchasePrice || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="currentValue"
                        label="Current Value ($)"
                        type="number"
                        value={editedProperty?.currentValue || ''}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="description"
                        label="Description"
                        value={editedProperty?.description || ''}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="notes"
                        label="Notes"
                        value={editedProperty?.notes || ''}
                        onChange={handleInputChange}
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <>
                  <Box
                    component="img"
                    src={property.image || 'https://via.placeholder.com/600x400?text=Property'}
                    alt={property.name}
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 3
                    }}
                  />
                  
                  <Typography variant="h6" gutterBottom>
                    Property Details
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{formatPropertyType(property.type)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Purchase Date</Typography>
                      <Typography variant="body1">
                        {format(new Date(property.purchaseDate), 'PP')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{property.address}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Purchase Price</Typography>
                      <Typography variant="body1">${property.purchasePrice.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Current Value</Typography>
                      <Typography variant="body1" fontWeight="medium" color="success.main">
                        ${property.currentValue.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {property.description && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {property.description}
                      </Typography>
                    </Box>
                  )}
                  
                  {property.notes && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                        {property.notes}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Grid>
            
            {/* Right column - Stats and Quick Actions */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3, bgcolor: valueChange.amount >= 0 ? 'success.light' : 'error.light' }}>
                <Typography variant="h6" gutterBottom sx={{ color: valueChange.amount >= 0 ? 'success.dark' : 'error.dark' }}>
                  Property Value Change
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: valueChange.amount >= 0 ? 'success.dark' : 'error.dark' }}>
                      Since Purchase
                    </Typography>
                    <Typography variant="h4" sx={{ color: valueChange.amount >= 0 ? 'success.dark' : 'error.dark', fontWeight: 'bold' }}>
                      {valueChange.amount >= 0 ? '+' : ''}${valueChange.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: valueChange.amount >= 0 ? 'success.dark' : 'error.dark', fontWeight: 'bold' }}>
                    {valueChange.amount >= 0 ? '+' : ''}{valueChange.percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Paper>
              
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Maintenance Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Records</Typography>
                    <Typography variant="h5">{maintenanceRecords.length}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Costs</Typography>
                    <Typography variant="h5">${totalMaintenanceCosts.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pending Issues
                    </Typography>
                    {maintenanceRecords.filter(r => r.status === 'pending').length > 0 ? (
                      maintenanceRecords
                        .filter(r => r.status === 'pending')
                        .slice(0, 3)
                        .map(record => (
                          <Box key={record._id} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {record.title}
                              {record.priority === 'high' && (
                                <Chip 
                                  label="High" 
                                  size="small" 
                                  color="error" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          </Box>
                        ))
                    ) : (
                      <Typography variant="body2" color="success.main">
                        No pending maintenance issues
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      to={`/maintenance/add/${property._id}`}
                      startIcon={<BuildIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Log Maintenance
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      to={`/valuation/update/${property._id}`}
                      startIcon={<RefreshIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Update Valuation
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Maintenance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Maintenance History
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to={`/maintenance/add/${property._id}`}
              startIcon={<BuildIcon />}
            >
              Add Maintenance Record
            </Button>
          </Box>
          
          {maintenanceRecords.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <BuildIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No maintenance records yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Start tracking maintenance tasks, repairs, and improvements for this property.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to={`/maintenance/add/${property._id}`}
                startIcon={<BuildIcon />}
              >
                Add First Maintenance Record
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {maintenanceRecords.map((record) => (
                <Grid item xs={12} key={record._id}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" component="div">
                              {record.title}
                            </Typography>
                            <Chip 
                              label={record.status} 
                              size="small"
                              color={
                                record.status === 'completed' ? 'success' :
                                record.status === 'scheduled' ? 'info' : 'warning'
                              }
                              sx={{ ml: 1 }}
                            />
                            {record.priority === 'high' && (
                              <Chip 
                                label="High Priority" 
                                size="small" 
                                color="error" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {record.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(record.date), 'PP')}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            ${record.cost.toLocaleString()}
                          </Typography>
                          <Button
                            component={Link}
                            to={`/maintenance/${record._id}`}
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            View Details
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* Valuation Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Property Valuation
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to={`/valuation/update/${property._id}`}
              startIcon={<RefreshIcon />}
            >
              Update Property Value
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
                <Typography variant="h6" gutterBottom>
                  Current Valuation
                </Typography>
                <Typography variant="h3" color="success.main" sx={{ mb: 2, fontWeight: 'bold' }}>
                  ${property.currentValue.toLocaleString()}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Purchase Price</Typography>
                    <Typography variant="body1">${property.purchasePrice.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Purchase Date</Typography>
                    <Typography variant="body1">
                      {format(new Date(property.purchaseDate), 'PP')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Value Change</Typography>
                    <Typography 
                      variant="body1"
                      color={valueChange.amount >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {valueChange.amount >= 0 ? '+' : ''}${valueChange.amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Percentage Change</Typography>
                    <Typography 
                      variant="body1"
                      color={valueChange.percentage >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {valueChange.percentage >= 0 ? '+' : ''}{valueChange.percentage.toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Valuation History
                </Typography>
                
                <List>
                  <ListItem divider>
                    <ListItemText 
                      primary="Initial Purchase"
                      secondary={format(new Date(property.purchaseDate), 'PP')}
                    />
                    <Typography variant="body1">
                      ${property.purchasePrice.toLocaleString()}
                    </Typography>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Current Valuation"
                      secondary="Today"
                    />
                    <Typography variant="body1" color="success.main" fontWeight="bold">
                      ${property.currentValue.toLocaleString()}
                    </Typography>
                  </ListItem>
                  
                  {/* Placeholder for future valuation history entries */}
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Valuation history tracking will show the progression of your property value over time.
                    </Typography>
                  </Box>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Documents Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Property Documents
            </Typography>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
            >
              Upload Document
            </Button>
          </Box>
          
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No documents uploaded yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Upload important property documents like deeds, insurance policies, and inspection reports.
            </Typography>
            <Button
              variant="contained"
              startIcon={<DescriptionIcon />}
            >
              Upload First Document
            </Button>
          </Paper>
        </TabPanel>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the property "{property.name}"? This action cannot be undone and will remove all associated maintenance records.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteProperty} color="error" variant="contained">
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PropertyDetail;