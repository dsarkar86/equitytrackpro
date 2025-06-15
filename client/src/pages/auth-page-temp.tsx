import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PropertyForm } from "@/components/forms/property-form";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "owner" // Default role
  });
  
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: loginValues.email,
      password: loginValues.password
    });
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      email: registerValues.email,
      username: registerValues.username,
      password: registerValues.password,
      fullName: registerValues.fullName,
      role: registerValues.role as any,
    }, {
      onSuccess: () => {
        // Show property form dialog after successful registration
        setShowPropertyForm(true);
      }
    });
  };
  
  const handlePropertyFormClose = () => {
    setShowPropertyForm(false);
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex">
        {/* Left side - Hero content */}
        <div className="flex-1 hidden lg:block p-8">
          <div className="h-full flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Equity<span className="text-primary">stek</span></h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Property valuation reimagined</h2>
            <p className="text-xl text-gray-600 mb-8">
              Track maintenance history, calculate real property value, and make better investment decisions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Track Properties</h3>
                <p className="text-sm text-gray-500">Manage all your properties in one place</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Maintenance History</h3>
                <p className="text-sm text-gray-500">Record all renovations and repairs</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Real Valuations</h3>
                <p className="text-sm text-gray-500">See how maintenance affects property value</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <h3 className="text-lg font-medium text-gray-900">Easy Subscription</h3>
                <p className="text-sm text-gray-500">Flexible plans for all user types</p>
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
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        placeholder="Email" 
                        value={loginValues.email}
                        onChange={(e) => setLoginValues({...loginValues, email: e.target.value})}
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
                        onChange={(e) => setLoginValues({...loginValues, password: e.target.value})}
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
                      ) : "Sign In"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register now
                    </button>
                  </div>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input 
                        id="reg-name" 
                        placeholder="Full Name" 
                        value={registerValues.fullName}
                        onChange={(e) => setRegisterValues({...registerValues, fullName: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input 
                          id="reg-email" 
                          type="email" 
                          placeholder="Email" 
                          value={registerValues.email}
                          onChange={(e) => setRegisterValues({...registerValues, email: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input 
                          id="reg-username" 
                          placeholder="Username" 
                          value={registerValues.username}
                          onChange={(e) => setRegisterValues({...registerValues, username: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input 
                        id="reg-password" 
                        type="password" 
                        placeholder="Password" 
                        value={registerValues.password}
                        onChange={(e) => setRegisterValues({...registerValues, password: e.target.value})}
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>I am a:</Label>
                      <RadioGroup 
                        value={registerValues.role} 
                        onValueChange={(value) => setRegisterValues({...registerValues, role: value})}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="owner" id="role-owner" />
                          <Label htmlFor="role-owner">Property Owner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="investor" id="role-investor" />
                          <Label htmlFor="role-investor">Real Estate Investor</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tradesperson" id="role-tradesperson" />
                          <Label htmlFor="role-tradesperson">Tradesperson</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : "Register"}
                    </Button>
                  </form>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Property Form Dialog that appears after successful registration */}
      <Dialog open={showPropertyForm} onOpenChange={setShowPropertyForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Your First Property</DialogTitle>
            <DialogDescription>
              Let's get started by adding your first property. You can add more properties later from your dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <PropertyForm 
            onSuccess={handlePropertyFormClose}
            onCancel={handlePropertyFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}