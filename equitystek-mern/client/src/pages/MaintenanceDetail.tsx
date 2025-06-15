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
  Card,
  CardContent,
  Breadcrumbs
} from '@mui/material';
import {
  Build as BuildIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

interface MaintenanceRecord {
  _id: string;
  propertyId: string;
  title: string;
  description: string;
  date: string;
  cost: number;
  status: 'pending' | 'completed' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  category: string;
  receipt?: string;
  notes?: string;
}

interface Property {
  _id: string;
  name: string;
  address: string;
}

const MaintenanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [maintenanceRecord, setMaintenanceRecord] = useState<MaintenanceRecord | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        
        // Fetch maintenance record details
        const maintenanceResponse = await axios.get(`/api/maintenance/${id}`);
        setMaintenanceRecord(maintenanceResponse.data);
        
        // Fetch property details
        const propertyResponse = await axios.get(`/api/properties/${maintenanceResponse.data.propertyId}`);
        setProperty(propertyResponse.data);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load maintenance data');
        setLoading(false);
      }
    };
    
    fetchMaintenanceData();
  }, [id]);
  
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteRecord = async () => {
    try {
      await axios.delete(`/api/maintenance/${id}`);
      toast.success('Maintenance record deleted successfully');
      navigate('/maintenance');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete maintenance record');
      handleDeleteDialogClose();
    }
  };
  
  // Get status style
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  // Get priority style
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'success';
    }
  };
  
  // Format category display
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !maintenanceRecord || !property) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography variant="h5" gutterBottom>
            Error
          </Typography>
          <Typography>
            {error || 'Maintenance record not found'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/maintenance"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 2 }}
          >
            Back to Maintenance
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
            Dashboard
          </Link>
          <Link 
            to="/maintenance" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <BuildIcon sx={{ mr: 0.5 }} fontSize="small" />
            Maintenance
          </Link>
          <Link 
            to={`/properties/${property._id}`} 
            style={{ 
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            {property.name}
          </Link>
          <Typography color="text.primary">{maintenanceRecord.title}</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Header with maintenance title and actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                component={Link}
                to="/maintenance"
                startIcon={<ArrowBackIcon />}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
              <Typography variant="h4" component="h1">
                <BuildIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                {maintenanceRecord.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip 
                label={maintenanceRecord.status} 
                color={getStatusColor(maintenanceRecord.status) as "success" | "info" | "warning" | "error" | "default"}
              />
              <Chip 
                label={`${maintenanceRecord.priority} priority`} 
                color={getPriorityColor(maintenanceRecord.priority) as "success" | "info" | "warning" | "error" | "default"}
              />
              <Chip 
                label={formatCategory(maintenanceRecord.category)} 
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                component={Link}
                to={`/maintenance/edit/${maintenanceRecord._id}`}
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
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Property and Maintenance Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Property Details
            </Typography>
            <Box sx={{ pl: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" fontWeight="medium">
                    {property.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.address}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component={Link} 
                    to={`/properties/${property._id}`}
                  >
                    View Property
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Maintenance Details
            </Typography>
            <Box sx={{ pl: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 'small', mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {format(new Date(maintenanceRecord.date), 'PPP')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cost</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ fontSize: 'small', mr: 0.5, color: 'primary.main' }} />
                    <Typography variant="body1" color="primary.main" fontWeight="bold">
                      ${maintenanceRecord.cost.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                    {maintenanceRecord.description}
                  </Typography>
                </Grid>
                {maintenanceRecord.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Additional Notes</Typography>
                    <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                      {maintenanceRecord.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right Column - Receipts and Status Updates */}
        <Grid item xs={12} md={4}>
          {/* Receipt/Documentation Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Receipt/Documentation
            </Typography>
            {maintenanceRecord.receipt ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  component="img"
                  src={maintenanceRecord.receipt}
                  alt="Receipt"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
                <Button 
                  variant="outlined" 
                  component="a" 
                  href={maintenanceRecord.receipt} 
                  target="_blank"
                  size="small"
                  sx={{ mt: 1 }}
                >
                  View Full Size
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No receipt or documentation attached
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Status Update Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Status Update
            </Typography>
            <Card 
              sx={{ 
                mb: 2, 
                bgcolor: 
                  maintenanceRecord.status === 'completed' ? 'success.light' : 
                  maintenanceRecord.status === 'scheduled' ? 'info.light' : 'warning.light' 
              }}
            >
              <CardContent>
                <Typography variant="h6" color={
                  maintenanceRecord.status === 'completed' ? 'success.dark' : 
                  maintenanceRecord.status === 'scheduled' ? 'info.dark' : 'warning.dark'
                }>
                  {maintenanceRecord.status === 'completed' 
                    ? 'Completed' 
                    : maintenanceRecord.status === 'scheduled' 
                    ? 'Scheduled'
                    : 'Pending'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {maintenanceRecord.status === 'completed' 
                    ? `Completed on ${format(new Date(maintenanceRecord.date), 'PPP')}` 
                    : maintenanceRecord.status === 'scheduled' 
                    ? `Scheduled for ${format(new Date(maintenanceRecord.date), 'PPP')}`
                    : 'Waiting to be addressed'
                  }
                </Typography>
              </CardContent>
            </Card>
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to={`/maintenance/edit/${maintenanceRecord._id}`}
              startIcon={<EditIcon />}
            >
              Update Status
            </Button>
          </Paper>
          
          {/* Related Maintenance Records */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Related Records
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to={`/maintenance/add/${property._id}`}
              startIcon={<AddIcon />}
              sx={{ mb: 1 }}
            >
              Add New for this Property
            </Button>
            <Button
              fullWidth
              variant="text"
              component={Link}
              to={`/properties/${property._id}`}
            >
              View All Property Records
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the maintenance record "{maintenanceRecord.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteRecord} color="error" variant="contained">
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MaintenanceDetail;