import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataComplianceBadge } from "@/components/ui/data-compliance-badge";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function DashboardPage() {
  const [_, setLocation] = useLocation();
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const handleSignOut = () => {
    // Simple redirect to auth page
    setLocation("/auth");
    
    // Show notification
    toast({
      title: "Signed out",
      description: "You have been logged out.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Equitystek Dashboard</h1>
            <DataComplianceBadge />
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setLocation("/subscription")}>
              Manage Subscription
            </Button>
            <Button variant="outline" onClick={handleSignOut} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <p className="text-gray-500 text-center">Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-primary mb-2">12</div>
              <p className="text-gray-500 text-center">Maintenance Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-primary mb-2">$1.2M</div>
              <p className="text-gray-500 text-center">Portfolio Value</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Plan:</p>
                <p className="font-medium">Pro Plan</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status:</p>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  Active
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Next Billing:</p>
                <p className="font-medium">June 15, 2023</p>
              </div>
              <Button onClick={() => setLocation("/subscription")}>
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Properties</h2>
                <DataComplianceBadge />
              </div>
              <p className="text-gray-500 mb-4">
                You can manage your properties and view their details including maintenance records and valuation.
                All property data is securely stored within Australia.
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation("/properties")}
              >
                View Properties
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Maintenance</h2>
                <DataComplianceBadge />
              </div>
              <p className="text-gray-500 mb-4">
                Track repairs, renovations, and improvements to increase your property's value.
                All maintenance records comply with Australian data regulations.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setLocation("/maintenance")}
              >
                View Maintenance Records
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}