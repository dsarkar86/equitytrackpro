import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt } from "@shared/schema";
import { Loader2, FileText, Download, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function ReceiptHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: receipts, isLoading, error } = useQuery<Receipt[]>({
    queryKey: ["/api/receipts"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">Error loading receipts: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const handleDownloadPDF = (receipt: Receipt) => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Receipt Downloaded",
      description: `Receipt ${receipt.receiptNumber} has been downloaded.`,
    });
  };

  const viewReceiptDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Receipt History</h1>
        <p className="text-gray-500 mt-2">
          View and download all your payment receipts
        </p>
      </div>

      {receipts && receipts.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Receipts</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="oneTime">One-time Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {receipts.map((receipt) => (
              <ReceiptCard 
                key={receipt.id} 
                receipt={receipt} 
                onDownload={() => handleDownloadPDF(receipt)}
                onView={() => viewReceiptDetails(receipt)}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-4">
            {receipts
              .filter((receipt) => receipt.type === "subscription")
              .map((receipt) => (
                <ReceiptCard 
                  key={receipt.id} 
                  receipt={receipt} 
                  onDownload={() => handleDownloadPDF(receipt)}
                  onView={() => viewReceiptDetails(receipt)}
                />
              ))}
          </TabsContent>
          
          <TabsContent value="oneTime" className="space-y-4">
            {receipts
              .filter((receipt) => receipt.type === "one_time")
              .map((receipt) => (
                <ReceiptCard 
                  key={receipt.id} 
                  receipt={receipt} 
                  onDownload={() => handleDownloadPDF(receipt)}
                  onView={() => viewReceiptDetails(receipt)}
                />
              ))}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No receipts found</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              When you make payments for your subscription or services, 
              your receipts will appear here.
            </p>
            
            {/* Development-only button to generate test receipts */}
            {process.env.NODE_ENV !== 'production' && (
              <Button
                className="mt-6"
                onClick={async () => {
                  try {
                    await apiRequest("POST", "/api/receipts/generate-test");
                    // Invalidate and refetch instead of full page reload
                    await queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
                    toast({
                      title: "Success",
                      description: "Test receipt generated successfully",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to generate test receipt.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Generate Test Receipt (Dev Only)
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ReceiptDetailDialog 
        receipt={selectedReceipt} 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        onDownload={selectedReceipt ? () => handleDownloadPDF(selectedReceipt) : undefined}
      />
    </div>
  );
}

interface ReceiptCardProps {
  receipt: Receipt;
  onDownload: () => void;
  onView: () => void;
}

function ReceiptCard({ receipt, onDownload, onView }: ReceiptCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Receipt #{receipt.receiptNumber}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(receipt.createdAt), "MMMM d, yyyy")}
            </CardDescription>
          </div>
          <Badge
            variant={receipt.type === "subscription" ? "outline" : "secondary"}
          >
            {receipt.type === "subscription" ? "Subscription" : "One-time"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-1" />
            <span className="text-lg font-semibold">${receipt.amount.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">
              {receipt.description || "Standard payment"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 pt-3 pb-3 flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onView}>
          View Details
        </Button>
        <Button variant="default" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ReceiptDetailDialogProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

function ReceiptDetailDialog({ receipt, isOpen, onClose, onDownload }: ReceiptDetailDialogProps) {
  if (!receipt) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Receipt #{receipt.receiptNumber}</DialogTitle>
          <DialogDescription>
            Issued on {format(new Date(receipt.createdAt), "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payment Type</h4>
              <p>{receipt.type === "subscription" ? "Subscription" : "One-time Payment"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Amount</h4>
              <p className="font-semibold">${receipt.amount.toFixed(2)}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <p>{receipt.description || "Standard payment"}</p>
          </div>
          
          {receipt.stripePaymentIntentId && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Payment ID</h4>
              <p className="text-sm font-mono">{receipt.stripePaymentIntentId}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-500">Payment Status</h4>
            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">
              Paid
            </Badge>
          </div>
        </div>
        
        <DialogFooter>
          {onDownload && (
            <Button onClick={onDownload}>
              <Download className="h-4 w-4 mr-1" /> Download PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}