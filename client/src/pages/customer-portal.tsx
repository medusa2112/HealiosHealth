import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { ShoppingCart, Package, MapPin, Plus, Edit, Trash2, User, Clock, CreditCard } from "lucide-react";
import ReferralsPage from "./portal/Referrals";

interface CustomerPortalData {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  orders: Array<{
    id: string;
    totalAmount: string;
    currency: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    trackingNumber: string | null;
    items: any[];
  }>;
  addresses: Array<{
    id: string;
    type: string;
    line1: string;
    line2: string | null;
    city: string | null;
    zip: string | null;
    country: string | null;
  }>;
  stats: {
    totalOrders: number;
    totalSpent: string;
  };
}

interface Order {
  id: string;
  totalAmount: string;
  currency: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  trackingNumber: string | null;
  items: any[];
}

interface Address {
  id: string;
  type: string;
  line1: string;
  line2: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
}

export default function CustomerPortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  // Check auth status
  const { data: user, isLoading: authLoading } = useQuery<any>({
    queryKey: ["/auth/me"],
    retry: false,
  });

  // Fetch portal data
  const { data: portalData, isLoading: portalLoading } = useQuery<CustomerPortalData>({
    queryKey: ["/portal"],
    enabled: !!user && user.role === 'customer',
  });

  // Fetch full order list
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/portal/orders"],
    enabled: !!user && user.role === 'customer',
  });

  // Fetch addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ["/portal/addresses"],
    enabled: !!user && user.role === 'customer',
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest(`/portal/orders/${orderId}/reorder`, "POST");
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Reorder initiated",
          description: "Redirecting to checkout...",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reorder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Address mutations
  const createAddressMutation = useMutation({
    mutationFn: async (addressData: any) => {
      return apiRequest("/portal/addresses", "POST", addressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/portal/addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/portal"] });
      setAddressDialogOpen(false);
      setSelectedAddress(null);
      toast({
        title: "Success",
        description: "Address saved successfully.",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/portal/addresses/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/portal/addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/portal"] });
      setAddressDialogOpen(false);
      setSelectedAddress(null);
      toast({
        title: "Success",
        description: "Address updated successfully.",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/portal/addresses/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/portal/addresses"] });
      queryClient.invalidateQueries({ queryKey: ["/portal"] });
      toast({
        title: "Success",
        description: "Address deleted successfully.",
      });
    },
  });

  // Handle address form submission
  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addressData = {
      type: formData.get("type"),
      line1: formData.get("line1"),
      line2: formData.get("line2"),
      city: formData.get("city"),
      zip: formData.get("zip"),
      country: formData.get("country"),
    };

    if (selectedAddress) {
      updateAddressMutation.mutate({ id: selectedAddress.id, data: addressData });
    } else {
      createAddressMutation.mutate(addressData);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Authentication Required</CardTitle>
            <CardDescription>Please log in to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                  Log In
                </Button>
              </Link>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  For testing, you can use:
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Email: customer@healios.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string, type: 'payment' | 'order') => {
    const baseClasses = "text-white";
    if (type === 'payment') {
      switch (status) {
        case 'completed': return <Badge className={`${baseClasses} bg-green-600`}>Paid</Badge>;
        case 'pending': return <Badge className={`${baseClasses} bg-yellow-600`}>Pending</Badge>;
        case 'failed': return <Badge className={`${baseClasses} bg-red-600`}>Failed</Badge>;
        case 'refunded': return <Badge className={`${baseClasses} bg-blue-600`}>Refunded</Badge>;
        default: return <Badge className={`${baseClasses} bg-gray-600`}>{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'processing': return <Badge className={`${baseClasses} bg-blue-600`}>Processing</Badge>;
        case 'shipped': return <Badge className={`${baseClasses} bg-green-600`}>Shipped</Badge>;
        case 'delivered': return <Badge className={`${baseClasses} bg-green-800`}>Delivered</Badge>;
        case 'cancelled': return <Badge className={`${baseClasses} bg-red-600`}>Cancelled</Badge>;
        default: return <Badge className={`${baseClasses} bg-gray-600`}>{status}</Badge>;
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.firstName || user.email}
          </p>
        </div>

        {/* Stats Overview */}
        {portalData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-black dark:text-white" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {portalData.stats.totalOrders}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-8 w-8 text-black dark:text-white" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      R{portalData.stats.totalSpent}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-8 w-8 text-black dark:text-white" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {portalData.addresses?.length || 0}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Saved Addresses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-900">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order History</span>
                </CardTitle>
                <CardDescription>View and manage your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-black dark:text-white">Loading orders...</div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-black dark:text-white">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-black dark:text-white">
                              R{order.totalAmount}
                            </p>
                            <div className="flex space-x-2 mt-1">
                              {getStatusBadge(order.paymentStatus, 'payment')}
                              {getStatusBadge(order.orderStatus, 'order')}
                            </div>
                          </div>
                        </div>
                        
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                          <Link href={`/order-confirmation?order_id=${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reorderMutation.mutate(order.id)}
                            disabled={reorderMutation.isPending}
                            className="flex items-center space-x-1"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>{reorderMutation.isPending ? "Processing..." : "Reorder"}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No orders found</p>
                    <Link href="/products">
                      <Button className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <ReferralsPage />
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Saved Addresses</span>
                  </div>
                  <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                        onClick={() => setSelectedAddress(null)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {selectedAddress ? 'Edit Address' : 'Add New Address'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="type">Address Type</Label>
                          <Select name="type" defaultValue={selectedAddress?.type || "shipping"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shipping">Shipping</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="line1">Address Line 1</Label>
                          <Input 
                            name="line1" 
                            required 
                            defaultValue={selectedAddress?.line1 || ""} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="line2">Address Line 2</Label>
                          <Input 
                            name="line2" 
                            defaultValue={selectedAddress?.line2 || ""} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input 
                              name="city" 
                              defaultValue={selectedAddress?.city || ""} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input 
                              name="zip" 
                              defaultValue={selectedAddress?.zip || ""} 
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Select name="country" defaultValue={selectedAddress?.country || "ZA"}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ZA">South Africa</SelectItem>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="GB">United Kingdom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" disabled={createAddressMutation.isPending || updateAddressMutation.isPending}>
                            {selectedAddress ? 'Update' : 'Save'} Address
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setAddressDialogOpen(false);
                              setSelectedAddress(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <div className="text-black dark:text-white">Loading addresses...</div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">{address.type}</Badge>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAddress(address);
                                setAddressDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAddressMutation.mutate(address.id)}
                              disabled={deleteAddressMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-black dark:text-white">
                          <p>{address.line1}</p>
                          {address.line2 && <p>{address.line2}</p>}
                          <p>{address.city}, {address.zip}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No saved addresses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-black dark:text-white">Email</Label>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                {user.firstName && (
                  <div>
                    <Label className="text-black dark:text-white">First Name</Label>
                    <p className="text-gray-600 dark:text-gray-400">{user.firstName}</p>
                  </div>
                )}
                {user.lastName && (
                  <div>
                    <Label className="text-black dark:text-white">Last Name</Label>
                    <p className="text-gray-600 dark:text-gray-400">{user.lastName}</p>
                  </div>
                )}
                <div>
                  <Label className="text-black dark:text-white">Account Type</Label>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}