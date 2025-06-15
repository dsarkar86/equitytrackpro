import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DataComplianceBadge } from "@/components/ui/data-compliance-badge";
import WorkRecordForm from "@/components/tradesperson/WorkRecordForm";

interface WorkRecord {
  id: string;
  propertyId: number;
  propertyName: string;
  workType: string;
  workDescription: string;
  completionDate: string;
  cost?: number;
  images: {
    fileName: string;
    url: string;
  }[];
}

export default function TradespersonDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is a tradesperson
  useEffect(() => {
    if (user && user.role !== "tradesperson") {
      toast({
        title: "Access Denied",
        description: "Only tradespersons can access this dashboard",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, navigate, toast]);

  // Fetch tradesperson's work records
  const { data: workRecords = [], isLoading } = useQuery<WorkRecord[]>({
    queryKey: ["/api/tradesperson/work-records"],
    queryFn: () => apiRequest("GET", "/api/tradesperson/work-records").then(res => res.json()),
    enabled: !!user && user.role === "tradesperson",
  });

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tradesperson Dashboard</h1>
        <p className="text-muted-foreground">
          Document your work and contribute to property maintenance records
        </p>
      </div>

      <DataComplianceBadge className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column - Work Record Form */}
        <div className="md:col-span-7 space-y-6">
          <h2 className="text-xl font-semibold">Record New Work</h2>
          <WorkRecordForm />
        </div>

        {/* Right column - Recent Work Records */}
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-xl font-semibold">Your Recent Work Records</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : workRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any work records yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use the form to document your completed work
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {record.workType.charAt(0).toUpperCase() + record.workType.slice(1)} Work
                    </CardTitle>
                    <CardDescription>
                      {record.propertyName} • {new Date(record.completionDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-2 mb-2">{record.workDescription}</p>
                    
                    {record.cost && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Cost: ${record.cost.toFixed(2)}
                      </p>
                    )}
                    
                    {record.images && record.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {record.images.map((image, index) => (
                          <div 
                            key={index} 
                            className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border"
                          >
                            <img 
                              src={image.url} 
                              alt={`Work image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => navigate(`/properties/${record.propertyId}`)}
                    >
                      View Property
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}