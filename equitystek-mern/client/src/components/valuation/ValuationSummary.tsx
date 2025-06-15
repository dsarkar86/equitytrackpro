import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Stack,
  Divider,
  useTheme,
  Tooltip,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { format, differenceInMonths, differenceInYears } from 'date-fns';

interface Valuation {
  _id: string;
  date: string;
  value: number;
  source: 'professional' | 'automated' | 'manual';
}

interface ValuationSummaryProps {
  valuations: Valuation[];
  propertyName?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  loading?: boolean;
}

const ValuationSummary: React.FC<ValuationSummaryProps> = ({
  valuations,
  propertyName,
  purchaseDate,
  purchasePrice,
  loading = false
}) => {
  const theme = useTheme();
  
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
  
  // Get time held text
  const getTimeHeldText = () => {
    if (!purchaseDate) return 'Unknown';
    
    const purchaseDateTime = new Date(purchaseDate);
    const now = new Date();
    
    const years = differenceInYears(now, purchaseDateTime);
    const months = differenceInMonths(now, purchaseDateTime) % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
  };
  
  // Get latest valuation
  const getLatestValuation = () => {
    if (valuations.length === 0) return null;
    return valuations[valuations.length - 1];
  };
  
  const latestValuation = getLatestValuation();
  const totalGrowth = calculateTotalGrowth();
  const annualizedReturn = calculateAnnualizedReturn();
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={40} />
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HomeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            {propertyName ? `${propertyName} Overview` : 'Property Valuation Summary'}
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Current Valuation */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Valuation
                </Typography>
                
                {latestValuation ? (
                  <>
                    <Typography variant="h5" fontWeight="medium" color="primary.main">
                      {formatCurrency(latestValuation.value)}
                    </Typography>
                    
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      alignItems="center" 
                      sx={{ mt: 1 }}
                    >
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(latestValuation.date)}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Source: {latestValuation.source === 'professional' ? 'Professional Appraisal' :
                              latestValuation.source === 'automated' ? 'Automated Estimate' : 'Manual Entry'}
                    </Typography>
                  </>
                ) : purchasePrice ? (
                  <>
                    <Typography variant="h5" fontWeight="medium" color="primary.main">
                      {formatCurrency(purchasePrice)}
                    </Typography>
                    
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      alignItems="center" 
                      sx={{ mt: 1 }}
                    >
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Purchase price on {purchaseDate ? formatDate(purchaseDate) : 'unknown date'}
                      </Typography>
                    </Stack>
                    
                    <Chip 
                      label="No valuations yet" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No valuation data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Total Growth */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Growth
                </Typography>
                
                {purchasePrice && latestValuation ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {totalGrowth.value > 0 ? (
                        <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                      ) : totalGrowth.value < 0 ? (
                        <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                      ) : (
                        <MoneyIcon color="primary" sx={{ mr: 0.5 }} />
                      )}
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        color={totalGrowth.value > 0 ? 'success.main' : totalGrowth.value < 0 ? 'error.main' : 'text.primary'}
                      >
                        {totalGrowth.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" gutterBottom>
                      {formatCurrency(totalGrowth.value)}
                    </Typography>
                    
                    <Tooltip title="Growth since purchase">
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Since purchase {purchaseDate ? `(${formatDate(purchaseDate)})` : ''}
                        </Typography>
                        <InfoIcon fontSize="inherit" color="action" sx={{ ml: 0.5 }} />
                      </Box>
                    </Tooltip>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Not enough data
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Annualized Return */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Annual Return
                </Typography>
                
                {purchasePrice && purchaseDate && latestValuation ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {annualizedReturn > 0 ? (
                        <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                      ) : annualizedReturn < 0 ? (
                        <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                      ) : (
                        <MoneyIcon color="primary" sx={{ mr: 0.5 }} />
                      )}
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        color={annualizedReturn > 0 ? 'success.main' : annualizedReturn < 0 ? 'error.main' : 'text.primary'}
                      >
                        {annualizedReturn.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Tooltip title="The compound annual growth rate (CAGR) of your property">
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Annualized return rate
                        </Typography>
                        <InfoIcon fontSize="inherit" color="action" sx={{ ml: 0.5 }} />
                      </Box>
                    </Tooltip>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Not enough data
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Time Held */}
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ownership Duration
                </Typography>
                
                {purchaseDate ? (
                  <>
                    <Typography variant="h5" fontWeight="medium">
                      {getTimeHeldText()}
                    </Typography>
                    
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      alignItems="center" 
                      sx={{ mt: 1 }}
                    >
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Since {formatDate(purchaseDate)}
                      </Typography>
                    </Stack>
                  </>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Purchase date unknown
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Valuation Status */}
        {valuations.length === 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography color="info.contrastText">
              <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              No valuations have been added yet. Add your first valuation to start tracking your property's growth.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ValuationSummary;