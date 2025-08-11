import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, RefreshCw, DollarSign, Package, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { SEOHead } from '@/components/seo-head';
import type { Order } from '@shared/types';
import { AdminNavbar } from '@/components/admin-navbar';

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  refundedOrders: number;
  disputedOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  filtered: number;
  filters: any;
}

export default function AdminOrders() {
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [customerEmailFilter, setCustomerEmailFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders with filtering
  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useQuery<OrdersResponse>({
    queryKey: ['/admin/orders', filter, dateFilter, customerEmailFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter !== "all") {
        if (['processing', 'shipped', 'delivered', 'cancelled'].includes(filter)) {
          params.append('status', filter);
        } else if (['pending', 'completed', 'failed'].includes(filter)) {
          params.append('paymentStatus', filter);
        }
      }
      if (dateFilter.from) params.append('dateFrom', dateFilter.from);
      if (dateFilter.to) params.append('dateTo', dateFilter.to);
      if (customerEmailFilter.trim()) params.append('customerEmail', customerEmailFilter.trim());
      
      const queryString = params.toString();
      return fetch(`/admin/orders${queryString ? `?${queryString}` : ''}`)
        .then(res => res.json());
    }
  });
  
  const orders = ordersResponse?.orders || [];

  // Fetch order statistics  
  const { data: stats, isLoading: statsLoading } = useQuery<OrderStats>({
    queryKey: ['/admin/orders', 'stats'],
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async ({ orderId, amount, reason }: { orderId: string; amount?: number; reason?: string }) => {
      return apiRequest('POST', `/admin/orders/${orderId}/refund`, { amount, reason });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Refund Processed",
        description: `Successfully processed refund for order ${variables.orderId}`,
      });
      // Refetch orders to get updated data
      queryClient.invalidateQueries({ queryKey: ['/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/admin/orders', 'stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest('PUT', `/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Status Updated",
        description: `Order status updated to ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/admin/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Orders are now filtered server-side, so we use them directly

  const handleRefund = async (orderId: string, totalAmount: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to process a full refund for this order? Amount: ${formatCurrency(parseFloat(totalAmount))}`
    );
    if (!confirmed) return;

    refundMutation.mutate({ orderId });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusBadge = (status: string, type: 'payment' | 'order' | 'refund' | 'dispute') => {
    const getVariant = () => {
      switch (status) {
        case 'completed': case 'delivered': case 'paid': return 'default';
        case 'processing': case 'shipped': case 'pending': return 'secondary';
        case 'refunded': case 'cancelled': return 'outline';
        case 'disputed': case 'failed': return 'destructive';
        case 'none': return 'secondary';
        default: return 'secondary';
      }
    };

    return (
      <Badge variant={getVariant()} className="text-xs">
        {status === 'none' ? 'N/A' : status}
      </Badge>
    );
  };

  const parseOrderItems = (orderItemsJson: string) => {
    try {
      return JSON.parse(orderItemsJson);
    } catch {
      return [];
    }
  };

  if (ordersError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link href="/admin" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load orders. Please try again.</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setLocation(`/admin`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdminNavbar activeTab="orders" onTabChange={handleTabChange} />
      <SEOHead 
        title="Order Management - Admin | Healios"
        description="View and manage all customer orders, refunds, and payment status in the Healios admin panel."
      />
      <div className="max-w-7xl mx-auto px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order Management</h1>
        </div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/admin/orders'] })}
          variant="outline" 
          size="sm"
          disabled={ordersLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disputedOrders}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending Payment</SelectItem>
                <SelectItem value="completed">Paid Orders</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Customer:</label>
            <input
              type="text"
              placeholder="Search by email..."
              value={customerEmailFilter}
              onChange={(e) => setCustomerEmailFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-[200px] bg-white dark:bg-gray-800"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Date Range:</label>
            <input
              type="date"
              value={dateFilter.from}
              onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <input
              type="date"
              value={dateFilter.to}
              onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
            />
            {(dateFilter.from || dateFilter.to || customerEmailFilter || filter !== "all") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFilter("all");
                  setDateFilter({ from: "", to: "" });
                  setCustomerEmailFilter("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing {ordersResponse?.filtered || 0} of {ordersResponse?.total || 0} orders
          {ordersResponse?.total !== ordersResponse?.filtered && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
              Filtered
            </span>
          )}
          {ordersLoading && (
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded text-xs">
              Loading...
            </span>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {ordersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {ordersResponse?.total === 0 
                ? "No orders found in the system." 
                : "No orders found matching the current filters."}
            </p>
            {ordersResponse?.total !== ordersResponse?.filtered && (
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => {
                  setFilter("all");
                  setDateFilter({ from: "", to: "" });
                  setCustomerEmailFilter("");
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          orders.map((order: Order) => {
            const orderItems = parseOrderItems(typeof order.orderItems === 'string' ? order.orderItems : JSON.stringify(order.orderItems || []));
            return (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Customer: {order.customerName || order.customerEmail}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} at {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="text-xl font-bold">
                      {formatCurrency(parseFloat(order.totalAmount), order.currency)}
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(order.paymentStatus, 'payment')}
                      {getStatusBadge(order.orderStatus, 'order')}
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                {orderItems.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <h4 className="font-medium mb-2">Items ({orderItems.length}):</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {orderItems.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                      {orderItems.length > 3 && (
                        <div>+ {orderItems.length - 3} more items</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="text-xs">
                    <span className="text-muted-foreground mr-1">Refund:</span>
                    {getStatusBadge(order.refundStatus, 'refund')}
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground mr-1">Dispute:</span>
                    {getStatusBadge(order.disputeStatus, 'dispute')}
                  </div>
                  {order.stripePaymentIntentId && (
                    <div className="text-xs">
                      <span className="text-muted-foreground mr-1">Stripe:</span>
                      <Badge variant="outline" className="text-xs">
                        {order.stripePaymentIntentId.slice(0, 20)}...
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Order Status Updates */}
                  {order.paymentStatus === 'completed' && order.orderStatus === 'processing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  
                  {order.orderStatus === 'shipped' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      disabled={updateStatusMutation.isPending}
                    >
                      Mark as Delivered
                    </Button>
                  )}

                  {/* Refund Button */}
                  {order.paymentStatus === 'completed' && 
                   order.refundStatus !== 'refunded' && 
                   order.stripePaymentIntentId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRefund(order.id, order.totalAmount)}
                      disabled={refundMutation.isPending}
                    >
                      {refundMutation.isPending ? 'Processing...' : 'Process Refund'}
                    </Button>
                  )}

                  {order.refundStatus === 'refunded' && (
                    <Badge variant="outline" className="text-green-600">
                      Refunded
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}