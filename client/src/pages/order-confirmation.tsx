import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { SEOHead } from '@/components/seo-head';

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface Order {
  id: string;
  customerEmail: string;
  totalAmount: string;
  orderItems: string;
  shippingAddress: string;
  createdAt: string;
  paymentStatus: string;
  orderStatus: string;
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Get PayStack reference from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('trxref');
    const orderId = urlParams.get('order_id');
    
    if (reference) {
      // Verify PayStack payment
      verifyPaystackPayment(reference);
    } else if (orderId) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
    }

    // Google Ads Conversion Tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId || 'unknown',
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL' // Replace with your actual conversion ID
      });
    }
  }, []);

  const verifyPaystackPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/paystack/verify/${reference}`);
      if (response.ok) {
        const result = await response.json();
        if (result.order) {
          setOrder(result.order);
        }
      }
    } catch (error) {
      console.error('Failed to verify PayStack payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseOrderItems = (orderItemsJson: string) => {
    try {
      return JSON.parse(orderItemsJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <SEOHead 
          title="Loading Order - Healios"
          description="Loading your order confirmation"
        />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Order Confirmed - Healios"
        description="Your Healios order has been confirmed and is being processed."
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. We'll send you shipping details once your order is on its way.
            </p>
          </div>

          {order && (
            <>
              {/* Order Details Card */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Order Number</p>
                      <p className="text-gray-600">#{order.id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order Date</p>
                      <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{order.customerEmail}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Total</p>
                      <p className="font-semibold text-gray-900">R{parseFloat(order.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Ordered */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parseOrderItems(order.orderItems).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">R{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">
                    {order.shippingAddress}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* What's Next */}
          <Card className="mb-8 bg-black text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">What's Next?</h3>
              <div className="space-y-2 text-sm">
                <p>• We'll process your order within 1-2 business days</p>
                <p>• You'll receive tracking information via email</p>
                <p>• Standard delivery takes 3-5 business days</p>
                <p>• Questions? Contact us at support@thehealios.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
            <Link href="/products">
              <Button className="bg-black hover:bg-gray-800">
                View All Products
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}