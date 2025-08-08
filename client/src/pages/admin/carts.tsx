import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ShoppingCart, Users, DollarSign, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from '@/components/seo-head';
import { AdminHeader } from '@/components/admin-header';
import type { CartItem, AbandonedCart } from '@shared/types';

interface CartAnalytics {
  totalAbandoned: number;
  totalValue: number;
  avgValue: number;
  guestCarts: number;
  registeredCarts: number;
}

export default function AdminCarts() {
  const [timeRange, setTimeRange] = useState<string>("1");
  
  const { data: cartsData, isLoading: cartsLoading } = useQuery({
    queryKey: ['/api/admin/carts', 'abandoned', timeRange],
    queryFn: () => 
      fetch(`/api/admin/carts?hours=${timeRange}`, { credentials: 'include' })
        .then(res => res.json())
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/carts/analytics'],
    queryFn: () =>
      fetch('/api/admin/carts/analytics', { credentials: 'include' })
        .then(res => res.json())
  });

  const carts: AbandonedCart[] = cartsData?.carts || [];
  const analytics: CartAnalytics = cartsData?.analytics || { 
    totalAbandoned: 0, 
    totalValue: 0, 
    avgValue: 0, 
    guestCarts: 0, 
    registeredCarts: 0 
  };

  const getCartItems = (cart: AbandonedCart): CartItem[] => {
    try {
      return typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
    } catch {
      return [];
    }
  };

  const getCartValue = (cart: AbandonedCart): number => {
    const items = getCartItems(cart);
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const downloadCSV = () => {
    const headers = "Cart ID,User ID,Total Value,Last Updated,Items Count,Customer Type\n";
    const rows = carts.map(cart => {
      const items = getCartItems(cart);
      return [
        cart.id,
        cart.userId || "Guest",
        getCartValue(cart).toFixed(2),
        cart.lastUpdated,
        items.length,
        cart.userId ? "Registered" : "Guest"
      ].join(",");
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `abandoned-carts-${timeRange}h.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (cartsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Abandoned Cart Analytics - Admin | Healios"
        description="Track and analyze abandoned shopping carts to identify recovery opportunities in the Healios admin panel."
      />
      <AdminHeader 
        title="Abandoned Cart Analytics" 
        subtitle="Track and analyze abandoned shopping carts to identify recovery opportunities"
      />
      <div className="max-w-7xl mx-auto px-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Abandoned Cart Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and analyze abandoned shopping carts to identify recovery opportunities
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1h</SelectItem>
              <SelectItem value="6">Last 6h</SelectItem>
              <SelectItem value="24">Last 24h</SelectItem>
              <SelectItem value="72">Last 3d</SelectItem>
            </SelectContent>
          </Select>
          {carts.length > 0 && (
            <Button 
              onClick={downloadCSV} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">Total Abandoned</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">{analytics.totalAbandoned}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Carts not converted in selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              {formatCurrency(analytics.totalValue)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total potential revenue lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">Average Cart</CardTitle>
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              {formatCurrency(analytics.avgValue)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Average abandoned cart value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black dark:text-white">Customer Split</CardTitle>
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black dark:text-white">
              {analytics.guestCarts}/{analytics.registeredCarts}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Guest vs Registered customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Analytics */}
      {analyticsData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Abandonment Trends</CardTitle>
            <CardDescription>Cart abandonment across different time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(analyticsData).map(([period, data]: [string, any]) => (
                <div key={period} className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-bold text-black dark:text-white">{data.count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{period}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(data.value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abandoned Carts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black dark:text-white">
            Abandoned Carts ({timeRange}h period)
          </CardTitle>
          <CardDescription>
            {carts.length === 0 
              ? "No abandoned carts in the selected time period 🎉" 
              : `Showing ${carts.length} abandoned cart${carts.length !== 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No abandoned carts found</p>
              <p className="text-sm">All customers are completing their purchases!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carts.map((cart) => {
                const items = getCartItems(cart);
                const cartValue = getCartValue(cart);
                
                return (
                  <div key={cart.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-black dark:text-white">
                            Cart #{cart.id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {cart.userId ? (
                              <Badge variant="secondary">Registered User</Badge>
                            ) : (
                              <Badge variant="outline">Guest</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-black dark:text-white">
                          {formatCurrency(cartValue)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(cart.lastUpdated)}
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-black dark:text-white">
                        Cart Items ({items.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                            {item.quantity}x {item.name} • {formatCurrency(item.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                      <div>Created: {new Date(cart.createdAt).toLocaleString()}</div>
                      <div>Session: {cart.sessionToken.slice(-8)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}