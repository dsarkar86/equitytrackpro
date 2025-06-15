import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Paid as PaidIcon,
  Percent as PercentIcon,
  Home as HomeIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

interface Property {
  _id: string;
  name: string;
  purchasePrice: number;
  purchaseDate: string;
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

interface InvestmentMetricsProps {
  property: Property;
  currentValue: number;
  loading?: boolean;
}

const InvestmentMetrics: React.FC<InvestmentMetricsProps> = ({
  property,
  currentValue,
  loading = false
}) => {
  const theme = useTheme();
  
  // State for user inputs
  const [inputs, setInputs] = useState({
    rentalIncome: property.rentalIncome || 0,
    propertyTax: property.expenses?.propertyTax || 0,
    insurance: property.expenses?.insurance || 0,
    maintenance: property.expenses?.maintenance || 0,
    management: property.expenses?.management || 0,
    utilities: property.expenses?.utilities || 0,
    otherExpenses: property.expenses?.other || 0,
    mortgageAmount: property.mortgageDetails?.loanAmount || (property.purchasePrice * 0.8), // Default 80% LVR
    interestRate: property.mortgageDetails?.interestRate || 5.5,
    mortgageTerm: property.mortgageDetails?.term || 30
  });
  
  // State for calculation trigger
  const [calculationMode, setCalculationMode] = useState<'default' | 'calculating' | 'complete'>('default');
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: parseFloat(value) || 0
    });
    
    if (calculationMode === 'complete') {
      setCalculationMode('default');
    }
  };
  
  // Calculate metrics when button is clicked
  const calculateMetrics = () => {
    setCalculationMode('calculating');
    
    // Simulate API call delay
    setTimeout(() => {
      setCalculationMode('complete');
    }, 1000);
  };
  
  // Calculate key financial metrics
  
  // 1. Cash on Cash Return
  const calculateCashOnCash = () => {
    const downPayment = property.purchasePrice - inputs.mortgageAmount;
    const closingCosts = property.purchasePrice * 0.04; // Estimate 4% for closing costs
    const totalInvestment = downPayment + closingCosts;
    
    // Annual expenses
    const annualExpenses = (
      inputs.propertyTax +
      inputs.insurance +
      inputs.maintenance +
      inputs.management +
      inputs.utilities +
      inputs.otherExpenses
    ) * 12;
    
    // Annual mortgage payment
    const monthlyInterestRate = inputs.interestRate / 100 / 12;
    const totalPayments = inputs.mortgageTerm * 12;
    const mortgagePayment = 
      inputs.mortgageAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    
    const annualMortgagePayments = mortgagePayment * 12;
    
    // Annual cash flow
    const annualRentalIncome = inputs.rentalIncome * 12;
    const annualCashFlow = annualRentalIncome - annualExpenses - annualMortgagePayments;
    
    // Cash on cash return (%)
    return (annualCashFlow / totalInvestment) * 100;
  };
  
  // 2. Cap Rate
  const calculateCapRate = () => {
    // Annual Net Operating Income (NOI)
    const annualIncome = inputs.rentalIncome * 12;
    const annualExpenses = (
      inputs.propertyTax +
      inputs.insurance +
      inputs.maintenance +
      inputs.management +
      inputs.utilities +
      inputs.otherExpenses
    ) * 12;
    
    const noi = annualIncome - annualExpenses;
    
    // Cap Rate (%) = NOI / Current Property Value
    return (noi / currentValue) * 100;
  };
  
  // 3. Gross Yield
  const calculateGrossYield = () => {
    const annualRentalIncome = inputs.rentalIncome * 12;
    
    // Gross Yield (%) = Annual Rental Income / Purchase Price
    return (annualRentalIncome / property.purchasePrice) * 100;
  };
  
  // 4. Net Yield
  const calculateNetYield = () => {
    // Annual income
    const annualIncome = inputs.rentalIncome * 12;
    
    // Annual expenses
    const annualExpenses = (
      inputs.propertyTax +
      inputs.insurance +
      inputs.maintenance +
      inputs.management +
      inputs.utilities +
      inputs.otherExpenses
    ) * 12;
    
    // Net yield (%) = (Annual Income - Annual Expenses) / Purchase Price
    return ((annualIncome - annualExpenses) / property.purchasePrice) * 100;
  };
  
  // 5. ROI
  const calculateROI = () => {
    const equity = currentValue - inputs.mortgageAmount;
    const initialInvestment = property.purchasePrice - (property.mortgageDetails?.loanAmount || inputs.mortgageAmount);
    
    // ROI (%) = (Current Equity - Initial Investment) / Initial Investment
    return ((equity - initialInvestment) / initialInvestment) * 100;
  };
  
  // 6. Monthly Cash Flow
  const calculateMonthlyCashFlow = () => {
    // Monthly expenses
    const monthlyExpenses = 
      inputs.propertyTax +
      inputs.insurance +
      inputs.maintenance +
      inputs.management +
      inputs.utilities +
      inputs.otherExpenses;
    
    // Monthly mortgage payment
    const monthlyInterestRate = inputs.interestRate / 100 / 12;
    const totalPayments = inputs.mortgageTerm * 12;
    const mortgagePayment = 
      inputs.mortgageAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) / 
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
    
    // Monthly cash flow
    return inputs.rentalIncome - monthlyExpenses - mortgagePayment;
  };
  
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
    return `${value.toFixed(2)}%`;
  };
  
  // Get the calculated metrics
  const cashOnCash = calculateCashOnCash();
  const capRate = calculateCapRate();
  const grossYield = calculateGrossYield();
  const netYield = calculateNetYield();
  const roi = calculateROI();
  const monthlyCashFlow = calculateMonthlyCashFlow();
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalculateIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Investment Analysis
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalculateIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Investment Analysis
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Input Section */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="medium">
              Financial Inputs
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Income Inputs */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Income Details
                  </Typography>
                  <TextField
                    name="rentalIncome"
                    label="Monthly Rental Income"
                    type="number"
                    value={inputs.rentalIncome}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Paper>
              </Grid>
              
              {/* Mortgage Inputs */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Mortgage Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        name="mortgageAmount"
                        label="Mortgage Amount"
                        type="number"
                        value={inputs.mortgageAmount}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        name="interestRate"
                        label="Interest Rate"
                        type="number"
                        value={inputs.interestRate}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        name="mortgageTerm"
                        label="Loan Term"
                        type="number"
                        value={inputs.mortgageTerm}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">years</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {/* Expense Inputs */}
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Monthly Expenses
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="propertyTax"
                        label="Property Tax"
                        type="number"
                        value={inputs.propertyTax}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="insurance"
                        label="Insurance"
                        type="number"
                        value={inputs.insurance}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="maintenance"
                        label="Maintenance"
                        type="number"
                        value={inputs.maintenance}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="management"
                        label="Property Management"
                        type="number"
                        value={inputs.management}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="utilities"
                        label="Utilities"
                        type="number"
                        value={inputs.utilities}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        name="otherExpenses"
                        label="Other Expenses"
                        type="number"
                        value={inputs.otherExpenses}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={calculationMode === 'calculating' ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
                    onClick={calculateMetrics}
                    disabled={calculationMode === 'calculating'}
                  >
                    {calculationMode === 'calculating' ? 'Calculating...' : 'Calculate Investment Metrics'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {/* Results Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Investment Metrics
          </Typography>
          
          <Grid container spacing={3}>
            {/* ROI */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ 
                p: 2, 
                height: '100%',
                bgcolor: roi > 0 ? 'success.light' : roi < 0 ? 'error.light' : 'background.paper',
                color: roi > 0 ? 'success.dark' : roi < 0 ? 'error.dark' : 'text.primary'
              }}>
                <Box sx={{ mb: 1 }}>
                  <TrendingUpIcon color="inherit" />
                  <Typography variant="subtitle2" color="inherit">
                    Return on Investment
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatPercentage(roi)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Based on your {formatCurrency(property.purchasePrice - (property.mortgageDetails?.loanAmount || inputs.mortgageAmount))} initial investment
                </Typography>
              </Paper>
            </Grid>
            
            {/* Cash on Cash Return */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ mb: 1 }}>
                  <PaidIcon color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Cash on Cash Return
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color={cashOnCash > 0 ? 'success.main' : 'error.main'}>
                  {formatPercentage(cashOnCash)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Annual cash flow / Initial cash investment
                </Typography>
              </Paper>
            </Grid>
            
            {/* Cap Rate */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ mb: 1 }}>
                  <PercentIcon color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Capitalization Rate
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatPercentage(capRate)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Net Operating Income / Current Value
                </Typography>
              </Paper>
            </Grid>
            
            {/* Monthly Cash Flow */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ mb: 1 }}>
                  <ArrowForwardIcon color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Monthly Cash Flow
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color={monthlyCashFlow > 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(monthlyCashFlow)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Income minus all expenses
                </Typography>
              </Paper>
            </Grid>
            
            {/* Gross Yield */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ mb: 1 }}>
                  <HomeIcon color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Gross Yield
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatPercentage(grossYield)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Annual Rental Income / Purchase Price
                </Typography>
              </Paper>
            </Grid>
            
            {/* Net Yield */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Box sx={{ mb: 1 }}>
                  <BusinessIcon color="primary" />
                  <Typography variant="subtitle2" color="primary">
                    Net Yield
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {formatPercentage(netYield)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  (Income - Expenses) / Purchase Price
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Investment Summary */}
          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Investment Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Purchase Price:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(property.purchasePrice)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Current Value:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(currentValue)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Equity:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(currentValue - inputs.mortgageAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvestmentMetrics;