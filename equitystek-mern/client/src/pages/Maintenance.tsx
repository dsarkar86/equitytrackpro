import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Paper,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Build as BuildIcon,
  FilterList as FilterListIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import MaintenanceRecord from '../components/ui/MaintenanceRecord';

// Define interfaces
interface Property {
  _id: string;
  name: string;
}

interface MaintenanceRecordType {
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
  propertyName?: string;
}

const Maintenance: React.FC = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    propertyId: '',
    status: '',
    priority: '',
    category: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch maintenance records
        const maintenanceResponse = await axios.get('/api/maintenance');
        
        // Fetch properties for property names
        const propertiesResponse = await axios.get('/api/properties');
        
        // Map property names to maintenance records
        const records = maintenanceResponse.data.map((record: MaintenanceRecordType) => {
          const property = propertiesResponse.data.find((p: Property) => p._id === record.propertyId);
          return {
            ...record,
            propertyName: property ? property.name : 'Unknown Property'
          };
        });
        
        setMaintenanceRecords(records);
        setProperties(propertiesResponse.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load maintenance records');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    setFilters({ ...filters, [name]: value });
  };
  
  // Calculate totals
  const calculateTotals = () => {
    const pendingCount = maintenanceRecords.filter(r => r.status === 'pending').length;
    const completedCount = maintenanceRecords.filter(r => r.status === 'completed').length;
    const scheduledCount = maintenanceRecords.filter(r => r.status === 'scheduled').length;
    
    const pendingCost = maintenanceRecords
      .filter(r => r.status === 'pending')
      .reduce((total, r) => total + r.cost, 0);
    
    const completedCost = maintenanceRecords
      .filter(r => r.status === 'completed')
      .reduce((total, r) => total + r.cost, 0);
      
    const totalCost = maintenanceRecords.reduce((total, r) => total + r.cost, 0);
    
    return {
      pendingCount,
      completedCount,
      scheduledCount,
      pendingCost,
      completedCost,
      totalCost
    };
  };
  
  const totals = calculateTotals();
  
  // Filter maintenance records
  const filteredRecords = maintenanceRecords.filter(record => {
    // Search filter
    const matchesSearch = 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filter
    const matchesTab = 
      (tabValue === 0) || // All
      (tabValue === 1 && record.status === 'pending') || // Pending
      (tabValue === 2 && record.status === 'scheduled') || // Scheduled
      (tabValue === 3 && record.status === 'completed'); // Completed
    
    // Other filters
    const matchesProperty = !filters.propertyId || record.propertyId === filters.propertyId;
    const matchesStatus = !filters.status || record.status === filters.status;
    const matchesPriority = !filters.priority || record.priority === filters.priority;
    const matchesCategory = !filters.category || record.category === filters.category;
    
    return matchesSearch && matchesTab && matchesProperty && matchesStatus && matchesPriority && matchesCategory;
  });
  
  // Sort records by date (most recent first)
  filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Maintenance Records
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/maintenance/add"
          startIcon={<AddIcon />}
        >
          Add Maintenance Record
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: '#e8f5e9' }}>
            <Typography variant="body2" color="text.secondary">Total Records</Typography>
            <Typography variant="h4" color="text.primary">{maintenanceRecords.length}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total Cost: ${totals.totalCost.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: '#fff8e1' }}>
            <Typography variant="body2" color="text.secondary">Pending</Typography>
            <Typography variant="h4" color="warning.main">{totals.pendingCount}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Estimated Cost: ${totals.pendingCost.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: '#e3f2fd' }}>
            <Typography variant="body2" color="text.secondary">Scheduled</Typography>
            <Typography variant="h4" color="info.main">{totals.scheduledCount}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Upcoming Maintenance
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: '#e8f5e9' }}>
            <Typography variant="body2" color="text.secondary">Completed</Typography>
            <Typography variant="h4" color="success.main">{totals.completedCount}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total Spent: ${totals.completedCost.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search maintenance records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 1, sm: 0 } }}>
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={() => document.getElementById('advancedFilters')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Advanced Filters
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} id="advancedFilters">
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              <FilterListIcon sx={{ mr: 0.5, verticalAlign: 'middle' }} />
              Advanced Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="property-filter-label">Property</InputLabel>
                  <Select
                    labelId="property-filter-label"
                    name="propertyId"
                    value={filters.propertyId}
                    label="Property"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Properties</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property._id} value={property._id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    name="status"
                    value={filters.status}
                    label="Status"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="priority-filter-label">Priority</InputLabel>
                  <Select
                    labelId="priority-filter-label"
                    name="priority"
                    value={filters.priority}
                    label="Priority"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    name="category"
                    value={filters.category}
                    label="Category"
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="repair">Repair</MenuItem>
                    <MenuItem value="improvement">Improvement</MenuItem>
                    <MenuItem value="routine">Routine Maintenance</MenuItem>
                    <MenuItem value="emergency">Emergency</MenuItem>
                    <MenuItem value="inspection">Inspection</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {(filters.propertyId || filters.status || filters.priority || filters.category) && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Active filters:</Typography>
                
                {filters.propertyId && (
                  <Chip 
                    size="small" 
                    label={`Property: ${properties.find(p => p._id === filters.propertyId)?.name || 'Unknown'}`}
                    onDelete={() => setFilters({ ...filters, propertyId: '' })}
                  />
                )}
                
                {filters.status && (
                  <Chip 
                    size="small" 
                    label={`Status: ${filters.status}`}
                    onDelete={() => setFilters({ ...filters, status: '' })}
                  />
                )}
                
                {filters.priority && (
                  <Chip 
                    size="small" 
                    label={`Priority: ${filters.priority}`}
                    onDelete={() => setFilters({ ...filters, priority: '' })}
                  />
                )}
                
                {filters.category && (
                  <Chip 
                    size="small" 
                    label={`Category: ${filters.category}`}
                    onDelete={() => setFilters({ ...filters, category: '' })}
                  />
                )}
                
                <Button 
                  size="small" 
                  onClick={() => setFilters({ propertyId: '', status: '', priority: '', category: '' })}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.dark' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {/* Tabs and Maintenance Records List */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          aria-label="maintenance tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${maintenanceRecords.length})`} />
          <Tab label={`Pending (${totals.pendingCount})`} />
          <Tab label={`Scheduled (${totals.scheduledCount})`} />
          <Tab label={`Completed (${totals.completedCount})`} />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {filteredRecords.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <BuildIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No maintenance records found
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {searchTerm || Object.values(filters).some(v => v) 
                  ? "No records match your search criteria. Try adjusting your filters."
                  : "You haven't added any maintenance records yet."}
              </Typography>
              
              {!searchTerm && !Object.values(filters).some(v => v) && (
                <Button
                  variant="contained"
                  component={Link}
                  to="/maintenance/add"
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >
                  Add Your First Maintenance Record
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {filteredRecords.map(record => (
                <MaintenanceRecord key={record._id} record={record} showProperty />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Maintenance;