import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { Link } from "wouter";
import { ShoppingCart, Package, Users, DollarSign, FileText, Percent, TrendingUp, Mail, Shield } from "lucide-react";

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalQuizCompletions: number;
  cartAbandonmentRate: number;
  activeUsers: number;
  recentOrders: any[];
  lowStockProducts: Product[];
  _metadata?: {
    queryLimit: number;
    ordersCount: number;
    productsCount: number;
    performanceWarning: string | null;
  };
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

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: quizAnalytics, isLoading: quizLoading } = useQuery<QuizAnalytics>({
    queryKey: ["/api/admin/quiz/analytics"],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      return apiRequest("PUT", `/api/admin/products/${productId}/stock`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats?.totalOrders?.toLocaleString() || 0}
                </div>
                {stats?._metadata?.performanceWarning && (
                  <div className="text-xs text-amber-600 mt-1">⚠️ Large dataset</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </CardTitle>
                <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R{stats?.totalRevenue?.toLocaleString() || '0.00'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Completed orders only
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </CardTitle>
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.activeUsers?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last 30 days
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cart Abandonment
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats?.cartAbandonmentRate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last 30 days
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Quiz Completions
                </CardTitle>
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {quizAnalytics?.totalCompletions || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total completions
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Products
                </CardTitle>
                <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black dark:text-white">
                  {stats?.totalProducts?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Active products
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Quick Actions</CardTitle>
            <CardDescription>Frequently used admin functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/products">
                <Button className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 w-full">
                  <Package className="w-5 h-5 mr-2" />
                  <span className="text-sm">Manage Products</span>
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span className="text-sm">View Orders</span>
                </Button>
              </Link>
              <Link href="/admin/discount-codes">
                <Button variant="outline" className="w-full">
                  <Percent className="w-5 h-5 mr-2" />
                  <span className="text-sm">Discount Codes</span>
                </Button>
              </Link>
              <Link href="/admin/bundles">
                <Button variant="outline" className="w-full">
                  <Package className="w-5 h-5 mr-2" />
                  <span className="text-sm">Product Bundles</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

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

        {/* Quiz Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quiz Analytics
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Recent wellness quiz completions and engagement metrics
            </CardDescription>
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
    </div>
  );
}