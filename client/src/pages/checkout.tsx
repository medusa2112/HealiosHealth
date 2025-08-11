// Removed Stripe Elements - now using external checkout
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShoppingBag, Tag, X } from 'lucide-react';
import { Link } from 'wouter';
import { SEOHead } from '@/components/seo-head';
import { apiRequest } from '@/lib/queryClient';

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// External checkout - no Stripe initialization needed

const CheckoutForm = () => {
  const { toast } = useToast();
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'shopify'>('stripe');
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: ''
  });
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percent' | 'fixed';
    value: string;
    discountAmount: number;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  // Calculate totals with discount
  const subtotal = cart.items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const discountAmount = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsValidatingDiscount(true);
    try {
      const response = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: discountCode.toUpperCase().trim(),
          subtotal 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid discount code');
      }

      const result = await response.json();
      setAppliedDiscount({
        code: result.code,
        type: result.type,
        value: result.value,
        discountAmount: result.discountAmount
      });
      
      toast({
        title: "Discount Applied!",
        description: `${result.type === 'percent' ? `${result.value}% off` : `R${result.discountAmount.toFixed(2)} off`} your order`,
      });
    } catch (error: any) {
      toast({
        title: "Invalid Discount Code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    toast({
      description: "Discount code removed",
    });
  };

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.email || !customerInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email and shipping address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        customerEmail: customerInfo.email,
        customerName: customerInfo.name || null,
        customerPhone: customerInfo.phone || null,
        shippingAddress: customerInfo.address,
        billingAddress: customerInfo.address,
        orderItems: JSON.stringify(cart.items),
        totalAmount: total.toFixed(2),
        discountCode: appliedDiscount?.code || null,
        discountAmount: discountAmount.toFixed(2),
        currency: 'ZAR',
        paymentStatus: 'pending',
        orderStatus: 'processing'
      };

      // Prepare line items for Stripe
      const lineItems = cart.items.map(item => ({
        price_data: {
          currency: 'zar',
          product_data: {
            name: item.product.name,
            images: [item.product.imageUrl],
            description: item.product.description?.substring(0, 100) || '',
          },
          unit_amount: Math.round(parseFloat(item.product.price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Create Stripe checkout session using the centralized API request with CSRF handling
      const response = await apiRequest('POST', '/api/create-checkout-session', {
        orderData,
        lineItems,
        successUrl: `${window.location.origin}/checkout-success`,
        cancelUrl: `${window.location.origin}/checkout`,
        sessionToken: localStorage.getItem('cart_session_token'),
      });

      const { sessionUrl } = await response.json();
      
      // Clear cart before redirecting
      clearCart();
      
      // Redirect to Stripe Checkout
      window.location.href = sessionUrl;
      
    } catch (error) {
      console.error('Stripe checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error creating your checkout session. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleShopifyCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        customerEmail: customerInfo.email,
        customerName: customerInfo.name || null,
        customerPhone: customerInfo.phone || null,
        shippingAddress: customerInfo.address || 'To be collected at checkout',
        billingAddress: customerInfo.address || 'To be collected at checkout',
        orderItems: JSON.stringify(cart.items),
        totalAmount: total.toFixed(2),
        discountCode: appliedDiscount?.code || null,
        discountAmount: discountAmount.toFixed(2),
        currency: 'ZAR',
        paymentStatus: 'pending',
        orderStatus: 'processing'
      };

      // Create Shopify checkout
      const response = await fetch('/api/create-shopify-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          returnUrl: `${window.location.origin}/order-confirmation`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Shopify checkout');
      }

      const { checkoutUrl } = await response.json();
      
      // Clear cart before redirecting
      clearCart();
      
      // Redirect to Shopify
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Shopify checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "There was an error creating your Shopify checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };



  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="font-medium text-sm">{item.product.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium">R{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <Separator />
          
          {/* Discount Code Section */}
          <div className="space-y-3">
            {!appliedDiscount ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleApplyDiscount}
                  disabled={isValidatingDiscount || !discountCode.trim()}
                  className="px-4"
                >
                  {isValidatingDiscount ? 'Validating...' : 'Apply'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="font-mono text-sm font-medium">{appliedDiscount.code}</span>
                  <span className="text-sm text-green-600">
                    -{appliedDiscount.type === 'percent' ? `${appliedDiscount.value}%` : `R${appliedDiscount.discountAmount.toFixed(2)}`}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDiscount}
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Order Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex items-center justify-between text-green-600">
                <span>Discount ({appliedDiscount.code}):</span>
                <span>-R{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="font-medium">Contact Information</h4>
              <input
                type="email"
                placeholder="Email address *"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full p-3 border border-gray-300 focus:border-black focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Full name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full p-3 border border-gray-300 focus:border-black focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 focus:border-black focus:outline-none"
              />
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h4 className="font-medium">Shipping Address</h4>
              <textarea
                placeholder="Full shipping address including postal code *"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                className="w-full p-3 border border-gray-300 focus:border-black focus:outline-none h-24 resize-none"
                required
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Choose Payment Method</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                    className="w-4 h-4"
                  />
                  <span>Stripe Checkout</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="shopify"
                    checked={paymentMethod === 'shopify'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'shopify')}
                    className="w-4 h-4"
                  />
                  <span>Shopify Checkout</span>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isProcessing}
              onClick={paymentMethod === 'stripe' ? handleStripeCheckout : handleShopifyCheckout}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-medium"
            >
              {isProcessing ? "Redirecting..." : `Continue to ${paymentMethod === 'stripe' ? 'Stripe' : 'Shopify'} - R${total.toFixed(2)}`}
            </Button>
            
            <p className="text-sm text-gray-600 text-center">
              You'll be redirected to {paymentMethod === 'stripe' ? 'Stripe' : 'Shopify'} to complete your secure payment.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function CheckoutPage() {
  const { cart } = useCart();

  // Calculate total amount
  const totalAmount = cart.items.reduce((sum, item) => 
    sum + parseFloat(item.product.price) * item.quantity, 0
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Google Ads - Begin Checkout Conversion
    if (typeof window !== 'undefined' && window.gtag && cart.items.length > 0) {
      window.gtag('event', 'begin_checkout', {
        currency: 'ZAR',
        value: totalAmount,
        send_to: 'AW-CONVERSION_ID/BEGIN_CHECKOUT_LABEL', // Replace with your actual conversion ID
        items: cart.items.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          category: item.product.category || 'Supplements',
          quantity: item.quantity,
          price: parseFloat(item.product.price)
        }))
      });
    }
  }, [cart.items, totalAmount]);

  if (cart.items.length === 0) {
    return (
      <>
        <SEOHead 
          title="Checkout | Healios"
          description="Complete your purchase of premium Healios supplements"
        />
        
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="container mx-auto px-4 pt-5 pb-8">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">Add some products to your cart before checking out.</p>
              <Link href="/">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Removed loading state - no payment intent needed for external checkout

  return (
    <>
      <SEOHead 
        title="Checkout | Healios"
        description="Complete your purchase of premium Healios supplements"
      />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 pt-5 pb-8">
          {/* Back Button */}
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Choose your preferred payment method to complete your purchase securely
            </p>
          </div>

          <CheckoutForm />
        </div>
      </div>
    </>
  );
}