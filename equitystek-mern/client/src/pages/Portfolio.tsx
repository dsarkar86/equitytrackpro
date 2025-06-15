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
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import PortfolioSummary from '../components/financial/PortfolioSummary';

interface PropertySummary {
  _id: string;
  name: string;
  address: string;
  propertyType: string;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  growth: number;
  growthPercentage: number;
  roi: number;
}

const Portfolio: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // Component states
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch portfolio data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch properties
        const propertiesResponse = await axios.get('/api/properties');
        const propertiesData = propertiesResponse.data;
        
        // Create portfolio summaries with valuations
        const portfolioData: PropertySummary[] = [];
        
        // For each property, get the latest valuation
        for (const property of propertiesData) {
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
              
              // Calculate ROI
              const initialInvestment = property.purchasePrice * 0.2; // Assuming 20% down payment
              const equity = latestValue - (property.purchasePrice * 0.8); // Assuming 80% mortgage
              const roi = ((equity - initialInvestment) / initialInvestment) * 100;
              
              portfolioData.push({
                _id: property._id,
                name: property.name,
                address: property.address,
                propertyType: property.propertyType,
                purchasePrice: property.purchasePrice,
                purchaseDate: property.purchaseDate,
                currentValue: latestValue,
                growth,
                growthPercentage,
                roi
              });
            } else {
              // If no valuations, use purchase price as current value
              portfolioData.push({
                _id: property._id,
                name: property.name,
                address: property.address,
                propertyType: property.propertyType,
                purchasePrice: property.purchasePrice,
                purchaseDate: property.purchaseDate,
                currentValue: property.purchasePrice,
                growth: 0,
                growthPercentage: 0,
                roi: 0
              });
            }
          } catch (error) {
            console.error(`Error fetching valuations for property ${property._id}:`, error);
            
            // Add the property with default values if valuation fetch fails
            portfolioData.push({
              _id: property._id,
              name: property.name,
              address: property.address,
              propertyType: property.propertyType,
              purchasePrice: property.purchasePrice,
              purchaseDate: property.purchaseDate,
              currentValue: property.purchasePrice,
              growth: 0,
              growthPercentage: 0,
              roi: 0
            });
          }
        }
        
        setProperties(portfolioData);
        setLoading(false);
      } catch (err: any) {
        console.error('Portfolio loading error:', err);
        setLoading(false);
        toast.error('Error loading portfolio data');
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountBalanceIcon color="primary" sx={{ fontSize: 36, mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Portfolio Overview
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Financial overview of your entire property portfolio
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/"
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            component={Link}
            to="/properties"
          >
            View Properties
          </Button>
        </Box>
      </Box>
      
      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Box>
          <PortfolioSummary properties={properties} />
          
          {/* Additional Guidance */}
          {properties.length > 0 && (
            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Managing Your Portfolio
              </Typography>
              <Typography variant="body1" paragraph>
                Your property portfolio is a valuable asset. Here are some tips to maximize its performance:
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Regular Valuations
                    </Typography>
                    <Typography variant="body2">
                      Keep your property valuations up to date to track performance accurately. Aim for quarterly updates or whenever significant market changes occur.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Diversification
                    </Typography>
                    <Typography variant="body2">
                      Consider diversifying your portfolio across different property types and locations to reduce risk and capture growth in various markets.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Investment Analysis
                    </Typography>
                    <Typography variant="body2">
                      Use the financial analysis tools to evaluate each property's performance and make data-driven decisions about future investments.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Portfolio;