import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Minus } from "lucide-react";

export default function SimpleAuthPage() {
  // Step tracking for registration flow
  const [registrationStep, setRegistrationStep] = useState(1);
  const [activeTab, setActiveTab] = useState<string>("login");

  // User login and registration data
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "owner",
  });

  // Property counting step data
  const [propertyCount, setPropertyCount] = useState(1);
  const [hasMaintenanceRecords, setHasMaintenanceRecords] = useState(false);

  // Payment step data
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Calculate payment based on property count
  useEffect(() => {
    // Base price plus per property price
    const basePrice = 15; // Monthly base price
    const perPropertyPrice = 5; // Additional price per property

    setPaymentAmount(basePrice + (propertyCount - 1) * perPropertyPrice);
  }, [propertyCount]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: loginValues.email,
      password: loginValues.password,
    });
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    // Move to property counting step
    setRegistrationStep(2);
  };

  const handleRegisterStep2 = (e: React.FormEvent) => {
    e.preventDefault();

    // If user has maintenance records, show payment page
    if (hasMaintenanceRecords) {
      setShowPaymentDialog(true);
    } else {
      // Otherwise complete registration
      completeRegistration();
    }
  };

  const handlePayment = () => {
    // Handle payment process
    // For now, we'll just complete registration
    setShowPaymentDialog(false);
    completeRegistration();
  };

  const completeRegistration = () => {
    // Register the user with all collected information
    registerMutation.mutate(
      {
        email: registerValues.email,
        username: registerValues.username,
        password: registerValues.password,
        fullName: registerValues.fullName,
        role: registerValues.role as any,
        propertyCount: propertyCount,
      },
      {
        onSuccess: () => {
          // Redirect to dashboard on success
          setLocation("/");
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex">
        {/* Left side - Hero content */}
        <div className="flex-1 hidden lg:block p-8">
          <div className="h-full flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
              Equity<span className="text-primary">stekkkkk</span>
            </h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Property valuation reimagined
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Track maintenance history, calculate real property value, and make
              better investment decisions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  Track Properties
                </h3>
                <p className="text-sm text-gray-500">
                  Manage all your properties in one place
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  Maintenance History
                </h3>
                <p className="text-sm text-gray-500">
                  Record all renovations and repairs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex-1 p-4">
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Equitystek</CardTitle>
              <CardDescription>
                Track maintenance. Calculate real value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "login" ? (
                // Login Form
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Email"
                      value={loginValues.email}
                      onChange={(e) =>
                        setLoginValues({
                          ...loginValues,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={loginValues.password}
                      onChange={(e) =>
                        setLoginValues({
                          ...loginValues,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register now
                    </button>
                  </div>
                </form>
              ) : // Registration Multi-step Form
              registrationStep === 1 ? (
                // Step 1: Basic Information
                <form onSubmit={handleRegisterStep1} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Step 1: Account Information
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      placeholder="Full Name"
                      value={registerValues.fullName}
                      onChange={(e) =>
                        setRegisterValues({
                          ...registerValues,
                          fullName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Email"
                      value={registerValues.email}
                      onChange={(e) =>
                        setRegisterValues({
                          ...registerValues,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      placeholder="Username"
                      value={registerValues.username}
                      onChange={(e) =>
                        setRegisterValues({
                          ...registerValues,
                          username: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Password"
                      value={registerValues.password}
                      onChange={(e) =>
                        setRegisterValues({
                          ...registerValues,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Continue
                  </Button>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </button>
                  </div>
                </form>
              ) : (
                // Step 2: Property Information
                <form onSubmit={handleRegisterStep2} className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Step 2: Property Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="property-count">
                      How many properties do you own?
                    </Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setPropertyCount(Math.max(1, propertyCount - 1))
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center text-2xl font-bold">
                        {propertyCount}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setPropertyCount(propertyCount + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="has-maintenance"
                        checked={hasMaintenanceRecords}
                        onChange={(e) =>
                          setHasMaintenanceRecords(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="has-maintenance">
                        I have maintenance records I want to upload
                      </Label>
                    </div>
                  </div>

                  {/* Subscription summary based on property count */}
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">
                      Subscription Summary
                    </h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base plan</span>
                        <span className="font-medium">$15/month</span>
                      </div>
                      {propertyCount > 1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Additional properties ({propertyCount - 1})
                          </span>
                          <span className="font-medium">
                            ${(propertyCount - 1) * 5}/month
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                        <span>Total</span>
                        <span>${paymentAmount}/month</span>
                      </div>
                      <div className="text-xs text-gray-500 pt-1">
                        {hasMaintenanceRecords
                          ? "Payment required for maintenance record storage"
                          : "Free trial available with no maintenance records"}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRegistrationStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : hasMaintenanceRecords ? (
                        "Continue to Payment"
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
            <DialogDescription>
              Your subscription includes up to {propertyCount}{" "}
              {propertyCount === 1 ? "property" : "properties"} with maintenance
              record storage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <span className="text-3xl font-bold">${paymentAmount}</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <div className="text-center text-sm text-gray-500 mt-1">
                Billed monthly, cancel anytime
              </div>
            </div>

            {/* Payment form would go here */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPaymentDialog(false)}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={handlePayment}>
              Complete Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
