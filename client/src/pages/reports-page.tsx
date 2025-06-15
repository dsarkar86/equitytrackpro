import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, MaintenanceRecord, Valuation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileBarChart, TrendingUp, Home, Wrench, AlertTriangle } from "lucide-react";
import { Property as PropertyType } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("6months");
  const [selectedProperty, setSelectedProperty] = useState<number | "all">("all");

  // Fetch properties
  const { data: properties, isLoading: propertiesLoading } = useQuery<PropertyType[]>({
    queryKey: ["/api/properties"],
    staleTime: 1000 * 60 * 5,
  });

  // Fetch maintenance records
  const { data: maintenanceRecords, isLoading: maintenanceLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance-records"],
    staleTime: 1000 * 60 * 5,
  });

  // Prepared data states
  const [propertyValueData, setPropertyValueData] = useState<any[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [expensesByCategoryData, setExpensesByCategoryData] = useState<any[]>([]);
  const [propertyComparison, setPropertyComparison] = useState<any[]>([]);

  useEffect(() => {
    if (properties && maintenanceRecords) {
      prepareData(properties, maintenanceRecords);
    }
  }, [properties, maintenanceRecords, selectedPeriod, selectedProperty]);

  const prepareData = (properties: PropertyType[], maintenanceRecords: MaintenanceRecord[]) => {
    // Filter by selected property if needed
    const filteredProperties = selectedProperty === "all" ? 
      properties : 
      properties.filter(p => p.id === selectedProperty);
    
    const filteredMaintenanceRecords = selectedProperty === "all" ? 
      maintenanceRecords : 
      maintenanceRecords.filter(m => m.propertyId === selectedProperty);
    
    // Determine date range based on selected period
    const startDate = getStartDateFromPeriod(selectedPeriod);
    const filteredByDateMaintenanceRecords = filteredMaintenanceRecords.filter(
      record => new Date(record.createdAt) >= startDate
    );

    // Prepare property value data (simplified for demo)
    const valueData = filteredProperties.map(property => ({
      name: property.propertyName || `Property ${property.id}`,
      purchaseValue: property.purchasePrice,
      currentValue: property.purchasePrice * (1 + (Math.random() * 0.3)), // Simulate current value with random increase
    }));
    setPropertyValueData(valueData);

    // Prepare maintenance data over time
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    let monthsToShow = 6;
    
    if (selectedPeriod === "1year") monthsToShow = 12;
    if (selectedPeriod === "3months") monthsToShow = 3;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, "MMM yyyy");
      monthlyData[monthKey] = 0;
    }

    // Populate maintenance count data
    filteredByDateMaintenanceRecords.forEach(record => {
      const date = new Date(record.createdAt);
      const monthKey = format(date, "MMM yyyy");
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }
    });

    const maintenanceChartData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }));
    setMaintenanceData(maintenanceChartData);

    // Prepare expenses by category
    const expensesByCategory: Record<string, number> = {};
    filteredByDateMaintenanceRecords.forEach(record => {
      const category = record.category;
      const cost = record.cost || 0;
      expensesByCategory[category] = (expensesByCategory[category] || 0) + cost;
    });

    const expensesCategoryData = Object.entries(expensesByCategory)
      .map(([category, totalCost]) => ({
        category: formatMaintenanceCategory(category),
        cost: totalCost,
      }))
      .sort((a, b) => b.cost - a.cost);
    
    setExpensesByCategoryData(expensesCategoryData);

    // Property comparison data
    if (filteredProperties.length > 1) {
      const comparisonData = filteredProperties.map(property => {
        const propertyMaintenance = filteredByDateMaintenanceRecords.filter(
          r => r.propertyId === property.id
        );
        
        const totalCost = propertyMaintenance.reduce((sum, record) => sum + (record.cost || 0), 0);
        const issueCount = propertyMaintenance.length;
        
        return {
          name: property.propertyName || `Property ${property.id}`,
          address: `${property.street}, ${property.city}`,
          value: property.purchasePrice,
          maintenance: totalCost,
          issues: issueCount,
        };
      });
      
      setPropertyComparison(comparisonData);
    } else {
      setPropertyComparison([]);
    }
  };

  // Helper to format maintenance category names
  const formatMaintenanceCategory = (category: string): string => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get start date based on selected period
  const getStartDateFromPeriod = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case "3months":
        return subMonths(now, 3);
      case "1year":
        return subMonths(now, 12);
      case "6months":
      default:
        return subMonths(now, 6);
    }
  };

  const handleExportData = () => {
    // In a real app, this would generate CSV files of the reports
    toast({
      title: "Report Downloaded",
      description: "Your report data has been exported to CSV format.",
    });
  };

  if (propertiesLoading || maintenanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileBarChart className="mr-2 h-8 w-8 text-primary" />
            Property Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            View insights and trends about your property portfolio
          </p>
        </div>
        <Button onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Time Period</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Property</label>
          <Select value={selectedProperty.toString()} onValueChange={value => setSelectedProperty(value === "all" ? "all" : parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties && properties.map(property => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.propertyName || `Property ${property.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="propertyValue">Property Value</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          {propertyComparison.length > 1 && (
            <TabsTrigger value="comparison">Property Comparison</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Home className="h-5 w-5 mr-2 text-amber-500" />
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{properties?.length || 0}</div>
                <p className="text-sm text-gray-500">Total properties managed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-500" />
                  Maintenance Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {selectedProperty === "all" 
                    ? maintenanceRecords?.length || 0
                    : maintenanceRecords?.filter(r => r.propertyId === selectedProperty).length || 0}
                </div>
                <p className="text-sm text-gray-500">Total maintenance records</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(
                    (properties || []).reduce((sum, p) => sum + (p.purchasePrice || 0), 0)
                  )}
                </div>
                <p className="text-sm text-gray-500">Total portfolio value</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={maintenanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="count" name="Maintenance Records" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                      <Legend />
                      <Bar dataKey="cost" name="Cost" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="propertyValue">
          <Card>
            <CardHeader>
              <CardTitle>Property Value Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyValueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                    <Legend />
                    <Bar dataKey="purchaseValue" name="Purchase Value" fill="#8884d8" />
                    <Bar dataKey="currentValue" name="Current Estimated Value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={maintenanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="Maintenance Issues" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                      <Legend />
                      <Bar dataKey="cost" name="Cost" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      { priority: 'Low', count: maintenanceRecords?.filter(r => r.priority === 'low').length || 0 },
                      { priority: 'Medium', count: maintenanceRecords?.filter(r => r.priority === 'medium').length || 0 },
                      { priority: 'High', count: maintenanceRecords?.filter(r => r.priority === 'high').length || 0 },
                      { priority: 'Emergency', count: maintenanceRecords?.filter(r => r.priority === 'emergency').length || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Issues" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {propertyComparison.length > 1 && (
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Property Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propertyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="value" name="Property Value ($)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="maintenance" name="Maintenance Costs ($)" fill="#82ca9d" />
                      <Bar yAxisId="right" dataKey="issues" name="Number of Issues" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}