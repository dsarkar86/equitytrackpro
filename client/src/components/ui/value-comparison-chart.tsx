import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';
import { Property, MaintenanceRecord } from '@shared/schema';
import { Card } from '@/components/ui/card';

interface ValueComparisonChartProps {
  properties: Property[];
  maintenanceRecords: MaintenanceRecord[];
  showLegend?: boolean;
  showDetails?: boolean;
  showComparisons?: boolean;
}

export function ValueComparisonChart({
  properties,
  maintenanceRecords,
  showLegend = false,
  showDetails = false,
  showComparisons = false
}: ValueComparisonChartProps) {
  // Generate chart data for each property
  const chartData = properties.map(property => {
    // Calculate base property value (simplified for demonstration)
    const baseValue = property.squareFeet * 200; // $200 per square foot as base
    const bedroomValue = (property.bedrooms || 0) * 15000; // $15k per bedroom
    const bathroomValue = (property.bathrooms || 0) * 10000; // $10k per bathroom
    
    // Calculate maintenance value
    const propertyMaintenanceRecords = maintenanceRecords.filter(
      record => record.propertyId === property.id
    );
    
    const maintenanceValue = propertyMaintenanceRecords.reduce(
      (sum, record) => sum + (record.estimatedValueAdded || 0),
      0
    );
    
    // Base property value without maintenance
    const basePropertyValue = baseValue + bedroomValue + bathroomValue;
    
    // Different valuation methods (simplified for demonstration)
    const comparableSalesValue = basePropertyValue - 15000; // Slightly lower
    const perSquareFootValue = property.squareFeet * 195; // Different rate
    const automatedModelValue = basePropertyValue - 20000; // Another variation
    const costApproachValue = basePropertyValue + 10000; // Higher
    const incomeApproachValue = basePropertyValue + 5000; // Another variation
    
    // Equitystek valuation includes maintenance history
    const equitystekValue = basePropertyValue + maintenanceValue;
    
    return {
      name: property.address,
      "Comparable Sales": comparableSalesValue,
      "Per Square Foot": perSquareFootValue,
      "Automated Model": automatedModelValue,
      "Cost Approach": costApproachValue,
      "Income Approach": incomeApproachValue,
      "With Maintenance": equitystekValue,
      "Base Value": basePropertyValue,
      "Maintenance Value": maintenanceValue,
    };
  });

  // Create comparison chart data if needed
  const getComparisonData = () => {
    if (chartData.length === 0) return [];
    
    const mainData = chartData[0];
    
    // Create an array of comparable points for the first property
    return [
      { name: "Comparable 1", value: mainData["Comparable Sales"] - 15000, label: `$${formatValue(mainData["Comparable Sales"] - 15000)}K` },
      { name: "Comparable 2", value: mainData["Comparable Sales"] + 12000, label: `$${formatValue(mainData["Comparable Sales"] + 12000)}K` },
      { name: "Comparable 3", value: mainData["Comparable Sales"] - 2000, label: `$${formatValue(mainData["Comparable Sales"] - 2000)}K` },
      { name: "Your Property", value: mainData["With Maintenance"], property: true, label: `$${formatValue(mainData["With Maintenance"])}K` },
      { name: "Comparable 4", value: mainData["Comparable Sales"] - 7000, label: `$${formatValue(mainData["Comparable Sales"] - 7000)}K` },
    ];
  };

  // Format value for display in thousands
  const formatValue = (value: number) => {
    return Math.round(value / 1000);
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="bg-white p-3 shadow">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </Card>
      );
    }
    return null;
  };

  if (showComparisons) {
    const comparisonData = getComparisonData();
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={comparisonData}
          margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide 
            domain={[(dataMin: number) => dataMin * 0.9, (dataMax: number) => dataMax * 1.1]} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill={(entry) => entry.property ? "#3b82f6" : "#d1d5db"}
            radius={[4, 4, 0, 0]}
          >
            <LabelList 
              dataKey="label" 
              position="top" 
              style={{ fontSize: '12px', fill: '#6b7280' }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (showDetails) {
    // Display a more detailed breakdown for a single property
    if (chartData.length === 0) return <div>No property data available</div>;
    
    const propertyData = chartData[0];
    
    // Transform the data for better visualization
    const detailedData = [
      { name: "Base Property Value", value: propertyData["Base Value"] },
      { name: "Maintenance Value Added", value: propertyData["Maintenance Value"] },
    ];
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={detailedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tickFormatter={(value) => `$${formatValue(value)}K`} 
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            width={150}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value as number)}
            labelFormatter={(label) => `${label}`}
          />
          {showLegend && <Legend />}
          <Bar 
            dataKey="value" 
            name="Value" 
            fill={(entry, index) => index === 0 ? "#9ca3af" : "#3b82f6"}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="value" 
              position="right" 
              formatter={(value) => formatCurrency(value as number)} 
              style={{ fill: '#000', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Default chart showing valuation comparison
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          label={{ value: 'Property', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          tickFormatter={(value) => `$${formatValue(value)}K`} 
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        <Bar 
          dataKey="Comparable Sales" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="Per Square Foot" 
          fill="#82ca9d" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="Automated Model" 
          fill="#ffc658" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="With Maintenance" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
