import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation, Link } from 'wouter';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCog, CreditCard, Home, Wrench, FileText, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected item for editing
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [generateReceiptForm, setGenerateReceiptForm] = useState({
    userId: '',
    amount: '',
    description: '',
    type: 'one_time'
  });

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      setLocation('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access the admin area.',
        variant: 'destructive',
      });
    }

    // Load admin data
    if (user && user.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load dashboard stats
      const statsRes = await apiRequest('GET', '/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Load users
      const usersRes = await apiRequest('GET', '/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Load subscriptions
      const subscriptionsRes = await apiRequest('GET', '/api/admin/subscriptions');
      const subscriptionsData = await subscriptionsRes.json();
      setSubscriptions(subscriptionsData);

      // Load properties
      const propertiesRes = await apiRequest('GET', '/api/admin/properties');
      const propertiesData = await propertiesRes.json();
      setProperties(propertiesData);

      // Load maintenance records
      const maintenanceRes = await apiRequest('GET', '/api/admin/maintenance');
      const maintenanceData = await maintenanceRes.json();
      setMaintenance(maintenanceData);

      // Load receipts
      const receiptsRes = await apiRequest('GET', '/api/admin/receipts');
      const receiptsData = await receiptsRes.json();
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const resetUserPassword = async () => {
    if (!selectedUser) return;
    
    try {
      const res = await apiRequest('POST', `/api/admin/users/${selectedUser.id}/reset-password`);
      const data = await res.json();
      setNewPassword(data.temporaryPassword);
      setPasswordDialogOpen(true);
      toast({
        title: 'Password Reset',
        description: 'User password has been reset successfully.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateUserDetails = async (formData: any) => {
    if (!selectedUser) return;
    
    try {
      await apiRequest('PATCH', `/api/admin/users/${selectedUser.id}`, formData);
      toast({
        title: 'User Updated',
        description: 'User details have been updated successfully.',
      });
      loadAdminData();
      setUserDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Subscription management functions
  const updateSubscription = async (formData: any) => {
    if (!selectedSubscription) return;
    
    try {
      await apiRequest('PATCH', `/api/admin/subscriptions/${selectedSubscription.id}`, formData);
      toast({
        title: 'Subscription Updated',
        description: 'Subscription has been updated successfully.',
      });
      loadAdminData();
      setSubscriptionDialogOpen(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Property management functions
  const updateProperty = async (formData: any) => {
    if (!selectedProperty) return;
    
    try {
      await apiRequest('PATCH', `/api/admin/properties/${selectedProperty.id}`, formData);
      toast({
        title: 'Property Updated',
        description: 'Property details have been updated successfully.',
      });
      loadAdminData();
      setPropertyDialogOpen(false);
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Maintenance management functions
  const updateMaintenance = async (formData: any) => {
    if (!selectedMaintenance) return;
    
    try {
      await apiRequest('PATCH', `/api/admin/maintenance/${selectedMaintenance.id}`, formData);
      toast({
        title: 'Maintenance Updated',
        description: 'Maintenance record has been updated successfully.',
      });
      loadAdminData();
      setMaintenanceDialogOpen(false);
    } catch (error) {
      console.error('Error updating maintenance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update maintenance record. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Receipt management functions
  const generateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest('POST', '/api/admin/receipts/generate', generateReceiptForm);
      toast({
        title: 'Receipt Generated',
        description: 'New receipt has been generated successfully.',
      });
      loadAdminData();
      setReceiptDialogOpen(false);
      setGenerateReceiptForm({
        userId: '',
        amount: '',
        description: '',
        type: 'one_time'
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate receipt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-4">You do not have permission to access the admin area.</p>
        <Button onClick={() => setLocation('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={loadAdminData}>Refresh Data</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Properties</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Receipts</span>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Dashboard Overview */}
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Active Users"
                  value={stats?.totalUsers || 0}
                  description="Total registered users"
                  icon={<UserCog className="h-5 w-5 text-primary" />}
                />
                <StatsCard
                  title="Properties"
                  value={stats?.totalProperties || 0}
                  description="Total properties registered"
                  icon={<Home className="h-5 w-5 text-primary" />}
                />
                <StatsCard
                  title="Active Subscriptions"
                  value={stats?.activeSubscriptions || 0}
                  description={`${stats?.activeSubscriptions || 0} of ${stats?.totalSubscriptions || 0} total`}
                  icon={<CreditCard className="h-5 w-5 text-primary" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Total revenue from all sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6">
                      <div className="text-3xl font-bold">${stats?.totalRevenue.toFixed(2) || "0.00"}</div>
                      <p className="text-sm text-muted-foreground mt-2">Total processed revenue</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Property Types</CardTitle>
                    <CardDescription>Distribution of property types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats?.propertiesByType && Object.entries(stats.propertiesByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <div className="font-medium capitalize">{type.replace('_', ' ')}</div>
                          <Badge>{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Management */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts, reset passwords, and update user details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  user.role === 'admin' 
                                    ? 'destructive' 
                                    : user.role === 'tradesperson' 
                                      ? 'outline' 
                                      : 'default'
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setUserDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    resetUserPassword();
                                  }}
                                >
                                  Reset Password
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Management */}
            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>
                    View and manage user subscriptions, update status, and fix billing issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Next Billing</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((subscription) => {
                          const user = users.find(u => u.id === subscription.userId);
                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>{subscription.id}</TableCell>
                              <TableCell>{user?.username || subscription.userId}</TableCell>
                              <TableCell>{subscription.planId}</TableCell>
                              <TableCell>${subscription.currentPrice.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={subscription.isActive ? 'default' : 'destructive'}>
                                  {subscription.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(subscription.nextBillingDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setSubscriptionDialogOpen(true);
                                  }}
                                >
                                  Manage
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Properties Management */}
            <TabsContent value="properties">
              <Card>
                <CardHeader>
                  <CardTitle>Property Management</CardTitle>
                  <CardDescription>
                    View and edit property details, fix data errors, and manage property records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property) => {
                          const user = users.find(u => u.id === property.userId);
                          return (
                            <TableRow key={property.id}>
                              <TableCell>{property.id}</TableCell>
                              <TableCell>{user?.username || property.userId}</TableCell>
                              <TableCell>{property.address}, {property.city}</TableCell>
                              <TableCell>{property.propertyType.replace('_', ' ')}</TableCell>
                              <TableCell>{new Date(property.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProperty(property);
                                    setPropertyDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Management */}
            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Management</CardTitle>
                  <CardDescription>
                    View and manage maintenance requests, assign priority, and track status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maintenance.map((record) => {
                          const property = properties.find(p => p.id === record.propertyId);
                          return (
                            <TableRow key={record.id}>
                              <TableCell>{record.id}</TableCell>
                              <TableCell>{property?.address || record.propertyId}</TableCell>
                              <TableCell>{record.title}</TableCell>
                              <TableCell>{record.category}</TableCell>
                              <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMaintenance(record);
                                    setMaintenanceDialogOpen(true);
                                  }}
                                >
                                  Manage
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receipts Management */}
            <TabsContent value="receipts">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Receipt Management</CardTitle>
                    <CardDescription>
                      View payment receipts and generate new receipts when needed
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setReceiptDialogOpen(true)}>
                    Generate Receipt
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Receipt #</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipts.map((receipt) => {
                          const user = users.find(u => u.id === receipt.userId);
                          return (
                            <TableRow key={receipt.id}>
                              <TableCell>{receipt.id}</TableCell>
                              <TableCell>{user?.username || receipt.userId}</TableCell>
                              <TableCell>{receipt.receiptNumber}</TableCell>
                              <TableCell>${receipt.amount.toFixed(2)}</TableCell>
                              <TableCell>{receipt.type}</TableCell>
                              <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant={receipt.paymentStatus === 'paid' ? 'default' : 'destructive'}>
                                  {receipt.paymentStatus}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and account information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              updateUserDetails(data);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={selectedUser.username}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select name="role" defaultValue={selectedUser.role}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="tradesperson">Tradesperson</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedUser.role === 'tradesperson' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="licenseNumber" className="text-right">
                      License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      defaultValue={selectedUser.licenseNumber || ''}
                      className="col-span-3"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset Complete</DialogTitle>
            <DialogDescription>
              The user's password has been reset successfully
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium">New Temporary Password:</div>
              <div className="font-mono text-xl mt-2">{newPassword}</div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Please provide this temporary password to the user. They should change it upon their next login.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPasswordDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Update subscription details and status
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                ...Object.fromEntries(formData.entries()),
                isActive: formData.get('isActive') === 'true',
                currentPrice: parseFloat(formData.get('currentPrice') as string)
              };
              updateSubscription(data);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">
                    Status
                  </Label>
                  <Select name="isActive" defaultValue={selectedSubscription.isActive.toString()}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currentPrice" className="text-right">
                    Current Price
                  </Label>
                  <Input
                    id="currentPrice"
                    name="currentPrice"
                    type="number"
                    step="0.01"
                    defaultValue={selectedSubscription.currentPrice}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nextBillingDate" className="text-right">
                    Next Billing
                  </Label>
                  <Input
                    id="nextBillingDate"
                    name="nextBillingDate"
                    type="date"
                    defaultValue={new Date(selectedSubscription.nextBillingDate).toISOString().split('T')[0]}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property details and information
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              updateProperty(data);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={selectedProperty.address}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="city" className="text-right">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={selectedProperty.city}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="state" className="text-right">
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={selectedProperty.state}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zipCode" className="text-right">
                    Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={selectedProperty.zipCode}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="propertyType" className="text-right">
                    Property Type
                  </Label>
                  <Select name="propertyType" defaultValue={selectedProperty.propertyType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family</SelectItem>
                      <SelectItem value="condominium">Condominium</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="multi_family">Multi-Family</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Maintenance Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Maintenance Request</DialogTitle>
            <DialogDescription>
              Update maintenance request details and status
            </DialogDescription>
          </DialogHeader>
          {selectedMaintenance && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              updateMaintenance(data);
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={selectedMaintenance.title}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={selectedMaintenance.description}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select name="priority" defaultValue={selectedMaintenance.priority || 'medium'}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select name="status" defaultValue={selectedMaintenance.status || 'pending'}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estimatedCost" className="text-right">
                    Est. Cost
                  </Label>
                  <Input
                    id="estimatedCost"
                    name="estimatedCost"
                    type="number"
                    step="0.01"
                    defaultValue={selectedMaintenance.estimatedCost || ''}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Receipt</DialogTitle>
            <DialogDescription>
              Create a new receipt for a user
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={generateReceipt}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  User
                </Label>
                <Select 
                  name="userId" 
                  value={generateReceiptForm.userId}
                  onValueChange={(value) => setGenerateReceiptForm({...generateReceiptForm, userId: value})}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={generateReceiptForm.amount}
                  onChange={(e) => setGenerateReceiptForm({...generateReceiptForm, amount: e.target.value})}
                  placeholder="0.00"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={generateReceiptForm.description}
                  onChange={(e) => setGenerateReceiptForm({...generateReceiptForm, description: e.target.value})}
                  placeholder="Receipt description"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select 
                  name="type" 
                  value={generateReceiptForm.type}
                  onValueChange={(value) => setGenerateReceiptForm({...generateReceiptForm, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select receipt type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time Payment</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Generate Receipt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stats Card component for the dashboard
function StatsCard({ title, value, description, icon }: { 
  title: string; 
  value: number; 
  description: string; 
  icon?: React.ReactNode 
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}