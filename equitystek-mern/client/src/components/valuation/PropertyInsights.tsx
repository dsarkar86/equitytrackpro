import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
  Stack,
  Chip,
  Tooltip,
  CircularProgress,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Language as LanguageIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { format, differenceInMonths, differenceInYears } from 'date-fns';

interface Valuation {
  _id: string;
  date: string;
  value: number;
  source: 'professional' | 'automated' | 'manual';
  changePercentage?: number;
  changeValue?: number;
}

interface PropertyInsightsProps {
  valuations: Valuation[];
  propertyName?: string;
  propertyType?: string;
  propertyLocation?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  loading?: boolean;
  marketTrend?: number; // Percentage trend in the market for this property type
  rentalYield?: number; // Current rental yield percentage
}

const PropertyInsights: React.FC<PropertyInsightsProps> = ({
  valuations,
  propertyName,
  propertyType,
  propertyLocation,
  purchaseDate,
  purchasePrice,
  loading = false,
  marketTrend = 0,
  rentalYield = 0
}) => {
  const theme = useTheme();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };
  
  // Format percentages
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Calculate total growth from purchase
  const calculateTotalGrowth = () => {
    if (!purchasePrice || valuations.length === 0) return { value: 0, percentage: 0 };
    
    const latestValuation = valuations[valuations.length - 1];
    
    const growthValue = latestValuation.value - purchasePrice;
    const growthPercentage = (growthValue / purchasePrice) * 100;
    
    return { value: growthValue, percentage: growthPercentage };
  };
  
  // Calculate annualized return
  const calculateAnnualizedReturn = () => {
    if (!purchasePrice || !purchaseDate || valuations.length === 0) return 0;
    
    const latestValuation = valuations[valuations.length - 1];
    
    const startValue = purchasePrice;
    const endValue = latestValuation.value;
    const startDate = new Date(purchaseDate);
    const endDate = new Date(latestValuation.date);
    
    // Calculate years between purchase and latest valuation
    const yearsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsDiff < 0.1) return 0; // Avoid division by very small numbers
    
    // Calculate annualized return
    const annualizedReturn = Math.pow(endValue / startValue, 1 / yearsDiff) - 1;
    
    return annualizedReturn * 100;
  };
  
  // Calculate market comparison
  const calculateMarketComparison = () => {
    if (!marketTrend || !purchaseDate || valuations.length === 0) return 0;
    
    const totalGrowth = calculateTotalGrowth();
    
    // Calculate how much the property has outperformed the market
    return totalGrowth.percentage - marketTrend;
  };
  
  // Calculate estimated monthly rental
  const calculateEstimatedRental = () => {
    if (!rentalYield || valuations.length === 0) return 0;
    
    const currentValue = valuations[valuations.length - 1].value;
    
    // Calculate monthly rental based on annual yield
    return (currentValue * (rentalYield / 100)) / 12;
  };
  
  // Calculate time to value doubling at current rate
  const calculateDoublingTime = () => {
    const annualReturn = calculateAnnualizedReturn();
    
    if (annualReturn <= 0) return null;
    
    // Rule of 72 approximation
    return 72 / annualReturn;
  };
  
  // Get performance rating
  const getPerformanceRating = () => {
    const annualReturn = calculateAnnualizedReturn();
    const marketComparison = calculateMarketComparison();
    
    if (annualReturn > 7 && marketComparison > 3) return { label: 'Excellent', color: 'success' };
    if (annualReturn > 5 && marketComparison > 0) return { label: 'Good', color: 'primary' };
    if (annualReturn > 3 || marketComparison > -2) return { label: 'Fair', color: 'info' };
    return { label: 'Needs Attention', color: 'warning' };
  };
  
  // Calculate insights
  const totalGrowth = calculateTotalGrowth();
  const annualizedReturn = calculateAnnualizedReturn();
  const marketComparison = calculateMarketComparison();
  const estimatedRental = calculateEstimatedRental();
  const doublingTime = calculateDoublingTime();
  const performanceRating = getPerformanceRating();
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Property Insights
            </Typography>
          </Box>
          <LinearProgress />
          <Box sx={{ mt: 4, mb: 2 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // No valuations state
  if (valuations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Property Insights
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Add valuation data to view property insights.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InsightsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Property Insights
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Performance Overview */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Overall Performance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={performanceRating.label} 
                    color={performanceRating.color as any} 
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {propertyName || 'Your property'} is {marketComparison > 0 ? 'outperforming' : 'underperforming'} similar properties by {Math.abs(marketComparison).toFixed(1)}%
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimelineIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Annual growth rate: <strong>{formatPercentage(annualizedReturn)}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MoneyIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Total growth: <strong>{formatPercentage(totalGrowth.percentage)}</strong>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Value
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(valuations[valuations.length - 1].value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CalendarIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    as of {format(new Date(valuations[valuations.length - 1].date), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Key Metrics */}
        <Typography variant="subtitle1" gutterBottom>
          Key Metrics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Total Growth */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                {totalGrowth.value > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2" color="text.secondary">
                  Total Growth
                </Typography>
                <Tooltip title="Change in value since purchase">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Stack>
              <Typography variant="h6" color={totalGrowth.value > 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(totalGrowth.value)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPercentage(totalGrowth.percentage)} from purchase price
              </Typography>
            </Paper>
          </Grid>
          
          {/* Market Comparison */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <LanguageIcon color={marketComparison > 0 ? 'success' : 'error'} fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Vs. Market
                </Typography>
                <Tooltip title="How your property compares to the market average">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Stack>
              <Typography variant="h6" color={marketComparison > 0 ? 'success.main' : 'error.main'}>
                {formatPercentage(marketComparison)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {marketComparison > 0 ? 'Outperforming' : 'Underperforming'} the market
              </Typography>
            </Paper>
          </Grid>
          
          {/* Estimated Rental */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <HomeIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Est. Monthly Rental
                </Typography>
                <Tooltip title="Estimated monthly rental income based on current yields">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Stack>
              <Typography variant="h6" color="primary.main">
                {formatCurrency(estimatedRental)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Based on {rentalYield}% annual yield
              </Typography>
            </Paper>
          </Grid>
          
          {/* Time to Double */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <CalendarIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Value Doubling
                </Typography>
                <Tooltip title="Estimated time for your property value to double at current growth rate">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Stack>
              {doublingTime ? (
                <>
                  <Typography variant="h6" color="primary.main">
                    {doublingTime.toFixed(1)} years
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    At current annual rate of {formatPercentage(annualizedReturn)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Not available at current growth rate
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Location & Type */}
        {(propertyType || propertyLocation) && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Property Details
            </Typography>
            <Grid container spacing={2}>
              {propertyType && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Property Type:
                  </Typography>
                  <Typography variant="body1">
                    {propertyType.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Typography>
                </Grid>
              )}
              {propertyLocation && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location:
                  </Typography>
                  <Typography variant="body1">
                    {propertyLocation}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyInsights;