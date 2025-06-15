import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Property,
  MaintenanceRecord,
  Valuation,
} from "@shared/schema";
import EnhancedMaintenanceRecord from "@/components/ui/enhanced-maintenance-record";
import MaintenanceForm from "@/components/forms/maintenance-form";
import { getRandomImage } from "@/assets/stock-photos";
import { formatCurrency } from "@/lib/utils";
import { 
  Building, 
  DollarSign, 
  PlusCircle, 
  FileText, 
  Calendar, 
  MapPin, 
  Home 
} from "lucide-react";

export default function PropertyDetailPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const propertyId = parseInt(id);
  const { toast } = useToast();
  const [isMaintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !isNaN(propertyId)
  });

  const { data: maintenanceRecords = [], isLoading: maintenanceLoading } = useQuery<MaintenanceRecord[]>({
    queryKey: [`/api/properties/${propertyId}/maintenance`],
    enabled: !isNaN(propertyId)
  });

  const { data: valuation, isLoading: valuationLoading } = useQuery<Valuation | null>({
    queryKey: [`/api/properties/${propertyId}/valuation`],
    enabled: !isNaN(propertyId)
  });

  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (recordId: number) => {
      await apiRequest("DELETE", `/api/maintenance/${recordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/maintenance`] });
      toast({
        title: "Maintenance record deleted",
        description: "The maintenance record has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete maintenance record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  function handleDeleteMaintenance(recordId: number) {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      deleteMaintenanceMutation.mutate(recordId);
    }
  }

  function handleEditMaintenance(record: MaintenanceRecord) {
    setEditingRecord(record);
    setMaintenanceFormOpen(true);
  }

  function handleMaintenanceFormClose() {
    setMaintenanceFormOpen(false);
    setEditingRecord(null);
  }

  function handleMaintenanceFormSuccess() {
    setMaintenanceFormOpen(false);
    setEditingRecord(null);
    queryClient.invalidateQueries({ queryKey: [`/api/properties/${propertyId}/maintenance`] });
  }

  if (propertyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Property Not Found</CardTitle>
            <CardDescription>The property you're looking for doesn't exist or you don't have permission to view it.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/properties")}>Back to Properties</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const propertyImage = property.imageUrl || getRandomImage(['house1.jpg', 'house2.jpg', 'house3.jpg', 'apartment1.jpg']);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Property Overview */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden mb-6">
            <div className="h-48 md:h-64 overflow-hidden">
              <img
                src={propertyImage}
                alt={property.address}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{property.address}</CardTitle>
                  <CardDescription>
                    {property.city}, {property.state} {property.zipCode}
                  </CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => setLocation(`/properties/${propertyId}/edit`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                  <span className="sr-only">Edit</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm">
                    <span className="font-medium">Type:</span> {property.propertyType.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm">
                    <span className="font-medium">Location:</span> {property.city}, {property.state}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm">
                    <span className="font-medium">Purchase Date:</span> {new Date(property.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-sm">
                    <span className="font-medium">Purchase Price:</span> {formatCurrency(property.purchasePrice)}
                  </span>
                </div>
              </div>
              {property.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{property.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="maintenance" className="mb-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Maintenance Records</h2>
                <Button onClick={() => {
                  setEditingRecord(null);
                  setMaintenanceFormOpen(true);
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Record
                </Button>
              </div>

              {maintenanceLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : maintenanceRecords.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">No Maintenance Records</CardTitle>
                    <CardDescription>
                      You haven't added any maintenance records for this property yet.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" onClick={() => {
                      setEditingRecord(null);
                      setMaintenanceFormOpen(true);
                    }}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Record
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="space-y-4">
                  {maintenanceRecords.map((record) => (
                    <EnhancedMaintenanceRecord
                      key={record.id}
                      record={record}
                      onDelete={handleDeleteMaintenance}
                      onEdit={handleEditMaintenance}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Valuation Tab */}
            <TabsContent value="valuation">
              <Card>
                <CardHeader>
                  <CardTitle>Property Valuation</CardTitle>
                  <CardDescription>
                    Current estimated value and investment metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {valuationLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : !valuation ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No valuation data available for this property.</p>
                      <Button variant="outline">Request Valuation Update</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">Purchase Price</p>
                          <p className="text-2xl font-bold">{formatCurrency(property.purchasePrice)}</p>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">Current Value</p>
                          <p className="text-2xl font-bold">{formatCurrency(valuation.currentValue)}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Value Change</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(valuation.currentValue - property.purchasePrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Percentage</p>
                          <p className="text-lg font-semibold">
                            {((valuation.currentValue - property.purchasePrice) / property.purchasePrice * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="text-lg font-semibold">
                            {new Date(valuation.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Valuation Notes</h3>
                        <p className="text-sm text-muted-foreground">{valuation.notes || 'No notes available.'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        View Valuation History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Valuation History</DialogTitle>
                        <DialogDescription>
                          Historical property value changes over time
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        {!valuation ? (
                          <p className="text-center text-muted-foreground">No valuation history available</p>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium">{formatCurrency(valuation.currentValue)}</p>
                                <p className="text-sm text-muted-foreground">Current Value</p>
                              </div>
                              <p className="text-sm">{new Date(valuation.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                              <div>
                                <p className="font-medium">{formatCurrency(property.purchasePrice)}</p>
                                <p className="text-sm text-muted-foreground">Purchase Price</p>
                              </div>
                              <p className="text-sm">{new Date(property.purchaseDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Property Documents</CardTitle>
                  <CardDescription>
                    Store and manage all documents related to this property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 mb-2" />
                      <span className="font-medium">Upload Documents</span>
                      <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, JPEG, PNG</span>
                    </Button>
                    <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                      <Home className="h-8 w-8 mb-2" />
                      <span className="font-medium">Add Floor Plans</span>
                      <span className="text-xs text-muted-foreground mt-1">PDF, JPEG, PNG</span>
                    </Button>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-sm font-medium mb-4">Recent Documents</h3>
                    <div className="bg-muted/30 p-8 rounded-lg flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No documents uploaded yet</p>
                      <Button variant="link" size="sm" className="mt-2">
                        Upload your first document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setEditingRecord(null);
                setMaintenanceFormOpen(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Maintenance Record
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                Edit Property Details
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Price</p>
                  <p className="text-lg font-semibold">{formatCurrency(property.purchasePrice)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(valuation?.currentValue || property.purchasePrice)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Total Maintenance Cost</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(maintenanceRecords.reduce((total, record) => total + (record.cost || 0), 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pending</span>
                    <span className="font-medium">
                      {maintenanceRecords.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Scheduled</span>
                    <span className="font-medium">
                      {maintenanceRecords.filter(r => r.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-medium">
                      {maintenanceRecords.filter(r => r.status === 'completed').length}
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Records</p>
                  <p className="text-xl font-bold">{maintenanceRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maintenance Form Dialog */}
      <Dialog open={isMaintenanceFormOpen} onOpenChange={setMaintenanceFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}</DialogTitle>
            <DialogDescription>
              {editingRecord 
                ? 'Update the maintenance record details below.'
                : 'Fill out the form below to add a new maintenance record.'}
            </DialogDescription>
          </DialogHeader>
          <MaintenanceForm
            propertyId={propertyId}
            record={editingRecord}
            onSuccess={handleMaintenanceFormSuccess}
            onCancel={handleMaintenanceFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}