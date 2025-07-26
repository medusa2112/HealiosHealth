import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { SEOHead } from '@/components/seo-head';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order-confirmation',
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Clear cart on successful payment
      clearCart();
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your order is being processed.",
      });
    }

    setIsProcessing(false);
  };

  const total = cart.items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

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
              <p className="font-medium">£{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total:</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-medium"
            >
              {isProcessing ? "Processing..." : `Pay £${total.toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const { cart } = useCart();
  const { toast } = useToast();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Calculate total amount
  const totalAmount = cart.items.reduce((sum, item) => 
    sum + parseFloat(item.product.price) * item.quantity, 0
  );

  useEffect(() => {
    if (cart.items.length > 0 && totalAmount > 0) {
      // Create PaymentIntent as soon as the page loads
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            toast({
              title: "Error",
              description: "Failed to initialize payment. Please try again.",
              variant: "destructive",
            });
          }
        })
        .catch((error) => {
          console.error('Payment intent error:', error);
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [cart.items, totalAmount, toast]);

  if (cart.items.length === 0) {
    return (
      <>
        <SEOHead 
          title="Checkout | Healios"
          description="Complete your purchase of premium Healios supplements"
        />
        
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-8">
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

  if (!clientSecret) {
    return (
      <>
        <SEOHead 
          title="Checkout | Healios"
          description="Complete your purchase of premium Healios supplements"
        />
        
        <div className="min-h-screen bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Preparing your checkout...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Checkout | Healios"
        description="Complete your purchase of premium Healios supplements"
      />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
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
              Complete your purchase securely with Stripe
            </p>
          </div>

          {/* Make SURE to wrap the form in <Elements> which provides the stripe context. */}
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </>
  );
}