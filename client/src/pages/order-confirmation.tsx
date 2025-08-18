import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowLeft, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
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
  customerName?: string;
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

  const parseAddress = (addressString: string) => {
    try {
      const address = JSON.parse(addressString);
      return {
        name: order?.customerName || 'Customer',
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'South Africa'
      };
    } catch (error) {
      return {
        name: order?.customerName || 'Customer',
        line1: addressString || '',
        line2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'South Africa'
      };
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

              {/* Items Ordered - Compressed View */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parseOrderItems(order.orderItems).length > 0 ? (
                      parseOrderItems(order.orderItems).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-3">
                            {/* Product Image - Smaller for compressed view */}
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                              {item.imageUrl || item.product?.imageUrl ? (
                                <img
                                  src={item.imageUrl || item.product?.imageUrl || '/objects/placeholder-product.jpg'}
                                  alt={item.productName || item.product?.name || 'Product'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/objects/placeholder-product.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 text-sm leading-5 truncate">
                                {item.productName || item.product?.name || 'Product'}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                Qty: {item.quantity} × R{parseFloat(item.price || item.product?.price || '0').toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-sm text-gray-900">
                              R{(parseFloat(item.price || item.product?.price || '0') * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No items found in this order</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Order Total: <span className="font-semibold">R{parseFloat(order.totalAmount).toFixed(2)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Summary */}
                  {parseOrderItems(order.orderItems).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Order Total</span>
                        <span className="text-lg font-bold text-gray-900">R{parseFloat(order.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const address = parseAddress(order.shippingAddress);
                    return (
                      <div className="space-y-1 text-gray-700">
                        <p className="font-medium">{address.name}</p>
                        <p>{address.line1}</p>
                        {address.line2 && <p>{address.line2}</p>}
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.country}</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </>
          )}

          {/* What's Next */}
          <Card className="mb-8 bg-black text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
              <div className="space-y-2 text-sm mb-6">
                <p>• We'll process your order within 1-2 business days</p>
                <p>• You'll receive tracking information via email</p>
                <p>• Standard delivery takes 3-5 business days</p>
                <p>• Your order will be carefully packaged for safe delivery</p>
              </div>
              
              <div className="border-t border-gray-600 pt-4">
                <h4 className="font-semibold mb-3">Need Help? Contact Support</h4>
                <div className="space-y-3 text-sm">
                  <a 
                    href="mailto:support@thehealios.com" 
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    support@thehealios.com
                  </a>
                  <a 
                    href="tel:+27123456789" 
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    +27 12 345 6789
                  </a>
                  <button 
                    onClick={() => {
                      // You can integrate with a chat widget here (e.g., Intercom, Zendesk, Crisp)
                      // For now, opens email client with pre-filled subject
                      window.location.href = `mailto:support@thehealios.com?subject=Order Support - ${order?.id ? '#' + order.id.slice(-8) : 'General'}`;
                    }}
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Live Chat Support
                  </button>
                </div>
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