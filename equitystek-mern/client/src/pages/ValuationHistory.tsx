import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Divider,
  Breadcrumbs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
  createdAt: string;
}

interface Valuation {
  _id: string;
  propertyId: string;
  date: string;
  value: number;
  source: 'professional' | 'automated' | 'manual';
  notes?: string;
  changePercentage?: number;
  changeValue?: number;
}

const ValuationHistory: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { user } = useAuth();
  
  // State for property and valuations data
  const [property, setProperty] = useState<Property | null>(null);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for chart data
  const [chartData, setChartData] = useState<any[]>([]);
  
  // State for add valuation dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newValuation, setNewValuation] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    value: 0,
    source: 'manual',
    notes: ''
  });
  
  // State for delete valuation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState<string | null>(null);
  
  // Fetch property and valuation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch property details
        const propertyResponse = await axios.get(`/api/properties/${propertyId}`);
        setProperty(propertyResponse.data);
        
        // Fetch property valuations
        const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
        
        // Sort valuations by date
        const sortedValuations = [...valuationsResponse.data].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Calculate change percentages and values
        const valuationsWithChanges = sortedValuations.map((valuation, index) => {
          if (index === 0) {
            return {
              ...valuation,
              changePercentage: 0,
              changeValue: 0
            };
          }
          
          const previousValuation = sortedValuations[index - 1];
          const changeValue = valuation.value - previousValuation.value;
          const changePercentage = (changeValue / previousValuation.value) * 100;
          
          return {
            ...valuation,
            changePercentage,
            changeValue
          };
        });
        
        setValuations(valuationsWithChanges);
        
        // Prepare chart data
        const chartData = valuationsWithChanges.map(valuation => ({
          date: format(new Date(valuation.date), 'MMM yyyy'),
          value: valuation.value
        }));
        
        setChartData(chartData);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property valuation data');
        setLoading(false);
        toast.error('Failed to load property valuation data');
      }
    };
    
    fetchData();
  }, [propertyId]);
  
  // Add new valuation
  const handleAddValuation = async () => {
    try {
      if (newValuation.value <= 0) {
        toast.error('Valuation must be greater than 0');
        return;
      }
      
      // Add new valuation
      const response = await axios.post(`/api/properties/${propertyId}/valuations`, newValuation);
      
      // Refresh valuations
      const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
      
      // Sort and calculate changes
      const sortedValuations = [...valuationsResponse.data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const valuationsWithChanges = sortedValuations.map((valuation, index) => {
        if (index === 0) {
          return {
            ...valuation,
            changePercentage: 0,
            changeValue: 0
          };
        }
        
        const previousValuation = sortedValuations[index - 1];
        const changeValue = valuation.value - previousValuation.value;
        const changePercentage = (changeValue / previousValuation.value) * 100;
        
        return {
          ...valuation,
          changePercentage,
          changeValue
        };
      });
      
      setValuations(valuationsWithChanges);
      
      // Update chart data
      const chartData = valuationsWithChanges.map(valuation => ({
        date: format(new Date(valuation.date), 'MMM yyyy'),
        value: valuation.value
      }));
      
      setChartData(chartData);
      
      // Reset form and close dialog
      setNewValuation({
        date: format(new Date(), 'yyyy-MM-dd'),
        value: 0,
        source: 'manual',
        notes: ''
      });
      setAddDialogOpen(false);
      
      toast.success('Valuation added successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add valuation');
    }
  };
  
  // Delete valuation
  const handleDeleteValuation = async () => {
    try {
      if (!valuationToDelete) return;
      
      await axios.delete(`/api/valuations/${valuationToDelete}`);
      
      // Refresh valuations
      const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
      
      // Sort and calculate changes
      const sortedValuations = [...valuationsResponse.data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const valuationsWithChanges = sortedValuations.map((valuation, index) => {
        if (index === 0) {
          return {
            ...valuation,
            changePercentage: 0,
            changeValue: 0
          };
        }
        
        const previousValuation = sortedValuations[index - 1];
        const changeValue = valuation.value - previousValuation.value;
        const changePercentage = (changeValue / previousValuation.value) * 100;
        
        return {
          ...valuation,
          changePercentage,
          changeValue
        };
      });
      
      setValuations(valuationsWithChanges);
      
      // Update chart data
      const chartData = valuationsWithChanges.map(valuation => ({
        date: format(new Date(valuation.date), 'MMM yyyy'),
        value: valuation.value
      }));
      
      setChartData(chartData);
      
      setDeleteDialogOpen(false);
      setValuationToDelete(null);
      
      toast.success('Valuation deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete valuation');
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  // Get color for trend
  const getTrendColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return 'default';
  };
  
  // Get source display name
  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'professional':
        return 'Professional Appraisal';
      case 'automated':
        return 'Automated Estimate';
      case 'manual':
        return 'Manual Entry';
      default:
        return source.charAt(0).toUpperCase() + source.slice(1);
    }
  };
  
  // Calculate total growth
  const calculateTotalGrowth = () => {
    if (valuations.length < 2) return { value: 0, percentage: 0 };
    
    const firstValuation = valuations[0];
    const latestValuation = valuations[valuations.length - 1];
    
    const growthValue = latestValuation.value - firstValuation.value;
    const growthPercentage = (growthValue / firstValuation.value) * 100;
    
    return { value: growthValue, percentage: growthPercentage };
  };
  
  // Calculate annualized return
  const calculateAnnualizedReturn = () => {
    if (valuations.length < 2) return 0;
    
    const firstValuation = valuations[0];
    const latestValuation = valuations[valuations.length - 1];
    
    const startValue = firstValuation.value;
    const endValue = latestValuation.value;
    const startDate = new Date(firstValuation.date);
    const endDate = new Date(latestValuation.date);
    
    // Calculate years between valuations
    const yearsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsDiff < 0.1) return 0; // Avoid division by very small numbers
    
    // Calculate annualized return
    const annualizedReturn = Math.pow(endValue / startValue, 1 / yearsDiff) - 1;
    
    return annualizedReturn * 100;
  };
  
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
            Error Loading Property Valuation
          </Typography>
          <Typography paragraph>
            {error || 'Property not found'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/properties"
          >
            Return to Properties
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const totalGrowth = calculateTotalGrowth();
  const annualizedReturn = calculateAnnualizedReturn();
  
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
            to="/properties" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Properties
          </Link>
          <Link 
            to={`/properties/${propertyId}`} 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              color: 'inherit', 
              textDecoration: 'none' 
            }}
          >
            {property.name}
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <TimelineIcon sx={{ mr: 0.5 }} fontSize="small" />
            Valuation History
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            Valuation History: {property.name}
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Valuation
        </Button>
      </Box>
      
      {/* Property Valuation Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Property Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Price:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(property.purchasePrice)}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Purchase Date:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {formatDate(property.purchaseDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Property Type:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {property.propertyType.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Size:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {property.size} m²
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Bedrooms:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {property.bedrooms}
                  </Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    Bathrooms:
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {property.bathrooms}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Valuation Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Latest Valuation
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {valuations.length > 0
                        ? formatCurrency(valuations[valuations.length - 1].value)
                        : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {valuations.length > 0
                        ? `as of ${formatDate(valuations[valuations.length - 1].date)}`
                        : 'No valuations recorded'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Growth
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {totalGrowth.value > 0 ? (
                        <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                      ) : totalGrowth.value < 0 ? (
                        <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                      ) : null}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={totalGrowth.value > 0 ? 'success.main' : totalGrowth.value < 0 ? 'error.main' : 'text.primary'}
                      >
                        {totalGrowth.percentage.toFixed(2)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(totalGrowth.value)}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Annualized Return
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {annualizedReturn > 0 ? (
                        <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                      ) : annualizedReturn < 0 ? (
                        <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                      ) : null}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={annualizedReturn > 0 ? 'success.main' : annualizedReturn < 0 ? 'error.main' : 'text.primary'}
                      >
                        {annualizedReturn.toFixed(2)}% per year
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Valuation Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Valuation Trend
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {chartData.length > 0 ? (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('en-AU', {
                    style: 'currency',
                    currency: 'AUD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(value)}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Valuation"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Property Value"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" fontStyle="italic">
              No valuation data available to display.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Valuation History Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Valuation History
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {valuations.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Valuation</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {valuations.map((valuation) => (
                  <TableRow key={valuation._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                        {formatDate(valuation.date)}
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(valuation.value)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {valuation.changePercentage !== 0 && (
                          valuation.changePercentage! > 0 ? (
                            <TrendingUpIcon 
                              fontSize="small" 
                              sx={{ mr: 0.5, color: 'success.main' }} 
                            />
                          ) : (
                            <TrendingDownIcon 
                              fontSize="small" 
                              sx={{ mr: 0.5, color: 'error.main' }} 
                            />
                          )
                        )}
                        <Chip
                          label={`${valuation.changePercentage?.toFixed(2)}% (${formatCurrency(valuation.changeValue || 0)})`}
                          size="small"
                          color={getTrendColor(valuation.changePercentage || 0) as any}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSourceDisplayName(valuation.source)}
                        size="small"
                        color={valuation.source === 'professional' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {valuation.notes ? valuation.notes : <span style={{ color: '#999', fontStyle: 'italic' }}>No notes</span>}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          setValuationToDelete(valuation._id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" fontStyle="italic">
              No valuation history available. Add your first valuation to start tracking property value growth.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Add Valuation Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Valuation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details of the new property valuation.
          </DialogContentText>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={newValuation.date}
            onChange={(e) => setNewValuation({ ...newValuation, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Valuation Amount"
            type="number"
            fullWidth
            value={newValuation.value}
            onChange={(e) => setNewValuation({ ...newValuation, value: Number(e.target.value) })}
            InputProps={{ 
              startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
            }}
          />
          <TextField
            margin="dense"
            label="Source"
            select
            fullWidth
            value={newValuation.source}
            onChange={(e) => setNewValuation({ ...newValuation, source: e.target.value as any })}
            SelectProps={{
              native: true
            }}
          >
            <option value="professional">Professional Appraisal</option>
            <option value="automated">Automated Estimate</option>
            <option value="manual">Manual Entry</option>
          </TextField>
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            value={newValuation.notes}
            onChange={(e) => setNewValuation({ ...newValuation, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddValuation} color="primary" variant="contained">
            Add Valuation
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Valuation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Valuation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this valuation record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteValuation} color="error" variant="contained">
            Delete Valuation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ValuationHistory;