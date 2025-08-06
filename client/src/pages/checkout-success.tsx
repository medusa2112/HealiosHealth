import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, User, Mail } from "lucide-react";
import { SEOHead } from "@/components/seo-head";

export default function CheckoutSuccess() {
  const [isGuest, setIsGuest] = useState(false);

  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");
  const orderId = urlParams.get("order_id");

  // Check if user is logged in
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["/auth/me"],
    retry: false,
  });

  // Get order details if available
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
    retry: false,
  });

  useEffect(() => {
    setIsGuest(!user);
  }, [user]);

  // Track conversion in Google Analytics if available
  useEffect(() => {
    if (sessionId && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: sessionId,
        currency: 'ZAR',
        value: order?.totalAmount || 0,
      });
    }
  }, [sessionId, order]);

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
                            <p className="text-xs text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">
                          R{(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Guest Registration Invite */}
        {isGuest && (
          <Card className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <User className="w-5 h-5" />
                Create Your Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-orange-700 dark:text-orange-300">
                Want to track your orders, save your preferences, and get personalized recommendations?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  asChild 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <a href={`/register?fromCheckout=true&email=${encodeURIComponent(order?.customerEmail || '')}`}>
                    Create Account
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/login">I Already Have an Account</a>
                </Button>
              </div>
              <div className="flex items-start gap-2 text-sm text-orange-600 dark:text-orange-400">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Your order will be automatically linked to your account when you register with the same email address.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logged-in User Message */}
        {!isGuest && user && (
          <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300">
                  Your order has been saved to your account. You can track its progress in your customer portal.
                </p>
              </div>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <a href="/portal">View My Orders</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mt-1">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You'll receive an email confirmation shortly with your order details.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2 mt-1">
                <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Processing & Shipping</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We'll process your order within 1-2 business days and send you tracking information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 mt-1">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Wellness Journey</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start enjoying your premium supplements and track your wellness progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild className="flex-1">
            <a href="/products">Continue Shopping</a>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}