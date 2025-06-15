import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { DashboardStats } from "@/components/ui/dashboard-stats";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRecordCard } from "@/components/ui/maintenance-record";
import { PropertyCard } from "@/components/ui/property-card";
import { ValueComparisonChart } from "@/components/ui/value-comparison-chart";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { PropertyForm } from "@/components/forms/property-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Calendar, Home, Plus, Drill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property, MaintenanceRecord } from "@shared/schema";
import { format } from "date-fns";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading: isLoadingMaintenance } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  // We don't have a direct endpoint for valuations, so we'll simulate this with empty data
  const valuations = properties.map(property => ({
    propertyId: property.id,
    equitystekValue: 0, // Will be calculated in a real implementation
    id: 0,
    comparableSalesValue: 0,
    perSquareFootValue: 0,
    automatedModelValue: 0,
    costApproachValue: 0,
    incomeApproachValue: 0,
    maintenanceAddedValue: 0,
    createdAt: new Date(),
  }));

  const handleAddProperty = () => {
    setSelectedProperty(null);
    setPropertyDialogOpen(true);
  };

  const handleAddMaintenance = (property?: Property) => {
    setSelectedProperty(property || null);
    setMaintenanceDialogOpen(true);
  };

  const isLoading = isLoadingProperties || isLoadingMaintenance;

  // Calculate total portfolio value - in a real implementation, this would come from API
  const totalPortfolioValue = properties.reduce((sum, property) => {
    // Simulate property value based on square footage, beds, and baths
    const baseValue = property.squareFeet * 200; // $200 per square foot
    const bedroomValue = (property.bedrooms || 0) * 15000; // $15k per bedroom
    const bathroomValue = (property.bathrooms || 0) * 10000; // $10k per bathroom
    return sum + baseValue + bedroomValue + bathroomValue;
  }, 0);

  // Get recent activity from maintenance records
  const recentActivity = [...maintenanceRecords]
    .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Dashboard header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's an overview of your property portfolio.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button 
                onClick={handleAddProperty}
                className="ml-3 inline-flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Property
              </Button>
            </div>
          </div>

          {/* Dashboard tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full mb-6">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground space-x-8 w-auto border-b">
              <TabsTrigger 
                value="overview" 
                className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="properties" 
                className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent"
              >
                Properties
              </TabsTrigger>
              <TabsTrigger 
                value="maintenance" 
                className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent"
              >
                Maintenance Records
              </TabsTrigger>
              <TabsTrigger 
                value="valuation" 
                className="inline-flex items-center justify-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all data-[state=active]:border-primary data-[state=active]:text-primary focus:bg-transparent"
              >
                Valuation
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-8">
              <DashboardStats 
                properties={properties} 
                maintenanceRecords={maintenanceRecords} 
                valuations={valuations}
                isLoading={isLoading}
              />

              {/* Recent Activity */}
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h2>
                <Card>
                  <ul className="divide-y divide-gray-200">
                    {recentActivity.length === 0 ? (
                      <li className="px-4 py-4 sm:px-6">
                        <p className="text-sm text-gray-500">No recent activity found.</p>
                      </li>
                    ) : (
                      recentActivity.map((record) => {
                        const property = properties.find(p => p.id === record.propertyId);
                        return (
                          <li key={record.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-primary-600 truncate">{record.title}</p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  ${record.cost.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <Home className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  {property ? `${property.address}, ${property.city}` : `Property #${record.propertyId}`}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                <p>{format(new Date(record.completedDate), 'MMMM d, yyyy')}</p>
                              </div>
                            </div>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </Card>
              </div>

              {/* Value Comparison Chart */}
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Portfolio Valuation Comparison</h2>
                <Card className="p-6">
                  <ValueComparisonChart 
                    properties={properties} 
                    maintenanceRecords={maintenanceRecords}
                  />
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Equitystek's valuation includes maintenance history, showing a potential increase in value compared to traditional methods.</p>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Properties Tab Content */}
            <TabsContent value="properties" className="space-y-4">
              {isLoadingProperties ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                  <p className="mt-4 text-gray-500">Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <Card className="p-8 text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
                  <Button onClick={handleAddProperty}>
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Property
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {properties.map((property, index) => (
                    <PropertyCard 
                      key={property.id} 
                      property={property} 
                      index={index}
                      onEdit={(p) => {
                        setSelectedProperty(p);
                        setPropertyDialogOpen(true);
                      }}
                      onAddMaintenance={handleAddMaintenance}
                    />
                  ))}
                  <div className="flex justify-center py-4">
                    <Button onClick={handleAddProperty}>
                      <Plus className="mr-2 h-4 w-4" /> Add Another Property
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Maintenance Records Tab Content */}
            <TabsContent value="maintenance" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Maintenance Records</h2>
                <Button onClick={() => handleAddMaintenance()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Maintenance Record
                </Button>
              </div>

              {isLoadingMaintenance ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                  <p className="mt-4 text-gray-500">Loading maintenance records...</p>
                </div>
              ) : maintenanceRecords.length === 0 ? (
                <Card className="p-8 text-center">
                  <Drill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance Records Found</h3>
                  <p className="text-gray-500 mb-4">You haven't added any maintenance records yet.</p>
                  <Button onClick={() => handleAddMaintenance()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Your First Record
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {maintenanceRecords.map((record) => (
                    <MaintenanceRecordCard 
                      key={record.id} 
                      record={record}
                      properties={properties}
                      onEdit={(r) => {
                        const property = properties.find(p => p.id === r.propertyId);
                        setSelectedProperty(property || null);
                        setMaintenanceDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Valuation Tab Content */}
            <TabsContent value="valuation" className="space-y-6">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Property Portfolio Valuation</h2>
                <Card className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Equitystek calculates property values based on standard methods plus the value added through maintenance and improvements.
                  </p>
                  
                  <ValueComparisonChart 
                    properties={properties} 
                    maintenanceRecords={maintenanceRecords}
                    showLegend={true}
                  />
                </Card>
              </div>
              
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">View Detailed Property Valuation</h2>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                      Select a property to view its detailed valuation breakdown.
                    </p>
                    
                    {properties.length === 0 ? (
                      <div className="text-center py-8">
                        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                        <p className="text-gray-500 mb-4">You need to add properties to view valuations.</p>
                        <Button onClick={handleAddProperty}>
                          <Plus className="mr-2 h-4 w-4" /> Add Your First Property
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {properties.map((property) => (
                          <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className="h-32 bg-gray-200 overflow-hidden">
                              <img
                                src={property.imageUrl || `https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&h=200&q=80`}
                                alt={`${property.address} property`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <CardContent className="p-4">
                              <h3 className="text-lg font-medium text-primary-600 truncate">{property.address}</h3>
                              <p className="text-sm text-gray-500">{property.city}, {property.state}</p>
                              <Button 
                                className="w-full mt-4" 
                                variant="outline"
                                onClick={() => window.location.href = `/valuation?propertyId=${property.id}`}
                              >
                                View Valuation
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add/Edit Property Dialog */}
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
          </DialogHeader>
          <PropertyForm 
            property={selectedProperty || undefined}
            onSuccess={() => setPropertyDialogOpen(false)}
            onCancel={() => setPropertyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Maintenance Record Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProperty 
                ? `Add Maintenance Record for ${selectedProperty.address}` 
                : "Add Maintenance Record"}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceForm 
            propertyId={selectedProperty?.id}
            properties={properties}
            onSuccess={() => setMaintenanceDialogOpen(false)}
            onCancel={() => setMaintenanceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
