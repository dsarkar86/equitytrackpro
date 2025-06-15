import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaintenanceRecord, Property } from "@shared/schema";
import { Calendar, Edit, File, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface MaintenanceRecordProps {
  record: MaintenanceRecord;
  property?: Property;
  properties?: Property[];
  onEdit?: (record: MaintenanceRecord) => void;
}

export function MaintenanceRecordCard({ 
  record, 
  property, 
  properties = [],
  onEdit
}: MaintenanceRecordProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get property name if property is not provided
  const getPropertyName = () => {
    if (property) return `${property.address}, ${property.city}`;
    
    const foundProperty = properties.find(p => p.id === record.propertyId);
    return foundProperty 
      ? `${foundProperty.address}, ${foundProperty.city}`
      : `Property ID: ${record.propertyId}`;
  };

  // Format the completion date
  const formattedDate = new Date(record.completedDate).toLocaleDateString();
  
  // Format the category for display
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Delete maintenance record mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/maintenance/${record.id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({
        title: "Record deleted",
        description: "The maintenance record has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Get background color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      roof: 'bg-red-100 text-red-800',
      plumbing: 'bg-blue-100 text-blue-800',
      electrical: 'bg-yellow-100 text-yellow-800',
      hvac: 'bg-green-100 text-green-800',
      appliances: 'bg-purple-100 text-purple-800',
      flooring: 'bg-amber-100 text-amber-800',
      kitchen: 'bg-orange-100 text-orange-800',
      bathroom: 'bg-cyan-100 text-cyan-800',
      exterior: 'bg-lime-100 text-lime-800',
      landscaping: 'bg-emerald-100 text-emerald-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-primary-600">{record.title}</h3>
              <Badge variant="outline" className={getCategoryColor(record.category)}>
                {formatCategory(record.category)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">{getPropertyName()}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
              {formattedDate}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-700">{record.description}</p>
            </div>
            
            {record.contractor && (
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Contractor:</span> {record.contractor}
              </p>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{formatCurrency(record.cost)}</span>
            {record.estimatedValueAdded && (
              <span className="mt-1 text-sm text-green-600">
                Value Added: {formatCurrency(record.estimatedValueAdded)}
              </span>
            )}
            
            <div className="mt-4 flex">
              {record.documentsUrls && record.documentsUrls.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary-600 hover:text-primary-900"
                >
                  <File className="h-4 w-4" />
                  <span className="sr-only">View documents</span>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-primary-600 hover:text-primary-900"
                onClick={() => onEdit?.(record)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit record</span>
              </Button>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete record</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this maintenance record. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
