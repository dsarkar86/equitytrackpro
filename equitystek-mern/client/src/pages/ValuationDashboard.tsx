import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Breadcrumbs,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Divider,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
  Insights as InsightsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import ValuationSummary from '../components/valuation/ValuationSummary';
import ValuationChart from '../components/valuation/ValuationChart';
import ValuationHistoryTable from '../components/valuation/ValuationHistoryTable';
import ValuationInputForm from '../components/valuation/ValuationInputForm';

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

const ValuationDashboard: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Component states
  const [property, setProperty] = useState<Property | null>(null);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addValuationLoading, setAddValuationLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch property and valuation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch property data
        const propertyResponse = await axios.get(`/api/properties/${propertyId}`);
        setProperty(propertyResponse.data);
        
        // Fetch valuations
        const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
        
        // Sort and prepare valuation data
        const sortedValuations = [...valuationsResponse.data].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Calculate percentage changes
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
        
        try {
          // Try to fetch market data
          const marketResponse = await axios.get(`/api/market-data/${propertyResponse.data.propertyType}/${encodeURIComponent(propertyResponse.data.address.split(',').pop()?.trim() || '')}`);
          setMarketData(marketResponse.data);
        } catch (marketErr) {
          console.log('Market data not available, using sample data');
          // Use dummy market data if API fails
          setMarketData([]);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load property data');
        setLoading(false);
        toast.error('Unable to load property information');
      }
    };
    
    fetchData();
  }, [propertyId]);
  
  // Handle adding new valuation
  const handleAddValuation = async (formData: any) => {
    try {
      setAddValuationLoading(true);
      
      // Add property ID to form data
      const valuationData = {
        ...formData,
        propertyId
      };
      
      // Send request to API
      const response = await axios.post(`/api/properties/${propertyId}/valuations`, valuationData);
      
      // Refresh valuations
      const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
      
      // Sort and prepare valuation data
      const sortedValuations = [...valuationsResponse.data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate percentage changes
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
      setShowAddForm(false);
      setAddValuationLoading(false);
      toast.success('Valuation added successfully');
    } catch (err: any) {
      setAddValuationLoading(false);
      toast.error(err.response?.data?.message || 'Failed to add valuation');
      throw err; // Re-throw to be handled in the form component
    }
  };
  
  // Handle deleting valuation
  const handleDeleteValuation = async (valuationId: string) => {
    try {
      setDeleteLoading(true);
      
      // Send delete request
      await axios.delete(`/api/valuations/${valuationId}`);
      
      // Refresh valuations
      const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
      
      // Sort and prepare valuation data
      const sortedValuations = [...valuationsResponse.data].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate percentage changes
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
      setDeleteLoading(false);
      toast.success('Valuation deleted successfully');
    } catch (err: any) {
      setDeleteLoading(false);
      toast.error(err.response?.data?.message || 'Failed to delete valuation');
    }
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography variant="h5" gutterBottom color="error">
            Error Loading Property
          </Typography>
          <Typography paragraph>
            {error || 'Property not found'}
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/properties"
          >
            Back to Properties
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
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
            Valuation Dashboard
          </Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Header with controls */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InsightsIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              {property.name} Valuation
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track and analyze your property's value over time
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to={`/properties/${propertyId}`}
          >
            Back to Property
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
          >
            Add Valuation
          </Button>
        </Box>
      </Box>
      
      {/* Valuation Summary */}
      <Box sx={{ mb: 4 }}>
        <ValuationSummary
          valuations={valuations}
          propertyName={property.name}
          purchaseDate={property.purchaseDate}
          purchasePrice={property.purchasePrice}
        />
      </Box>
      
      {/* Main Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<TimelineIcon />} 
            label="Trend Analysis" 
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="History & Records" 
          />
        </Tabs>
        
        <Divider />
        
        {/* Tab Content */}
        <Box p={3}>
          {/* Trend Analysis Tab */}
          {activeTab === 0 && (
            <Grid container spacing={4}>
              {/* Valuation Trend */}
              <Grid item xs={12}>
                <ValuationChart
                  valuations={valuations}
                  purchaseDate={property.purchaseDate}
                  purchasePrice={property.purchasePrice}
                  height={400}
                />
              </Grid>
              
              {/* Market Comparison */}
              <Grid item xs={12}>
                <ValuationChart
                  valuations={valuations}
                  purchaseDate={property.purchaseDate}
                  purchasePrice={property.purchasePrice}
                  compareWithMarket={true}
                  marketData={marketData}
                  chartType="line"
                  height={400}
                />
              </Grid>
              
              {/* Market Insights Information */}
              <Grid item xs={12}>
                <Alert 
                  severity="info" 
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  <AlertTitle>Market Insights</AlertTitle>
                  Market comparison provides a relative performance benchmark for your property against similar properties in the area.
                  This helps you understand if your property is outperforming or underperforming the local market.
                </Alert>
              </Grid>
            </Grid>
          )}
          
          {/* History & Records Tab */}
          {activeTab === 1 && (
            <ValuationHistoryTable
              valuations={valuations}
              onDelete={handleDeleteValuation}
              onAdd={() => setShowAddForm(true)}
              deleteLoading={deleteLoading}
            />
          )}
        </Box>
      </Paper>
      
      {/* Guidance for first-time users */}
      {valuations.length === 0 && (
        <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Get Started with Property Valuation Tracking
          </Typography>
          <Typography paragraph>
            Track your property's value over time by adding regular valuations. For the most accurate results:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Box component="li" sx={{ mb: 1 }}>
              Add professional appraisals whenever you have them
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              Include automated estimates from property websites
            </Box>
            <Box component="li">
              Add manual valuations based on your knowledge of the local market
            </Box>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            sx={{ mt: 2 }}
          >
            Add Your First Valuation
          </Button>
        </Paper>
      )}
      
      {/* Add Valuation Dialog */}
      <ValuationInputForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddValuation}
        propertyPurchasePrice={property.purchasePrice}
        lastValuation={valuations.length > 0 ? valuations[valuations.length - 1].value : undefined}
        loading={addValuationLoading}
      />
    </Container>
  );
};

export default ValuationDashboard;