import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, RefreshCw, DollarSign, Package, AlertTriangle, CheckCircle, Eye, Clock, Truck, ShoppingBag, CreditCard, Calendar, User, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { SEOHead } from '@/components/seo-head';
import type { Order } from '@shared/types';

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
    queryKey: ['/api/admin/orders', filter, dateFilter, customerEmailFilter],
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
      return fetch(`/api/admin/orders${queryString ? `?${queryString}` : ''}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch orders: ${res.status}`);
          }
          return res.json();
        });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <SEOHead 
          title="Order Management - Admin | Healios"
          description="View and manage all customer orders, refunds, and payment status in the Healios admin panel."
        />
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/admin" className="mr-4">
                <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage customer orders and payments</p>
              </div>
            </div>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/admin/orders'] })}
              variant="outline" 
              size="sm"
              disabled={ordersLoading}
              data-testid="button-refresh-orders"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time orders</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total earnings</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successfully fulfilled</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Disputes</CardTitle>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.disputedOrders}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requiring attention</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Status
                </label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" data-testid="select-order-status">
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={customerEmailFilter}
                    onChange={(e) => setCustomerEmailFilter(e.target.value)}
                    className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="input-customer-search"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1"
                    data-testid="input-date-from"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 self-center">to</span>
                  <input
                    type="date"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1"
                    data-testid="input-date-to"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Showing {ordersResponse?.filtered || 0}</span> of {ordersResponse?.total || 0} orders
                  {ordersResponse?.total !== ordersResponse?.filtered && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                      Filtered
                    </span>
                  )}
                  {ordersLoading && (
                    <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                      Loading...
                    </span>
                  )}
                </div>
              </div>
              
              {(dateFilter.from || dateFilter.to || customerEmailFilter || filter !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilter("all");
                    setDateFilter({ from: "", to: "" });
                    setCustomerEmailFilter("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {ordersLoading ? (
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading orders...</p>
                </div>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {ordersResponse?.total === 0 
                      ? "No orders found" 
                      : "No orders match your filters"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {ordersResponse?.total === 0 
                      ? "No orders have been placed yet." 
                      : "Try adjusting your search criteria or clear the filters."}
                  </p>
                  {ordersResponse?.total !== ordersResponse?.filtered && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilter("all");
                        setDateFilter({ from: "", to: "" });
                        setCustomerEmailFilter("");
                      }}
                      data-testid="button-clear-all-filters"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map((order: Order) => {
              const orderItems = parseOrderItems(typeof order.orderItems === 'string' ? order.orderItems : JSON.stringify(order.orderItems || []));
              return (
                <Card key={order.id} className="bg-white dark:bg-gray-800 shadow-sm border-0 shadow-gray-200/50 dark:shadow-gray-800/50 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {order.id}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild data-testid={`button-view-order-${order.id}`}>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">Customer:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{order.customerName || order.customerEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">Created:</span>
                            <span className="text-gray-900 dark:text-white">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} at {order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-3">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(order.totalAmount), order.currency)}
                        </div>
                        <div className="flex gap-2 justify-end">
                          {getStatusBadge(order.paymentStatus, 'payment')}
                          {getStatusBadge(order.orderStatus, 'order')}
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    {orderItems.length > 0 && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">Items ({orderItems.length})</h4>
                        </div>
                        <div className="space-y-2">
                          {orderItems.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.name}</span>
                              <span className="text-gray-600 dark:text-gray-400">× {item.quantity}</span>
                            </div>
                          ))}
                          {orderItems.length > 3 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                              + {orderItems.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Status Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Refund Status:
                        </span>
                        {getStatusBadge(order.refundStatus || 'none', 'refund')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          Dispute Status:
                        </span>
                        {getStatusBadge(order.disputeStatus || 'none', 'dispute')}
                      </div>
                      {order.stripePaymentIntentId && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            Payment ID:
                          </span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {order.stripePaymentIntentId.slice(0, 20)}...
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Order Status Updates */}
                      {order.paymentStatus === 'completed' && order.orderStatus === 'processing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          disabled={updateStatusMutation.isPending}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
                          data-testid={`button-ship-order-${order.id}`}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {order.orderStatus === 'shipped' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-300 dark:border-green-700"
                          data-testid={`button-deliver-order-${order.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
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
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-300 dark:border-red-700"
                          data-testid={`button-refund-order-${order.id}`}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          {refundMutation.isPending ? 'Processing...' : 'Process Refund'}
                        </Button>
                      )}

                      {order.refundStatus === 'refunded' && (
                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Refunded
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}