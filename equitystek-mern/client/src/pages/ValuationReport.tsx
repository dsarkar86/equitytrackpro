import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Breadcrumbs,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Home as HomeIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  NavigateNext as NavigateNextIcon,
  CorporateFare as BankIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format, subMonths, subYears, differenceInMonths, differenceInYears } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
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

interface MarketData {
  date: string;
  averageValue: number;
  changePercentage: number;
  salesVolume: number;
}

interface LocalMarketMetrics {
  medianPrice: number;
  annualGrowthRate: number;
  averageDaysOnMarket: number;
  rentalYield: number;
  vacancyRate: number;
}

const ValuationReport: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const reportRef = useRef<HTMLDivElement>(null);
  
  // State for property and valuations data
  const [property, setProperty] = useState<Property | null>(null);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for market data
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [localMetrics, setLocalMetrics] = useState<LocalMarketMetrics | null>(null);
  
  // State for chart data
  const [timeframe, setTimeframe] = useState('all');
  const [chartData, setChartData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  
  // Fetch property, valuation and market data
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
        
        // Fetch market data - this would typically come from your API
        // For this example, we'll generate some sample data
        const marketResponse = await axios.get(`/api/market-data/${propertyResponse.data.propertyType}/${propertyResponse.data.address.split(',').pop()?.trim()}`);
        setMarketData(marketResponse.data || generateSampleMarketData(valuationsWithChanges));
        
        // Fetch local market metrics
        const metricsResponse = await axios.get(`/api/market-metrics/${propertyResponse.data.address.split(',').pop()?.trim()}`);
        setLocalMetrics(metricsResponse.data || generateSampleLocalMetrics());
        
        // Prepare initial chart data
        prepareChartData(valuationsWithChanges, 'all', marketResponse.data || generateSampleMarketData(valuationsWithChanges));
        
        setLoading(false);
      } catch (err: any) {
        // For demo purposes, create sample data if API call fails
        if (err.response?.status === 404) {
          try {
            // Get property info at minimum
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
            
            // Generate sample market data
            const sampleMarketData = generateSampleMarketData(valuationsWithChanges);
            setMarketData(sampleMarketData);
            
            // Generate sample local metrics
            setLocalMetrics(generateSampleLocalMetrics());
            
            // Prepare initial chart data
            prepareChartData(valuationsWithChanges, 'all', sampleMarketData);
            
            setLoading(false);
          } catch (propertyErr: any) {
            setError(propertyErr.response?.data?.message || 'Failed to load property data');
            setLoading(false);
            toast.error('Failed to load property data');
          }
        } else {
          setError(err.response?.data?.message || 'Failed to load property valuation data');
          setLoading(false);
          toast.error('Failed to load property valuation data');
        }
      }
    };
    
    fetchData();
  }, [propertyId]);
  
  // Handle timeframe change
  const handleTimeframeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newTimeframe = event.target.value as string;
    setTimeframe(newTimeframe);
    prepareChartData(valuations, newTimeframe, marketData);
  };
  
  // Prepare chart data based on timeframe
  const prepareChartData = (valuations: Valuation[], timeframe: string, marketData: MarketData[]) => {
    if (valuations.length === 0) return;
    
    let filteredValuations: Valuation[] = [];
    const now = new Date();
    
    // Filter valuations based on timeframe
    switch (timeframe) {
      case '1y':
        filteredValuations = valuations.filter(v => 
          new Date(v.date) >= subYears(now, 1)
        );
        break;
      case '3y':
        filteredValuations = valuations.filter(v => 
          new Date(v.date) >= subYears(now, 3)
        );
        break;
      case '5y':
        filteredValuations = valuations.filter(v => 
          new Date(v.date) >= subYears(now, 5)
        );
        break;
      case 'all':
      default:
        filteredValuations = valuations;
        break;
    }
    
    // If no filtered valuations, use all
    if (filteredValuations.length === 0) {
      filteredValuations = valuations;
    }
    
    // Create chart data for property valuations
    const chartData = filteredValuations.map(valuation => ({
      date: format(new Date(valuation.date), 'MMM yyyy'),
      propertyValue: valuation.value,
      timestamp: new Date(valuation.date).getTime() // for sorting
    }));
    
    // Filter market data to match same timeframe
    const firstDate = new Date(filteredValuations[0].date);
    const filteredMarketData = marketData.filter(m => 
      new Date(m.date) >= firstDate
    );
    
    // Create comparison data with both property and market values
    const comparisonData = [];
    
    // Get all unique dates
    const allDates = [...new Set([
      ...chartData.map(d => d.timestamp),
      ...filteredMarketData.map(d => new Date(d.date).getTime())
    ])].sort((a, b) => a - b);
    
    // For each date, find the property and market values
    for (const timestamp of allDates) {
      const dateStr = format(new Date(timestamp), 'MMM yyyy');
      
      // Find property value for this date
      const propertyItem = chartData.find(d => d.timestamp === timestamp);
      
      // Find market value for this date
      const marketItem = filteredMarketData.find(d => 
        new Date(d.date).getTime() === timestamp
      );
      
      comparisonData.push({
        date: dateStr,
        propertyValue: propertyItem ? propertyItem.propertyValue : null,
        marketValue: marketItem ? marketItem.averageValue : null,
        timestamp
      });
    }
    
    // Sort by date
    comparisonData.sort((a, b) => a.timestamp - b.timestamp);
    
    setChartData(chartData);
    setComparisonData(comparisonData);
  };
  
  // Generate sample market data (only for demo purposes)
  const generateSampleMarketData = (valuations: Valuation[]): MarketData[] => {
    if (valuations.length === 0) return [];
    
    const result: MarketData[] = [];
    const firstDate = new Date(valuations[0].date);
    const lastDate = new Date(valuations[valuations.length - 1].date);
    const firstValue = valuations[0].value;
    
    // Create a market trend that slightly differs from the property's trend
    const annualGrowthRate = 0.045; // 4.5% annual growth
    let currentDate = new Date(firstDate);
    let previousValue = firstValue * 0.9; // Start market value slightly below property value
    
    while (currentDate <= lastDate) {
      const monthlyGrowth = Math.pow(1 + annualGrowthRate, 1/12) - 1;
      const randomFactor = 0.98 + Math.random() * 0.04; // Random factor between 0.98 and 1.02
      
      const newValue = previousValue * (1 + monthlyGrowth) * randomFactor;
      const changePercentage = ((newValue - previousValue) / previousValue) * 100;
      
      result.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        averageValue: Math.round(newValue),
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        salesVolume: Math.floor(20 + Math.random() * 30)
      });
      
      previousValue = newValue;
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
    
    return result;
  };
  
  // Generate sample local market metrics (only for demo purposes)
  const generateSampleLocalMetrics = (): LocalMarketMetrics => {
    return {
      medianPrice: 750000,
      annualGrowthRate: 4.8,
      averageDaysOnMarket: 28,
      rentalYield: 3.7,
      vacancyRate: 1.2
    };
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
  
  // Calculate market comparison
  const calculateMarketComparison = () => {
    if (valuations.length < 2 || marketData.length < 2) {
      return { outperformance: 0, totalValue: 0 };
    }
    
    const firstPropertyValuation = valuations[0];
    const latestPropertyValuation = valuations[valuations.length - 1];
    
    const firstMarketData = marketData[0];
    const latestMarketData = marketData[marketData.length - 1];
    
    const propertyGrowth = (latestPropertyValuation.value - firstPropertyValuation.value) / firstPropertyValuation.value;
    const marketGrowth = (latestMarketData.averageValue - firstMarketData.averageValue) / firstMarketData.averageValue;
    
    const outperformance = (propertyGrowth - marketGrowth) * 100;
    const totalValue = (propertyGrowth - marketGrowth) * firstPropertyValuation.value;
    
    return { outperformance, totalValue };
  };
  
  // Generate PDF Report
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const content = reportRef.current;
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate the PDF dimensions based on the content size
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Add pagination if the content spans multiple pages
      const pageCount = Math.ceil(pdfHeight / 297); // A4 height is 297mm
      
      if (pageCount > 1) {
        for (let i = 1; i < pageCount; i++) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            0,
            -(i * 297),
            pdfWidth,
            pdfHeight
          );
        }
      }
      
      pdf.save(`${property?.name}_valuation_report.pdf`);
      toast.success('Valuation report downloaded successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF report');
    }
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
  const marketComparison = calculateMarketComparison();
  
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
            Valuation Report
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
          <Typography variant="h4" component="h1">
            Valuation Report: {property.name}
          </Typography>
        </Box>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            to={`/properties/${propertyId}/valuation-history`}
            sx={{ mr: 1 }}
          >
            Back to History
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PdfIcon />}
            onClick={generatePDF}
          >
            Download PDF Report
          </Button>
        </Box>
      </Box>
      
      {/* Report Content - This will be captured for PDF */}
      <Box ref={reportRef} sx={{ bgcolor: 'background.paper' }}>
        {/* Report Header */}
        <Paper sx={{ p: 4, mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                Property Valuation Report
              </Typography>
              <Typography variant="h5" gutterBottom>
                {property.name}
              </Typography>
              <Typography variant="subtitle1">
                {property.address}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Report Date: {format(new Date(), 'MMMM d, yyyy')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="white" fontWeight="bold">
                {formatCurrency(valuations.length > 0 ? valuations[valuations.length - 1].value : property.purchasePrice)}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Current Estimated Value
              </Typography>
              <Chip 
                label={`${annualizedReturn.toFixed(2)}% Annual Return`}
                color="success"
                sx={{ mt: 1, color: 'white', fontWeight: 'bold' }}
              />
            </Grid>
          </Grid>
        </Paper>
        
        {/* Executive Summary */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Executive Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Property Growth
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {totalGrowth.value > 0 ? (
                      <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                    ) : totalGrowth.value < 0 ? (
                      <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                    ) : null}
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={totalGrowth.value > 0 ? 'success.main' : totalGrowth.value < 0 ? 'error.main' : 'text.primary'}
                    >
                      {totalGrowth.percentage.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total growth since initial valuation
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {formatCurrency(totalGrowth.value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: 'background.default' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Annual Return
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {annualizedReturn > 0 ? (
                      <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                    ) : annualizedReturn < 0 ? (
                      <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                    ) : null}
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={annualizedReturn > 0 ? 'success.main' : annualizedReturn < 0 ? 'error.main' : 'text.primary'}
                    >
                      {annualizedReturn.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Annualized return rate
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {valuations.length > 0 && (
                      <>Over {differenceInYears(
                        new Date(valuations[valuations.length - 1].date), 
                        new Date(valuations[0].date)
                      )} years</>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', bgcolor: marketComparison.outperformance >= 0 ? 'success.light' : 'error.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Market Comparison
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {marketComparison.outperformance > 0 ? (
                      <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                    ) : (
                      <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                    )}
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={marketComparison.outperformance >= 0 ? 'success.main' : 'error.main'}
                    >
                      {marketComparison.outperformance.toFixed(2)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {marketComparison.outperformance >= 0 ? 'Outperforming' : 'Underperforming'} the market
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {formatCurrency(Math.abs(marketComparison.totalValue))} {marketComparison.totalValue >= 0 ? 'added value' : 'below market'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Property Details */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Property Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%' }}>
                        Property Type
                      </TableCell>
                      <TableCell>
                        {property.propertyType.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Size
                      </TableCell>
                      <TableCell>
                        {property.size} m²
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Bedrooms
                      </TableCell>
                      <TableCell>
                        {property.bedrooms}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Bathrooms
                      </TableCell>
                      <TableCell>
                        {property.bathrooms}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%' }}>
                        Purchase Date
                      </TableCell>
                      <TableCell>
                        {formatDate(property.purchaseDate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Purchase Price
                      </TableCell>
                      <TableCell>
                        {formatCurrency(property.purchasePrice)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Current Value
                      </TableCell>
                      <TableCell>
                        {valuations.length > 0 
                          ? formatCurrency(valuations[valuations.length - 1].value)
                          : 'No current valuation'
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                        Last Valuation
                      </TableCell>
                      <TableCell>
                        {valuations.length > 0 
                          ? formatDate(valuations[valuations.length - 1].date)
                          : 'No valuation history'
                        }
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Valuation Trend Chart */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Valuation Trend
            </Typography>
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={handleTimeframeChange}
                label="Timeframe"
                size="small"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="5y">Last 5 Years</MenuItem>
                <MenuItem value="3y">Last 3 Years</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {chartData.length > 0 ? (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
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
                  <Area
                    type="monotone"
                    dataKey="propertyValue"
                    name="Property Value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
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
        
        {/* Market Comparison */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Market Comparison
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {comparisonData.length > 0 ? (
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData}
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
                    formatter={(value) => [formatCurrency(Number(value)), "Value"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="propertyValue"
                    name="Your Property"
                    stroke="#8884d8"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="marketValue"
                    name="Market Average"
                    stroke="#82ca9d"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" fontStyle="italic">
                No market comparison data available.
              </Typography>
            </Box>
          )}
          
          {/* Market Metrics */}
          {localMetrics && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Local Market Metrics
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Median Price
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(localMetrics.medianPrice)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Annual Growth Rate
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {localMetrics.annualGrowthRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Days on Market
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {localMetrics.averageDaysOnMarket} days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rental Yield
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {localMetrics.rentalYield.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Card sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Vacancy Rate
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {localMetrics.vacancyRate.toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Paper>
        
        {/* Valuation History Table */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Valuation History
          </Typography>
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {valuations.map((valuation) => (
                    <TableRow key={valuation._id}>
                      <TableCell>
                        {formatDate(valuation.date)}
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
                          <Typography
                            variant="body2"
                            color={valuation.changePercentage! > 0 ? 'success.main' : valuation.changePercentage! < 0 ? 'error.main' : 'text.primary'}
                          >
                            {valuation.changePercentage?.toFixed(2)}% ({formatCurrency(valuation.changeValue || 0)})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {valuation.source === 'professional' ? 'Professional Appraisal' :
                         valuation.source === 'automated' ? 'Automated Estimate' : 'Manual Entry'}
                      </TableCell>
                      <TableCell>
                        {valuation.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" fontStyle="italic">
                No valuation history available.
              </Typography>
            </Box>
          )}
        </Paper>
        
        {/* Report Disclaimer */}
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            Disclaimer
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" paragraph>
            This valuation report is generated by Equitystek for informational purposes only and does not 
            constitute professional financial advice. The valuations provided are estimates based on available 
            data and market trends, and should not be solely relied upon for financial decisions.
          </Typography>
          <Typography variant="body2" paragraph>
            Market conditions can change rapidly, and individual property factors may significantly impact 
            actual market value. For a legally binding valuation, please consult a licensed property valuation 
            professional.
          </Typography>
          <Typography variant="body2">
            Report generated on {format(new Date(), 'MMMM d, yyyy')} by Equitystek.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ValuationReport;