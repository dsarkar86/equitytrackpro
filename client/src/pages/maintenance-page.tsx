import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Property, MaintenanceRecord } from "@shared/schema";
import { MaintenanceRecordCard } from "@/components/ui/maintenance-record";
import { MaintenanceForm } from "@/components/forms/maintenance-form";
import { Button } from "@/components/ui/button";
import { Plus, Search, Drill, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | "all">("all");
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Fetch properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Fetch maintenance records
  const { data: maintenanceRecords = [], isLoading: isLoadingMaintenance } = useQuery<MaintenanceRecord[]>({
    queryKey: ["/api/maintenance"],
  });

  const handleAddMaintenance = () => {
    setSelectedRecord(null);
    setMaintenanceDialogOpen(true);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setMaintenanceDialogOpen(true);
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Get all unique categories from records
  const allCategories = Array.from(new Set(maintenanceRecords.map(record => record.category)));

  // Filter records based on search, property, and categories
  const filteredRecords = maintenanceRecords.filter(record => {
    const searchLower = search.toLowerCase();
    const matchesSearch = record.title.toLowerCase().includes(searchLower) || 
                          record.description?.toLowerCase().includes(searchLower) ||
                          record.contractor?.toLowerCase().includes(searchLower);
    
    const matchesProperty = selectedPropertyId === "all" || record.propertyId === selectedPropertyId;
    
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(record.category);
    
    return matchesSearch && matchesProperty && matchesCategory;
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
      case "oldest":
        return new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime();
      case "cost-high":
        return b.cost - a.cost;
      case "cost-low":
        return a.cost - b.cost;
      default:
        return 0;
    }
  });

  // Format category for display
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const isLoading = isLoadingProperties || isLoadingMaintenance;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">Maintenance Records</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage all maintenance and renovation work on your properties.
              </p>
            </div>
            <Button onClick={handleAddMaintenance}>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </div>

          {/* Search, Filters, and Sort */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search records..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-48">
              <Select 
                value={selectedPropertyId === "all" ? "all" : selectedPropertyId.toString()} 
                onValueChange={(value) => setSelectedPropertyId(value === "all" ? "all" : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id.toString()}>
                      {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="cost-high">Highest cost</SelectItem>
                  <SelectItem value="cost-low">Lowest cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter by Category</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`}>
                          {formatCategory(category)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCategories([])}
                    >
                      Clear
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setFilterMenuOpen(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filters */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {formatCategory(category)}
                  <button 
                    className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                    onClick={() => toggleCategory(category)}
                  >
                    ✕
                  </button>
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="text-xs h-6"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Maintenance Records List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="mt-4 text-gray-500">Loading maintenance records...</p>
              </div>
            ) : sortedRecords.length === 0 ? (
              <Card className="p-8 text-center">
                {search || selectedPropertyId !== "all" || selectedCategories.length > 0 ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching records</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters.</p>
                    <Button 
                      onClick={() => {
                        setSearch("");
                        setSelectedPropertyId("all");
                        setSelectedCategories([]);
                      }} 
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <Drill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance Records Found</h3>
                    <p className="text-gray-500 mb-4">You haven't added any maintenance records yet.</p>
                    <Button onClick={handleAddMaintenance}>
                      <Plus className="mr-2 h-4 w-4" /> Add Your First Record
                    </Button>
                  </>
                )}
              </Card>
            ) : (
              <>
                {sortedRecords.map((record) => (
                  <MaintenanceRecordCard 
                    key={record.id} 
                    record={record}
                    properties={properties}
                    onEdit={handleEditMaintenance}
                  />
                ))}
                <div className="flex justify-center py-4">
                  <Button onClick={handleAddMaintenance}>
                    <Plus className="mr-2 h-4 w-4" /> Add Another Record
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Maintenance Record Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? "Edit Maintenance Record" : "Add Maintenance Record"}
            </DialogTitle>
          </DialogHeader>
          <MaintenanceForm 
            record={selectedRecord || undefined}
            properties={properties}
            onSuccess={() => setMaintenanceDialogOpen(false)}
            onCancel={() => setMaintenanceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
