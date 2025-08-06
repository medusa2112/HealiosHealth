import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";

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
  quizResults: Array<{
    id: string;
    completedAt: string;
    recommendationsCount: number;
  }>;
  stats: {
    totalOrders: number;
    totalSpent: number;
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
  items: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
  }>;
}

interface QuizResult {
  id: string;
  completedAt: string;
  answers: any;
  recommendations: any;
}

export default function CustomerPortal() {
  // Check auth status
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["/auth/me"],
    retry: false,
  });

  const { data: portalData, isLoading: portalLoading } = useQuery<CustomerPortalData>({
    queryKey: ["/portal"],
    enabled: !!user && user.role === 'customer',
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/portal/orders"],
    enabled: !!user && user.role === 'customer',
  });

  const { data: quizResults, isLoading: quizLoading } = useQuery<QuizResult[]>({
    queryKey: ["/portal/quiz-results"],
    enabled: !!user && user.role === 'customer',
  });

  // Redirect if not authenticated or not customer
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'customer')) {
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

  if (!user || user.role !== 'customer') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-red-600">Access denied</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'default';
      case 'pending':
      case 'processing':
        return 'secondary';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {portalData?.user.firstName} {portalData?.user.lastName}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="quiz">Quiz Results</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {portalLoading ? (
              <div className="text-black dark:text-white">Loading overview...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {portalData?.stats.totalOrders || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      R{portalData?.stats.totalSpent.toFixed(2) || '0.00'}
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
                      {portalData?.quizResults.length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {portalData?.orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="text-black dark:text-white">
                        <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-black dark:text-white">R{order.totalAmount}</div>
                        <Badge variant={getStatusColor(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </div>
                    </div>
                  )) || <div className="text-gray-600 dark:text-gray-400">No orders yet</div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Quiz History</CardTitle>
                </CardHeader>
                <CardContent>
                  {portalData?.quizResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="text-black dark:text-white">
                        <div className="font-medium">Wellness Quiz</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(result.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {result.recommendationsCount} recommendations
                      </Badge>
                    </div>
                  )) || <div className="text-gray-600 dark:text-gray-400">No quiz completions yet</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Order History</CardTitle>
                <CardDescription>View all your orders and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-black dark:text-white">Loading orders...</div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-black dark:text-white">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-black dark:text-white">
                              R{order.totalAmount}
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={getStatusColor(order.orderStatus)}>
                                {order.orderStatus}
                              </Badge>
                              <Badge variant={getStatusColor(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-black dark:text-white">
                                {item.name} x {item.quantity}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                R{item.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't placed any orders yet.
                    </div>
                    <Button
                      onClick={() => window.location.href = '/'}
                      className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    >
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Quiz Results</CardTitle>
                <CardDescription>Your wellness quiz completions and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                {quizLoading ? (
                  <div className="text-black dark:text-white">Loading quiz results...</div>
                ) : quizResults && quizResults.length > 0 ? (
                  <div className="space-y-4">
                    {quizResults.map((result) => (
                      <div key={result.id} className="border border-gray-200 dark:border-gray-700 rounded p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-black dark:text-white">
                            Wellness Quiz
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-black dark:text-white">
                            Recommendations: {JSON.parse(result.recommendations || '{}').primaryRecommendations?.length || 0} products
                          </p>
                          <Button 
                            variant="outline"
                            onClick={() => window.location.href = '/quiz'}
                            className="text-black dark:text-white border-gray-300 dark:border-gray-700"
                          >
                            Retake Quiz
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-600 dark:text-gray-400 mb-4">
                      You haven't completed the wellness quiz yet.
                    </div>
                    <Button
                      onClick={() => window.location.href = '/quiz'}
                      className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                    >
                      Take Quiz
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">Name</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">Role</p>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}