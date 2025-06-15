import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { Edit, Trash2, Drill } from "lucide-react";
import { getImageByIndex, propertyImages } from "@/assets/stock-photos";
import { useState } from "react";
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

interface PropertyCardProps {
  property: Property;
  index: number;
  onEdit?: (property: Property) => void;
  onAddMaintenance?: (property: Property) => void;
}

export function PropertyCard({ property, index, onEdit, onAddMaintenance }: PropertyCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Format the property type for display
  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/properties/${property.id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row">
        {/* Property image */}
        <div className="h-48 sm:h-auto sm:w-40 sm:min-w-[10rem] bg-gray-200 overflow-hidden">
          <img
            src={property.imageUrl || getImageByIndex(propertyImages, index)}
            alt={`${property.address} property`}
            className="h-full w-full object-cover"
            onError={(e) => {
              // If image fails to load, use a fallback
              e.currentTarget.src = getImageByIndex(propertyImages, index);
            }}
          />
        </div>

        {/* Property details */}
        <CardContent className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-primary-600 truncate">
                {property.address}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {property.city}, {property.state} {property.zipCode}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {formatPropertyType(property.propertyType)} • {property.bedrooms} bed • {property.bathrooms} bath • {property.squareFeet.toLocaleString()} sqft
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {property.yearBuilt && `Built in ${property.yearBuilt}`} 
                {property.lotSize && ` • ${property.lotSize} acres`}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">${property.valuations?.at(0)?.equitystekValue?.toLocaleString() || "N/A"}</span>
              <p className="mt-1 text-xs text-gray-500">
                Last updated: {new Date(property.updatedAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary-600 hover:text-primary-900"
                  onClick={() => onAddMaintenance?.(property)}
                >
                  <Drill className="h-4 w-4" />
                  <span className="sr-only">Add maintenance record</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-600 hover:text-primary-900"
                  onClick={() => onEdit?.(property)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit property</span>
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete property</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the property and all associated maintenance records and valuations. This action cannot be undone.
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
      </div>
    </Card>
  );
}
