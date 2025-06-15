import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import {
  Container,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DataComplianceBadge } from "@/components/ui/data-compliance-badge";

// Define the form schema
const workRecordSchema = z.object({
  propertyId: z.string({
    required_error: "Please select a property",
  }),
  workType: z.string({
    required_error: "Please select the type of work",
  }),
  workDescription: z.string().min(10, {
    message: "Work description must be at least 10 characters",
  }),
  materials: z.string().optional(),
  completionDate: z.string({
    required_error: "Please enter the completion date",
  }),
  cost: z.string().optional(),
  note: z.string().optional(),
});

type WorkRecordFormValues = z.infer<typeof workRecordSchema>;

interface Property {
  id: number;
  name: string;
  address: string;
}

export default function TradespersonWorkRecord() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Check if user is a tradesperson
  useEffect(() => {
    if (user && user.role !== "tradesperson") {
      toast({
        title: "Access Denied",
        description: "Only tradespersons can add work records",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  // Fetch properties query
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: () => apiRequest("GET", "/api/properties").then(res => res.json()),
    enabled: user?.role === "tradesperson",
  });

  // Define form
  const form = useForm<WorkRecordFormValues>({
    resolver: zodResolver(workRecordSchema),
    defaultValues: {
      propertyId: "",
      workType: "",
      workDescription: "",
      materials: "",
      completionDate: new Date().toISOString().split("T")[0],
      cost: "",
      note: "",
    },
  });

  // Handle image selection
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
      
      // Create image previews
      const newImageUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    // Remove the image and its preview
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: WorkRecordFormValues) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      // Add images
      images.forEach(image => {
        formData.append("images", image);
      });
      
      // Submit the form
      const response = await apiRequest("POST", "/api/tradesperson/work-records", formData, {
        isFormData: true
      });
      
      return response.json();
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Work record submitted",
        description: "Your work record has been successfully submitted",
      });
      
      // Invalidate property query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/properties`] });
      
      // Redirect to property detail page
      const propertyId = form.getValues("propertyId");
      navigate(`/properties/${propertyId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit work record",
        description: error.message || "An error occurred while submitting the work record",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: WorkRecordFormValues) => {
    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image of the completed work",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(data);
  };

  return (
    <Container className="py-10 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Record Completed Work</h1>
        <p className="text-muted-foreground">
          Document the maintenance or improvements you've completed for a property
        </p>
      </div>
      
      <DataComplianceBadge />
      
      <Card>
        <CardHeader>
          <CardTitle>Work Details</CardTitle>
          <CardDescription>
            Fill in the details of the work you've completed. All information will be
            attached to the property's maintenance history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Property Selection */}
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={propertiesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name} - {property.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Work Type */}
              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Work</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="carpentry">Carpentry</SelectItem>
                        <SelectItem value="painting">Painting</SelectItem>
                        <SelectItem value="hvac">HVAC</SelectItem>
                        <SelectItem value="roofing">Roofing</SelectItem>
                        <SelectItem value="landscaping">Landscaping</SelectItem>
                        <SelectItem value="flooring">Flooring</SelectItem>
                        <SelectItem value="general_maintenance">General Maintenance</SelectItem>
                        <SelectItem value="renovation">Renovation</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="other">Other (specify in description)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Work Description */}
              <FormField
                control={form.control}
                name="workDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Work</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the work completed in detail..." 
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Materials Used */}
              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials Used (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List materials used for the job..." 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Completion Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Cost */}
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about the work..." 
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              {/* Image Upload Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Work Images</h3>
                  <Badge variant={images.length > 0 ? "outline" : "destructive"}>
                    {images.length} Image{images.length !== 1 ? "s" : ""} (Required)
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border">
                      <img 
                        src={url} 
                        alt={`Work preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleImageSelect}
                    className="w-24 h-24 border-2 border-dashed border-muted-foreground rounded-md flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <span className="text-2xl">+</span>
                    <span className="text-xs">Add Image</span>
                  </button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                <p className="text-sm text-muted-foreground">
                  Upload clear images of the completed work. These will be attached to the property's
                  maintenance history as documentation of the work performed.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline" type="button" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Work Record"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}