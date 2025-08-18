import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, User, Mail } from "lucide-react";
import { SEOHead } from "@/components/seo-head";
import { Link } from "wouter";

interface Order {
  id: string;
  customerEmail: string;
  totalAmount: string;
  orderItems: string;
  orderStatus?: string;
}

export default function CheckoutSuccess() {
  const [isGuest, setIsGuest] = useState(false);

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  const orderId = urlParams.get("order_id");

  // Check if user is logged in
  const { data: user, isLoading: authLoading } = useQuery<any>({
    queryKey: ["/auth/me"],
    retry: false,
  });

  // Get order details if available
  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
    retry: false,
  });

  useEffect(() => {
    setIsGuest(!user);
  }, [user]);

  // Track conversion in Google Analytics if available
  useEffect(() => {
    if ((sessionId || orderId) && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId || sessionId,
        currency: 'ZAR',
        value: order?.totalAmount || 0,
      });
    }
  }, [sessionId, orderId, order]);

  if (authLoading || orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-black dark:text-white">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEOHead 
        title="Order Confirmation - Healios"
        description="Thank you for your order. Your wellness journey with Healios continues."
      />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your wellness journey with Healios continues
          </p>
        </div>

        {/* Order Details Card */}
        {order && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                  <p className="font-mono text-sm">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="font-semibold">R{parseFloat(order.totalAmount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-sm">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {order.orderStatus || 'Processing'}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              {order.orderItems && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Items Ordered</p>
                  <div className="space-y-2">
                    {JSON.parse(order.orderItems).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {item.product?.imageUrl && (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product?.name || 'Product'} 
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{item.product?.name || 'Product'}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium">R{item.product?.price ? (parseFloat(item.product.price) * item.quantity).toFixed(2) : '0.00'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-black dark:text-white">Order Confirmation</p>
                <p>You'll receive an email confirmation shortly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-black dark:text-white">Processing</p>
                <p>We'll prepare your order for shipping within 24-48 hours.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-black dark:text-white">Shipping</p>
                <p>You'll receive tracking information once your order ships.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest Registration */}
        {isGuest && order && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <h3 className="font-semibold text-black dark:text-white mb-1">Create Your Account</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Track your orders and get personalized wellness recommendations by creating an account with {order.customerEmail}.
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
          {!isGuest && (
            <Link href="/portal/orders">
              <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                View My Orders
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}