import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Edit, Download, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Initialize Stripe
let stripePromise: any;
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

// Subscription plan details
const subscriptionPlans = [
  {
    id: "price_basic", // This would be a real Stripe price ID in production
    name: "Basic Plan",
    price: 9.99,
    cycle: "monthly",
    features: [
      "Up to 3 properties",
      "Basic maintenance tracking",
      "Standard valuation methods",
      "Email support",
    ],
  },
  {
    id: "price_pro", // This would be a real Stripe price ID in production
    name: "Pro Plan",
    price: 24.99,
    cycle: "monthly",
    features: [
      "Unlimited properties",
      "Advanced maintenance tracking",
      "All valuation methods",
      "Maintenance value calculation",
      "Detailed valuation reports",
      "Priority email support",
    ],
    recommended: true,
  },
  {
    id: "price_business", // This would be a real Stripe price ID in production
    name: "Business Plan",
    price: 49.99,
    cycle: "monthly",
    features: [
      "Unlimited properties",
      "Team accounts (up to 5 users)",
      "Advanced analytics",
      "Custom reporting",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  // Mock subscription data - in a real implementation, this would come from the API
  const subscription = {
    plan: "Pro Plan",
    price: 24.99,
    cycle: "Monthly",
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "Active",
  };

  // Mock payment methods - in a real implementation, this would come from the API
  const paymentMethods = [
    {
      id: "pm_1",
      type: "visa",
      last4: "4242",
      expMonth: 8,
      expYear: 2025,
      isDefault: true,
    },
    {
      id: "pm_2",
      type: "mastercard",
      last4: "8888",
      expMonth: 12,
      expYear: 2024,
      isDefault: false,
    },
  ];

  // Mock billing history - in a real implementation, this would come from the API
  const billingHistory = [
    {
      id: "inv_1",
      date: new Date(2023, 6, 15), // July 15, 2023
      amount: 24.99,
      status: "Paid",
    },
    {
      id: "inv_2",
      date: new Date(2023, 5, 15), // June 15, 2023
      amount: 24.99,
      status: "Paid",
    },
    {
      id: "inv_3",
      date: new Date(2023, 4, 15), // May 15, 2023
      amount: 24.99,
      status: "Paid",
    },
  ];
  
  // Handle checkout for subscription
  const handleCheckout = async () => {
    if (!stripePromise) {
      toast({
        title: "Error",
        description: "Stripe is not configured. Please set VITE_STRIPE_PUBLIC_KEY.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoadingCheckout(true);
      
      // Call our backend to create a subscription
      const response = await apiRequest("POST", "/api/create-subscription", {
        priceId: selectedPlan, // In a real implementation, you'd use the actual Stripe price ID
      });
      
      const { clientSecret } = await response.json();
      
      // Redirect to checkout
      const stripe = await stripePromise;
      const { error } = await stripe.confirmCardPayment(clientSecret);
      
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your subscription has been updated.",
        });
        setChangePlanDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 lg:text-3xl">Subscription Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your Equitystek subscription plan and billing information.
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Pro Plan</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Unlimited properties, advanced valuation tools, and detailed reports
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
              
              <div className="mt-6 border-t border-b border-gray-200 py-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Monthly Price</dt>
                    <dd className="mt-1 text-sm text-gray-900">${subscription.price.toFixed(2)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Billing Cycle</dt>
                    <dd className="mt-1 text-sm text-gray-900">{subscription.cycle}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(subscription.nextBillingDate, 'MMMM d, yyyy')}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="mt-6">
                <h4 className="text-base font-medium text-gray-900">Plan Features</h4>
                <ul className="mt-4 space-y-4">
                  {subscriptionPlans.find(plan => plan.name === subscription.plan)?.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <Button onClick={() => setChangePlanDialogOpen(true)}>
                  Change Plan
                </Button>
                <Button variant="outline">
                  Update Payment Method
                </Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Payment Methods</h3>
              
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {method.type === "visa" ? (
                        <i className="fab fa-cc-visa text-blue-600 text-xl mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-8" viewBox="0 0 24 16" fill="none">
                            <rect width="24" height="16" rx="2" fill="#2566AF"/>
                            <path d="M10.975 10.998H9.368L10.353 5.002H11.959L10.975 10.998Z" fill="white"/>
                            <path d="M16.66 5.112C16.308 4.977 15.76 4.832 15.083 4.832C13.438 4.832 12.264 5.705 12.254 6.952C12.244 7.852 13.101 8.353 13.755 8.655C14.426 8.963 14.65 9.16 14.647 9.435C14.644 9.854 14.131 10.044 13.653 10.044C12.975 10.044 12.616 9.942 12.067 9.721L11.866 9.63L11.654 10.925C12.07 11.105 12.844 11.263 13.648 11.271C15.391 11.271 16.545 10.407 16.559 9.083C16.567 8.363 16.12 7.802 15.107 7.364C14.497 7.08 14.125 6.885 14.128 6.591C14.129 6.326 14.418 6.047 15.057 6.047C15.588 6.041 15.977 6.172 16.277 6.309L16.417 6.377L16.66 5.112Z" fill="white"/>
                            <path d="M19.016 5.002H17.764C17.379 5.002 17.095 5.115 16.929 5.518L14.583 10.998H16.326C16.326 10.998 16.599 10.271 16.661 10.11C16.826 10.11 18.631 10.112 18.841 10.112C18.889 10.319 19.033 10.998 19.033 10.998H20.576L19.016 5.002ZM17.113 8.958C17.234 8.637 17.723 7.358 17.723 7.358C17.715 7.373 17.847 7.035 17.919 6.829L18.014 7.315C18.014 7.315 18.31 8.703 18.369 8.958H17.113Z" fill="white"/>
                            <path d="M7.852 5.002L6.227 8.957L6.093 8.271C5.852 7.391 4.926 6.437 3.899 5.977L5.399 10.997H7.151L9.615 5.002H7.852Z" fill="white"/>
                            <path d="M5.092 5.002H2.49L2.464 5.125C4.085 5.542 5.138 6.73 5.615 8.271L5.007 5.518C4.925 5.115 4.65 5.01 4.309 5.002H5.092Z" fill="#FAA61A"/>
                          </svg>
                        </i>
                      ) : (
                        <i className="fab fa-cc-mastercard text-red-600 text-xl mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-8" viewBox="0 0 24 16" fill="none">
                            <rect width="24" height="16" rx="2" fill="#16366F"/>
                            <path d="M9.5 4.5C7.01472 4.5 5 6.51472 5 9C5 11.4853 7.01472 13.5 9.5 13.5C10.9179 13.5 12.1755 12.8031 13 11.7082C13.8245 12.8031 15.0821 13.5 16.5 13.5C18.9853 13.5 21 11.4853 21 9C21 6.51472 18.9853 4.5 16.5 4.5C15.0821 4.5 13.8245 5.19692 13 6.29179C12.1755 5.19692 10.9179 4.5 9.5 4.5Z" fill="#D9222A"/>
                            <path d="M13 6.29179C13.8245 5.19692 15.0821 4.5 16.5 4.5C18.9853 4.5 21 6.51472 21 9C21 11.4853 18.9853 13.5 16.5 13.5C15.0821 13.5 13.8245 12.8031 13 11.7082C13.8245 10.6133 15.0821 9.91638 16.5 9.91638C17.4389 9.91638 18.2998 9.55393 19 8.96825C19.0146 8.97884 19.0297 8.98907 19.0444 8.99995C19.0297 9.01084 19.0146 9.02107 19 9.03166C18.2998 9.61735 17.4389 9.9798 16.5 9.9798C15.0821 9.9798 13.8245 9.28642 13 8.19155C13 7.55925 13 6.92416 13 6.29179Z" fill="#FFB600"/>
                            <path d="M13 8.19155C13.8245 9.28642 15.0821 9.9798 16.5 9.9798C17.4389 9.9798 18.2998 9.61735 19 9.03166C19.0146 9.02107 19.0297 9.01084 19.0444 8.99995C19.0297 8.98907 19.0146 8.97884 19 8.96825C18.2998 8.38257 17.4389 8.02012 16.5 8.02012C15.0821 8.02012 13.8245 8.71349 13 9.80837C13 9.26943 13 8.73049 13 8.19155Z" fill="#F7981D"/>
                          </svg>
                        </i>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {method.isDefault && (
                        <Badge variant="outline" className="mr-4 bg-green-100 text-green-800 border-green-200">
                          Default
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" /> Add payment method
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Billing History</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(invoice.date, 'MMMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                          <Button variant="link" className="p-0 h-auto">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/receipts")}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" /> 
                  View Complete Receipt History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose the plan that best fits your needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex items-start p-4 border rounded-lg hover:border-primary ${
                    selectedPlan === plan.id ? 'border-primary-500 border-2' : 'border-gray-200'
                  } ${plan.recommended ? 'bg-primary-50' : ''}`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <Badge className="bg-primary text-white">Recommended</Badge>
                    </div>
                  )}
                  <div className="flex items-center h-5">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                  </div>
                  <div className="ml-3 flex-1">
                    <Label
                      htmlFor={plan.id}
                      className="text-md font-medium text-gray-900 cursor-pointer"
                    >
                      {plan.name}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      ${plan.price}/month
                    </p>
                    <ul className="mt-2 space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setChangePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isLoadingCheckout}
            >
              {isLoadingCheckout ? "Processing..." : "Continue to Checkout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
