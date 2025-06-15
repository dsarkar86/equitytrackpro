import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  CircularProgress,
  useTheme,
  Paper,
  Skeleton
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, subMonths, subYears } from 'date-fns';

interface Valuation {
  _id: string;
  date: string;
  value: number;
  source: 'professional' | 'automated' | 'manual';
  changePercentage?: number;
  changeValue?: number;
}

interface ValuationChartProps {
  valuations: Valuation[];
  purchaseDate?: string;
  purchasePrice?: number;
  loading?: boolean;
  compareWithMarket?: boolean;
  marketData?: any[];
  chartType?: 'line' | 'area';
  height?: number;
}

const ValuationChart: React.FC<ValuationChartProps> = ({
  valuations,
  purchaseDate,
  purchasePrice,
  loading = false,
  compareWithMarket = false,
  marketData = [],
  chartType = 'area',
  height = 400
}) => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState<string>('all');
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Prepare chart data based on timeframe
  useEffect(() => {
    if (valuations.length === 0 && !purchasePrice) return;
    
    let data: any[] = [];
    
    // Add purchase data if available
    if (purchaseDate && purchasePrice) {
      data.push({
        date: purchaseDate,
        value: purchasePrice,
        displayDate: format(new Date(purchaseDate), 'MMM yyyy'),
        source: 'purchase',
        timestamp: new Date(purchaseDate).getTime()
      });
    }
    
    // Add valuation data
    data = [...data, ...valuations.map(v => ({
      date: v.date,
      value: v.value,
      displayDate: format(new Date(v.date), 'MMM yyyy'),
      source: v.source,
      timestamp: new Date(v.date).getTime()
    }))];
    
    // Add market data if comparing with market
    if (compareWithMarket && marketData.length > 0) {
      data = data.map(item => {
        const matchingMarketData = marketData.find(md => {
          const marketDate = new Date(md.date).getTime();
          const itemDate = item.timestamp;
          // Match if dates are within 15 days of each other
          return Math.abs(marketDate - itemDate) < 15 * 24 * 60 * 60 * 1000;
        });
        
        return {
          ...item,
          marketValue: matchingMarketData?.averageValue || null
        };
      });
    }
    
    // Sort by date
    data.sort((a, b) => a.timestamp - b.timestamp);
    
    // Filter based on timeframe
    const now = new Date();
    let filteredData = data;
    
    switch (timeframe) {
      case '1y':
        filteredData = data.filter(item => 
          new Date(item.date) >= subYears(now, 1)
        );
        break;
      case '3y':
        filteredData = data.filter(item => 
          new Date(item.date) >= subYears(now, 3)
        );
        break;
      case '5y':
        filteredData = data.filter(item => 
          new Date(item.date) >= subYears(now, 5)
        );
        break;
      case 'all':
      default:
        // Keep all data
        break;
    }
    
    // If filtered data is empty but we have some data, show all data
    if (filteredData.length === 0 && data.length > 0) {
      filteredData = data;
    }
    
    setChartData(filteredData);
  }, [valuations, purchaseDate, purchasePrice, timeframe, compareWithMarket, marketData]);
  
  // Format currency for tooltips and axis
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom tooltip to make it more user-friendly
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: theme.shadows[3], maxWidth: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          
          {payload.map((entry: any, index: number) => {
            // Skip if no value or it's null
            if (!entry.value && entry.value !== 0) return null;
            
            const color = entry.color;
            const name = entry.name === 'value' ? 'Property Value' : 
                        entry.name === 'marketValue' ? 'Market Average' : entry.name;
            
            return (
              <Box key={`item-${index}`} sx={{ mb: index < payload.length - 1 ? 1 : 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ width: 12, height: 12, backgroundColor: color, mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {name}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(entry.value)}
                </Typography>
              </Box>
            );
          })}
          
          {payload[0]?.payload?.source && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Source: {payload[0].payload.source === 'purchase' ? 'Purchase Price' :
                       payload[0].payload.source === 'professional' ? 'Professional Appraisal' :
                       payload[0].payload.source === 'automated' ? 'Automated Estimate' : 'Manual Entry'}
            </Typography>
          )}
        </Paper>
      );
    }
    
    return null;
  };
  
  // Loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%', height: height }}>
        <Skeleton variant="rectangular" width="100%" height={height} animation="wave" />
      </Box>
    );
  }
  
  // Empty state
  if (chartData.length === 0) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 1
      }}>
        <Typography variant="body1" color="text.secondary">
          No valuation data available to display.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Card sx={{ height: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Property Value Trend
          </Typography>
          
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="5y">Last 5 Years</MenuItem>
              <MenuItem value="3y">Last 3 Years</MenuItem>
              <MenuItem value="1y">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ height: height, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* If we're comparing with market, show market data line */}
                {compareWithMarket && (
                  <Area
                    type="monotone"
                    dataKey="marketValue"
                    name="Market Average"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.light}
                    fillOpacity={0.1}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    isAnimationActive={true}
                    connectNulls
                  />
                )}
                
                {/* Property value area */}
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Property Value"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.3}
                  strokeWidth={3}
                  isAnimationActive={true}
                  activeDot={{ r: 8, stroke: theme.palette.primary.dark, strokeWidth: 1 }}
                />
                
                {/* Add reference line for purchase price if available */}
                {purchasePrice && !compareWithMarket && (
                  <ReferenceLine 
                    y={purchasePrice} 
                    stroke={theme.palette.info.main}
                    strokeDasharray="3 3"
                    label={{ 
                      value: 'Purchase Price', 
                      position: 'insideBottomRight',
                      fill: theme.palette.info.main
                    }}
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* If we're comparing with market, show market data line */}
                {compareWithMarket && (
                  <Line
                    type="monotone"
                    dataKey="marketValue"
                    name="Market Average"
                    stroke={theme.palette.success.main}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    isAnimationActive={true}
                    connectNulls
                    dot={{ stroke: theme.palette.success.main, strokeWidth: 1, r: 4 }}
                  />
                )}
                
                {/* Property value line */}
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Property Value"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  isAnimationActive={true}
                  dot={{ stroke: theme.palette.primary.dark, strokeWidth: 1, r: 4 }}
                  activeDot={{ r: 8, stroke: theme.palette.primary.dark, strokeWidth: 1 }}
                />
                
                {/* Add reference line for purchase price if available */}
                {purchasePrice && !compareWithMarket && (
                  <ReferenceLine 
                    y={purchasePrice} 
                    stroke={theme.palette.info.main}
                    strokeDasharray="3 3"
                    label={{ 
                      value: 'Purchase Price', 
                      position: 'insideBottomRight',
                      fill: theme.palette.info.main
                    }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
        
        {/* Key statistics */}
        {chartData.length > 1 && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Value
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="medium">
                  {formatCurrency(chartData[chartData.length - 1].value)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Change
                </Typography>
                <Typography 
                  variant="h6" 
                  color={
                    chartData[chartData.length - 1].value > chartData[0].value ? 
                    'success.main' : 'error.main'
                  } 
                  fontWeight="medium"
                >
                  {((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {format(new Date(chartData[chartData.length - 1].date), 'd MMM yyyy')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default ValuationChart;