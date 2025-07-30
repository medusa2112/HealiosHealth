import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Package, AlertTriangle, TrendingUp, Mail, Eye, Edit3 } from 'lucide-react';
import { SEOHead } from '@/components/seo-head';
import { type Product, type Order, type StockAlert } from '@shared/schema';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch data
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: stockAlerts = [], isLoading: alertsLoading } = useQuery<StockAlert[]>({
    queryKey: ['/api/stock-alerts'],
  });

  // Update stock mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Failed to update stock');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock-alerts'] });
      toast({ title: 'Success', description: 'Stock updated successfully' });
      setStockUpdates({});
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
    },
  });

  // Send alert mutation
  const sendAlertMutation = useMutation({
    mutationFn: async (alertData: { productId: string; productName: string; currentStock: number }) => {
      const response = await fetch('/api/stock-alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      if (!response.ok) throw new Error('Failed to send alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stock-alerts'] });
      toast({ title: 'Success', description: 'Stock alert sent successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send alert', variant: 'destructive' });
    },
  });

  const handleStockUpdate = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    updateStockMutation.mutate({ productId, quantity });
  };

  const handleSendAlert = (product: Product) => {
    sendAlertMutation.mutate({
      productId: product.id,
      productName: product.name,
      currentStock: product.stockQuantity || 0,
    });
  };

  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) <= 3);
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0);
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);

  if (productsLoading || alertsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead title="Admin Dashboard - Healios" description="Manage inventory and orders" />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="Admin Dashboard - Healios" description="Manage inventory and orders" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage inventory, orders, and stock alerts</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Active Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.productName}</h4>
                      <p className="text-sm text-gray-600">Current stock: {alert.currentStock} units</p>
                      <p className="text-xs text-gray-500">Alert created: {new Date(alert.createdAt || '').toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.alertSent ? "secondary" : "destructive"}>
                        {alert.alertSent ? "Sent" : "Pending"}
                      </Badge>
                      {!alert.alertSent && (
                        <Button
                          size="sm"
                          onClick={() => handleSendAlert(products.find(p => p.id === alert.productId)!)}
                          disabled={sendAlertMutation.isPending}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Send Alert
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Inventory Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">Price: R{product.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={product.inStock ? "default" : "secondary"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {(product.stockQuantity || 0) <= 3 && (product.stockQuantity || 0) > 0 && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Stock:</span>
                      <Input
                        type="number"
                        min="0"
                        value={stockUpdates[product.id] ?? product.stockQuantity ?? 0}
                        onChange={(e) => setStockUpdates({
                          ...stockUpdates,
                          [product.id]: parseInt(e.target.value) || 0
                        })}
                        className="w-20"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStockUpdate(product.id, stockUpdates[product.id] ?? product.stockQuantity ?? 0)}
                        disabled={updateStockMutation.isPending}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                      
                      {(product.stockQuantity || 0) <= 3 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendAlert(product)}
                          disabled={sendAlertMutation.isPending}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Alert
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}