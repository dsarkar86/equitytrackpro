import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
  AccountBalance as AccountBalanceIcon,
  Home as HomeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

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

interface PortfolioSummaryProps {
  properties: PropertySummary[];
  loading?: boolean;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  properties,
  loading = false
}) => {
  const theme = useTheme();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Calculate portfolio totals
  const calculatePortfolioTotals = () => {
    if (properties.length === 0) {
      return {
        totalPurchasePrice: 0,
        totalCurrentValue: 0,
        totalGrowth: 0,
        totalGrowthPercentage: 0,
        averageROI: 0
      };
    }
    
    const totalPurchasePrice = properties.reduce((sum, property) => sum + property.purchasePrice, 0);
    const totalCurrentValue = properties.reduce((sum, property) => sum + property.currentValue, 0);
    const totalGrowth = totalCurrentValue - totalPurchasePrice;
    const totalGrowthPercentage = (totalGrowth / totalPurchasePrice) * 100;
    const averageROI = properties.reduce((sum, property) => sum + property.roi, 0) / properties.length;
    
    return {
      totalPurchasePrice,
      totalCurrentValue,
      totalGrowth,
      totalGrowthPercentage,
      averageROI
    };
  };
  
  // Calculate property type distribution for chart
  const calculatePropertyTypeDistribution = () => {
    if (properties.length === 0) return [];
    
    const propertyTypes: Record<string, number> = {};
    
    properties.forEach(property => {
      const type = property.propertyType;
      propertyTypes[type] = (propertyTypes[type] || 0) + 1;
    });
    
    return Object.entries(propertyTypes).map(([type, count]) => ({
      name: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: count
    }));
  };
  
  // Calculate value distribution for chart
  const calculateValueDistribution = () => {
    if (properties.length === 0) return [];
    
    return properties.map(property => ({
      name: property.name,
      value: property.currentValue
    }));
  };
  
  const totals = calculatePortfolioTotals();
  const propertyTypeData = calculatePropertyTypeDistribution();
  const valueDistribution = calculateValueDistribution();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Portfolio Summary
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Portfolio Summary
            </Typography>
          </Box>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              You don't have any properties in your portfolio yet.
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/properties/add"
              startIcon={<HomeIcon />}
            >
              Add Your First Property
            </Button>
          </Paper>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Portfolio Summary
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Portfolio Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText',
                height: '100%' 
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Total Portfolio Value
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(totals.totalCurrentValue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {totals.totalGrowth > 0 ? (
                  <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography variant="body2">
                  {formatCurrency(totals.totalGrowth)} ({formatPercentage(totals.totalGrowthPercentage)})
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Investment
              </Typography>
              <Typography variant="h5" fontWeight="medium">
                {formatCurrency(totals.totalPurchasePrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Initial purchase price of all properties
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average ROI
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="medium"
                color={totals.averageROI > 0 ? 'success.main' : totals.averageROI < 0 ? 'error.main' : 'text.primary'}
              >
                {formatPercentage(totals.averageROI)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Return on investment across portfolio
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Properties
              </Typography>
              <Typography variant="h5" fontWeight="medium">
                {properties.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {propertyTypeData.length} different property types
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Property Types
              </Typography>
              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} properties`, 'Count']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Value Distribution
              </Typography>
              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={valueDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {valueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Value']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Property Table */}
        <Box>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Properties Overview
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Current Value</TableCell>
                  <TableCell align="right">Growth</TableCell>
                  <TableCell align="right">ROI</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property._id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {property.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.address.split(',').slice(-2).join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {property.propertyType.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(property.purchasePrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(property.currentValue)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {property.growth > 0 ? (
                          <TrendingUpIcon 
                            fontSize="small" 
                            sx={{ mr: 0.5, color: 'success.main' }} 
                          />
                        ) : property.growth < 0 ? (
                          <TrendingDownIcon 
                            fontSize="small" 
                            sx={{ mr: 0.5, color: 'error.main' }} 
                          />
                        ) : null}
                        <Typography 
                          variant="body2"
                          color={property.growth > 0 ? 'success.main' : property.growth < 0 ? 'error.main' : 'text.primary'}
                        >
                          {formatPercentage(property.growthPercentage)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={formatPercentage(property.roi)} 
                        size="small"
                        color={property.roi > 0 ? 'success' : property.roi < 0 ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/properties/${property._id}/financial`}
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;