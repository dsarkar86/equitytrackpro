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
  AttachMoney as MoneyIcon,
  Insights as InsightsIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import InvestmentMetrics from '../components/financial/InvestmentMetrics';

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
  rentalIncome?: number;
  expenses?: {
    propertyTax?: number;
    insurance?: number;
    maintenance?: number;
    management?: number;
    utilities?: number;
    other?: number;
  };
  mortgageDetails?: {
    loanAmount?: number;
    interestRate?: number;
    term?: number;
    paymentAmount?: number;
  };
}

interface Valuation {
  _id: string;
  propertyId: string;
  date: string;
  value: number;
  source: 'professional' | 'automated' | 'manual';
}

const FinancialAnalysis: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  
  // Component states
  const [property, setProperty] = useState<Property | null>(null);
  const [latestValuation, setLatestValuation] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch property and valuation data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch property data
        const propertyResponse = await axios.get(`/api/properties/${propertyId}`);
        setProperty(propertyResponse.data);
        
        // Fetch latest valuation
        const valuationsResponse = await axios.get(`/api/properties/${propertyId}/valuations`);
        
        if (valuationsResponse.data.length > 0) {
          // Sort and get the latest valuation
          const sortedValuations = [...valuationsResponse.data].sort(
            (a: Valuation, b: Valuation) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setLatestValuation(sortedValuations[0].value);
        } else {
          // If no valuations, use purchase price
          setLatestValuation(propertyResponse.data.purchasePrice);
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
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
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
            <MoneyIcon sx={{ mr: 0.5 }} fontSize="small" />
            Financial Analysis
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
          <MoneyIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              {property.name} Financial Analysis
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Analyze investment performance and financial metrics
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
            variant="outlined"
            startIcon={<TimelineIcon />}
            component={Link}
            to={`/properties/${propertyId}/valuation`}
          >
            Valuation Dashboard
          </Button>
        </Box>
      </Box>
      
      {/* Property Overview Card */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {property.name}
            </Typography>
            <Typography variant="body1">
              {property.address}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Property Type: {property.propertyType.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Typography>
              <Typography variant="body2">
                Size: {property.size} m² | {property.bedrooms} Bedrooms | {property.bathrooms} Bathrooms
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Current Value
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {latestValuation ? formatCurrency(latestValuation) : 'No valuation data'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Purchase Price: {formatCurrency(property.purchasePrice)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Main content */}
      <Box sx={{ mb: 4 }}>
        <InvestmentMetrics 
          property={property} 
          currentValue={latestValuation || property.purchasePrice}
        />
      </Box>
      
      {/* Tips and Help Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Financial Analysis Tips
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ROI (Return on Investment)
              </Typography>
              <Typography variant="body2">
                This measures the total return on your initial investment. A positive ROI means your property 
                has increased in value relative to the money you've put in.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Cash on Cash Return
              </Typography>
              <Typography variant="body2">
                This measures the annual return based on the cash you've invested and the cash flow you receive. 
                It's an important metric for rental properties.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Cap Rate
              </Typography>
              <Typography variant="body2">
                The capitalization rate is the rate of return on a real estate investment property based on the income 
                that the property is expected to generate. Higher is generally better.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <AlertTitle>Regular Updates</AlertTitle>
          To get the most accurate financial analysis, keep your property valuations updated and 
          regularly review your expense and income figures.
        </Alert>
      </Paper>
    </Container>
  );
};

export default FinancialAnalysis;