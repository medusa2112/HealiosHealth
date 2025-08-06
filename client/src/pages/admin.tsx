import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import AdminProducts from "./admin-products";

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalQuizCompletions: number;
  recentOrders: any[];
  lowStockProducts: Product[];
}

interface QuizAnalytics {
  totalCompletions: number;
  recentCompletions: Array<{
    id: string;
    name: string;
    email: string;
    completedAt: string;
    consentToMarketing: boolean;
  }>;
}

export default function AdminDashboard() {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newStock, setNewStock] = useState<number>(0);
  const queryClient = useQueryClient();

  // Check auth status
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["/auth/me"],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/admin"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/admin/products"],
    enabled: !!user && user.role === 'admin',
  });

  const { data: quizAnalytics, isLoading: quizLoading } = useQuery<QuizAnalytics>({
    queryKey: ["/admin/quiz/analytics"],
    enabled: !!user && user.role === 'admin',
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return apiRequest(`/admin/products/${productId}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/admin"] });
      setSelectedProductId("");
      setNewStock(0);
    },
  });

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductId && newStock >= 0) {
      updateStockMutation.mutate({ productId: selectedProductId, quantity: newStock });
    }
  };

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      window.location.href = '/login';
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-red-600">Access denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="product-crud">Product CRUD</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {statsLoading ? (
              <div className="text-black dark:text-white">Loading stats...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {stats?.totalProducts || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {stats?.totalOrders || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Quiz Completions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {stats?.totalQuizCompletions || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Low Stock Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.lowStockProducts?.length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Low Stock Alert</CardTitle>
                  <CardDescription>Products with less than 5 items in stock</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.lowStockProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-3 border border-red-200 dark:border-red-800 rounded">
                        <span className="text-black dark:text-white">{product.name}</span>
                        <Badge variant="destructive">{product.stockQuantity} left</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Update Stock</CardTitle>
                  <CardDescription>Manage product inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateStock} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-select" className="text-black dark:text-white">
                        Select Product
                      </Label>
                      <select
                        id="product-select"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-black dark:text-white"
                        required
                      >
                        <option value="">Choose a product...</option>
                        {products?.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} (Current: {product.stockQuantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-stock" className="text-black dark:text-white">
                        New Stock Quantity
                      </Label>
                      <Input
                        id="new-stock"
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                        className="bg-white dark:bg-gray-900 text-black dark:text-white"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={updateStockMutation.isPending || !selectedProductId}
                      className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    >
                      {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Product List</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="text-black dark:text-white">Loading products...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {products?.map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded">
                          <div className="text-black dark:text-white">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              R{product.price}
                            </div>
                          </div>
                          <Badge variant={product.inStock ? "default" : "destructive"}>
                            {product.stockQuantity} in stock
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Order Management</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 dark:text-gray-400">
                  Order management features will be implemented in the next phase.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="product-crud">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Quiz Analytics</CardTitle>
                  <CardDescription>Wellness quiz completion statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  {quizLoading ? (
                    <div className="text-black dark:text-white">Loading analytics...</div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-black dark:text-white">
                          {quizAnalytics?.totalCompletions || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total quiz completions
                        </div>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {quizAnalytics?.recentCompletions?.map((completion) => (
                          <div key={completion.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                            <div className="text-black dark:text-white">
                              <div className="font-medium">{completion.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {completion.email}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(completion.completedAt).toLocaleDateString()}
                              </div>
                              {completion.consentToMarketing && (
                                <Badge variant="secondary">Marketing OK</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}