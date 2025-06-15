import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Property, MaintenanceRecord, Valuation as ValuationType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ValueComparisonChart } from "@/components/ui/value-comparison-chart";
import { ValuationMethods } from "@/components/ui/valuation-methods";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Download, 
  FileText, 
  Home 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ValuationPage() {
  const [location] = useLocation();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [currentTab, setCurrentTab] = useState("overview");
  
  // Extract propertyId from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const propertyId = params.get('propertyId');
    if (propertyId) {
      setSelectedPropertyId(parseInt(propertyId));
    }
  }, [location]);

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading: isLoadingMaintenance } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  // Find selected property
  const selectedProperty = selectedPropertyId 
    ? properties.find(p => p.id === selectedPropertyId) 
    : properties[0];
  
  // Get maintenance records for selected property
  const propertyMaintenanceRecords = maintenanceRecords.filter(
    record => record.propertyId === selectedProperty?.id
  );

  // Calculate property valuation based on different methods
  const calculateValuation = (property?: Property): ValuationType | null => {
    if (!property) return null;
    
    // Base calculations using property details
    const baseValue = property.squareFeet * 200; // $200 per square foot as base
    const bedroomValue = (property.bedrooms || 0) * 15000; // $15k per bedroom
    const bathroomValue = (property.bathrooms || 0) * 10000; // $10k per bathroom
    
    // Total maintenance value added
    const maintenanceValue = propertyMaintenanceRecords.reduce(
      (sum, record) => sum + (record.estimatedValueAdded || 0),
      0
    );
    
    // Different valuation methods
    const comparableSalesValue = baseValue + bedroomValue + bathroomValue - 15000; // Slightly lower
    const perSquareFootValue = property.squareFeet * 195; // Different rate
    const automatedModelValue = baseValue + bedroomValue + bathroomValue - 20000; // Another variation
    const costApproachValue = baseValue + bedroomValue + bathroomValue + 10000; // Higher
    const incomeApproachValue = baseValue + bedroomValue + bathroomValue + 5000; // Another variation
    
    // Equitystek valuation includes maintenance history
    const equitystekValue = baseValue + bedroomValue + bathroomValue + maintenanceValue;
    
    return {
      id: 0, // Placeholder
      propertyId: property.id,
      comparableSalesValue,
      perSquareFootValue,
      automatedModelValue,
      costApproachValue,
      incomeApproachValue,
      maintenanceAddedValue: maintenanceValue,
      equitystekValue,
      createdAt: new Date(),
    };
  };
  
  const valuation = calculateValuation(selectedProperty);
  
  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return "N/A";
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const isLoading = isLoadingProperties || isLoadingMaintenance;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">Property Valuation</h1>
              <p className="mt-1 text-sm text-gray-500">
                Calculate the value of your property based on maintenance history and standard methods.
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Valuation Calculator</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a property to view its detailed valuation.
                  </p>
                </div>
                <div className="mt-4 md:mt-0 w-full md:w-64">
                  <Select 
                    value={selectedProperty?.id.toString()} 
                    onValueChange={(value) => setSelectedPropertyId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          {property.address}, {property.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="mt-4 text-gray-500">Loading valuation data...</p>
            </div>
          ) : !selectedProperty ? (
            <Card className="p-8 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Property Selected</h3>
              <p className="text-gray-500 mb-4">Please select a property to view its valuation.</p>
            </Card>
          ) : (
            <>
              <Card className="mb-8">
                <CardContent className="p-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedProperty.address}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                  </p>
                </CardContent>
                
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                  <div className="border-b border-gray-200">
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-none space-x-8 w-auto bg-transparent">
                      <TabsTrigger 
                        value="overview" 
                        className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent rounded-none focus:ring-0"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="details" 
                        className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent rounded-none focus:ring-0"
                      >
                        Breakdown
                      </TabsTrigger>
                      <TabsTrigger 
                        value="comparison" 
                        className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent rounded-none focus:ring-0"
                      >
                        Comparison
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  {/* Valuation Overview Tab */}
                  <TabsContent value="overview" className="pt-6 px-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <ValuationMethods valuation={valuation} />
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Valuation Method Comparison</h4>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <ValueComparisonChart 
                          properties={[selectedProperty]} 
                          maintenanceRecords={propertyMaintenanceRecords}
                          showDetails={true}
                          showLegend={true}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Equitystek Valuation</h4>
                        <p className="text-3xl font-semibold text-primary">{formatCurrency(valuation?.equitystekValue)}</p>
                      </div>
                      <Button className="w-full md:w-auto">
                        <FileText className="mr-2 h-4 w-4" /> Generate Valuation Report
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Valuation Breakdown Tab */}
                  <TabsContent value="details" className="pt-6 px-6">
                    <h4 className="text-base font-medium text-gray-900 mb-4">Maintenance Value Breakdown</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Maintenance Item</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Value Added</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {propertyMaintenanceRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                No maintenance records found for this property.
                              </TableCell>
                            </TableRow>
                          ) : (
                            propertyMaintenanceRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell className="font-medium">{record.title}</TableCell>
                                <TableCell>{new Date(record.completedDate).toLocaleDateString()}</TableCell>
                                <TableCell className="capitalize">{record.category}</TableCell>
                                <TableCell className="text-right">{formatCurrency(record.cost)}</TableCell>
                                <TableCell className="text-right text-green-600">
                                  {formatCurrency(record.estimatedValueAdded)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                          {propertyMaintenanceRecords.length > 0 && (
                            <TableRow className="bg-gray-50 font-medium">
                              <TableCell colSpan={3} className="text-right">Total Maintenance Value</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(propertyMaintenanceRecords.reduce((sum, r) => sum + r.cost, 0))}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {formatCurrency(valuation?.maintenanceAddedValue)}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Property Details Impact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Property Specifications</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Property Type:</span>
                              <span className="text-sm capitalize">
                                {selectedProperty.propertyType.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Size:</span>
                              <span className="text-sm">{selectedProperty.squareFeet} sqft</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Bedrooms:</span>
                              <span className="text-sm">{selectedProperty.bedrooms}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Bathrooms:</span>
                              <span className="text-sm">{selectedProperty.bathrooms}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Year Built:</span>
                              <span className="text-sm">{selectedProperty.yearBuilt || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Valuation Factors</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Base Square Footage Value:</span>
                              <span className="text-sm">{formatCurrency(selectedProperty.squareFeet * 200)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Bedroom Value:</span>
                              <span className="text-sm">{formatCurrency((selectedProperty.bedrooms || 0) * 15000)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Bathroom Value:</span>
                              <span className="text-sm">{formatCurrency((selectedProperty.bathrooms || 0) * 10000)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Maintenance Added Value:</span>
                              <span className="text-sm text-green-600">{formatCurrency(valuation?.maintenanceAddedValue)}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                              <span className="text-sm">Equitystek Total Value:</span>
                              <span className="text-sm text-primary">{formatCurrency(valuation?.equitystekValue)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Valuation Insights</h4>
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-4">
                          Your property's value is {propertyMaintenanceRecords.length > 0 ? 'enhanced' : 'determined'} by 
                          {propertyMaintenanceRecords.length > 0 ? ' its well-documented maintenance history.' : ' its physical attributes and location.'}
                          {propertyMaintenanceRecords.length > 0 && maintenanceRecords.some(r => r.estimatedValueAdded && r.estimatedValueAdded > 10000) && 
                            ' The significant renovations have substantially increased your property\'s market appeal and value.'}
                        </p>
                        
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h5>
                        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                          {propertyMaintenanceRecords.length === 0 && (
                            <li>Start documenting maintenance and renovations to build value history</li>
                          )}
                          {!propertyMaintenanceRecords.some(r => r.category === 'bathroom') && (
                            <li>Consider updating bathroom fixtures to further increase value</li>
                          )}
                          {!propertyMaintenanceRecords.some(r => r.category === 'hvac') && (
                            <li>Regular HVAC maintenance will help maintain current value</li>
                          )}
                          <li>Document all future maintenance with receipts and photos</li>
                          {propertyMaintenanceRecords.length > 0 && (
                            <li>Consider increasing property insurance coverage to match the updated valuation</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Comparison Tab */}
                  <TabsContent value="comparison" className="pt-6 px-6">
                    <h4 className="text-base font-medium text-gray-900 mb-4">Valuation Method Comparison</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Valuation Method</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="text-right">Difference from Equitystek</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Comparable Sales</TableCell>
                            <TableCell className="text-sm text-gray-500">Based on similar property sales in your area</TableCell>
                            <TableCell className="text-right">{formatCurrency(valuation?.comparableSalesValue)}</TableCell>
                            <TableCell className="text-right">
                              {valuation && (
                                <span className={valuation.equitystekValue > valuation.comparableSalesValue ? "text-green-600" : "text-red-600"}>
                                  {valuation.equitystekValue > valuation.comparableSalesValue ? "+" : ""}
                                  {formatCurrency(valuation.equitystekValue - valuation.comparableSalesValue)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Per Square Foot</TableCell>
                            <TableCell className="text-sm text-gray-500">Value calculated on a per-square-foot basis</TableCell>
                            <TableCell className="text-right">{formatCurrency(valuation?.perSquareFootValue)}</TableCell>
                            <TableCell className="text-right">
                              {valuation && (
                                <span className={valuation.equitystekValue > valuation.perSquareFootValue ? "text-green-600" : "text-red-600"}>
                                  {valuation.equitystekValue > valuation.perSquareFootValue ? "+" : ""}
                                  {formatCurrency(valuation.equitystekValue - valuation.perSquareFootValue)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Automated Model</TableCell>
                            <TableCell className="text-sm text-gray-500">Algorithmic valuation based on market data</TableCell>
                            <TableCell className="text-right">{formatCurrency(valuation?.automatedModelValue)}</TableCell>
                            <TableCell className="text-right">
                              {valuation && (
                                <span className={valuation.equitystekValue > valuation.automatedModelValue ? "text-green-600" : "text-red-600"}>
                                  {valuation.equitystekValue > valuation.automatedModelValue ? "+" : ""}
                                  {formatCurrency(valuation.equitystekValue - valuation.automatedModelValue)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Cost Approach</TableCell>
                            <TableCell className="text-sm text-gray-500">Land value + building costs - depreciation</TableCell>
                            <TableCell className="text-right">{formatCurrency(valuation?.costApproachValue)}</TableCell>
                            <TableCell className="text-right">
                              {valuation && (
                                <span className={valuation.equitystekValue > valuation.costApproachValue ? "text-green-600" : "text-red-600"}>
                                  {valuation.equitystekValue > valuation.costApproachValue ? "+" : ""}
                                  {formatCurrency(valuation.equitystekValue - valuation.costApproachValue)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Income Approach</TableCell>
                            <TableCell className="text-sm text-gray-500">Based on potential rental income (cap rate)</TableCell>
                            <TableCell className="text-right">{formatCurrency(valuation?.incomeApproachValue)}</TableCell>
                            <TableCell className="text-right">
                              {valuation && (
                                <span className={valuation.equitystekValue > valuation.incomeApproachValue ? "text-green-600" : "text-red-600"}>
                                  {valuation.equitystekValue > valuation.incomeApproachValue ? "+" : ""}
                                  {formatCurrency(valuation.equitystekValue - valuation.incomeApproachValue)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow className="bg-primary-50 font-medium">
                            <TableCell>Equitystek Valuation</TableCell>
                            <TableCell className="text-sm text-primary-600">Comprehensive valuation with maintenance history</TableCell>
                            <TableCell className="text-right text-primary-600">{formatCurrency(valuation?.equitystekValue)}</TableCell>
                            <TableCell className="text-right">-</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="text-base font-medium text-gray-900 mb-4">Visual Comparison</h4>
                      <div className="h-64 bg-gray-50 rounded-lg p-6 border border-gray-200 flex items-end justify-around">
                        <ValueComparisonChart 
                          properties={[selectedProperty]} 
                          maintenanceRecords={propertyMaintenanceRecords}
                          showComparisons={true}
                          showLegend={true}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <Button>
                        <Download className="mr-2 h-4 w-4" /> Download Comparison Report
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
