import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Property, MaintenanceRecord, SubscriptionPlan } from "@shared/schema";
import { PropertyCard } from "@/components/ui/property-card";
import { PropertyForm } from "@/components/forms/property-form";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { Button } from "@/components/ui/button";
import { Plus, Search, Home, AlertCircle, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [subscriptionChange, setSubscriptionChange] = useState<{
    propertyCount: number;
    currentPrice: number;
    estimatedPrice: number;
    priceDifference: number;
  } | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });
  
  // Fetch subscription plans
  const { data: subscriptionPlans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });
  
  // Calculate price estimate when adding a property
  const handleGetPriceEstimate = async (propertyCount: number) => {
    try {
      const res = await apiRequest("GET", `/api/subscription/price-estimate?propertyCount=${propertyCount}`);
      const data = await res.json();
      setSubscriptionChange(data);
      
      // Only show the pricing dialog if there's a price difference
      if (data.priceDifference > 0) {
        setPricingDialogOpen(true);
      }
      
      return data;
    } catch (error) {
      console.error("Failed to get price estimate:", error);
      return null;
    }
  };

  const handleAddProperty = async () => {
    // Check if adding a property will change the subscription price
    if (user) {
      const newPropertyCount = properties.length + 1;
      await handleGetPriceEstimate(newPropertyCount);
    }
    
    setSelectedProperty(null);
    setPropertyDialogOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setPropertyDialogOpen(true);
  };

  const handleAddMaintenance = (property: Property) => {
    setSelectedProperty(property);
    setMaintenanceDialogOpen(true);
  };
  
  // Handle successful property creation, update or deletion
  const handlePropertyChange = (action: 'add' | 'update' | 'delete', property?: Property) => {
    // Show toast with subscription update if the price changed
    if (subscriptionChange && subscriptionChange.priceDifference > 0) {
      toast({
        title: "Subscription Updated",
        description: `Your monthly subscription has been adjusted to $${subscriptionChange.estimatedPrice.toFixed(2)} based on ${subscriptionChange.propertyCount} properties.`,
        variant: "default",
      });
      
      // Reset subscription change data
      setSubscriptionChange(null);
    }
    
    // Additional success message
    const message = action === 'add' 
      ? "Property added successfully" 
      : "Property deleted successfully";
      
    toast({
      title: "Success",
      description: message,
    });
  };

  // Filter properties based on search
  const filteredProperties = properties.filter(property => {
    const searchLower = search.toLowerCase();
    return (
      property.address.toLowerCase().includes(searchLower) ||
      property.city.toLowerCase().includes(searchLower) ||
      property.state.toLowerCase().includes(searchLower) ||
      property.zipCode.toLowerCase().includes(searchLower)
    );
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "address-asc":
        return a.address.localeCompare(b.address);
      case "address-desc":
        return b.address.localeCompare(a.address);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">Property Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all your properties and track their maintenance history.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Button onClick={handleAddProperty}>
                <Plus className="mr-2 h-4 w-4" /> Add Property
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search properties..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="address-asc">Address (A-Z)</SelectItem>
                  <SelectItem value="address-desc">Address (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property List */}
          <div className="space-y-4">
            {isLoadingProperties ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-gray-500">Loading properties...</p>
              </div>
            ) : sortedProperties.length === 0 ? (
              <Card className="p-8 text-center">
                {search ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching properties</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
                    <Button onClick={() => setSearch("")} variant="outline">
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                    <p className="text-gray-500 mb-4">You haven't added any properties yet.</p>
                    <Button onClick={handleAddProperty}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Property
                    </Button>
                  </>
                )}
              </Card>
            ) : (
              sortedProperties.map((property, index) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  index={index}
                  onEdit={handleEditProperty}
                  onAddMaintenance={handleAddMaintenance}
                />
              ))
            )}
            
            {/* Add More Button (only show if there are properties) */}
            {sortedProperties.length > 0 && (
              <div className="flex justify-center py-4">
                <Button onClick={handleAddProperty}>
                  <Plus className="mr-2 h-4 w-4" /> Add Another Property
                </Button>
              </div>
            )}
          </div>
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
            onPropertyChange={handlePropertyChange}
          />
        </DialogContent>
      </Dialog>

      {/* Add Maintenance Record Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProperty && `Add Maintenance Record for ${selectedProperty.address}`}
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
      
      {/* Subscription Pricing Change Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertCircle className="mr-2 h-5 w-5" /> Subscription Price Change
            </DialogTitle>
            <DialogDescription>
              Adding this property will change your subscription pricing.
            </DialogDescription>
          </DialogHeader>
          
          {subscriptionChange && (
            <div className="space-y-4 py-2">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Current monthly price:</span>
                    <span className="font-medium">${subscriptionChange.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">New monthly price:</span>
                    <span className="font-medium text-primary">${subscriptionChange.estimatedPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium">Price difference:</span>
                    <span className="font-medium text-amber-600">+${subscriptionChange.priceDifference.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-sm text-muted-foreground">
                <p>Your subscription will be automatically adjusted based on the number of properties you manage.</p>
                <p className="mt-2">The new price will be reflected in your next billing cycle.</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPricingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setPricingDialogOpen(false);
                setPropertyDialogOpen(true);
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" /> Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
