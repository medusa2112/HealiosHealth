import { useEffect } from 'react';
import { Link } from 'wouter';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEOHead } from '@/components/seo-head';

export default function OrderConfirmationPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <SEOHead 
        title="Order Confirmation | Healios"
        description="Thank you for your purchase! Your Healios supplements are on their way."
      />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Order Confirmed!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for choosing Healios. Your order has been successfully processed.
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Package className="w-5 h-5" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-healios-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Order Processing</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      We'll prepare your supplements with care and attention to quality.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-healios-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Shipping</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Free UK delivery on orders over £25. Your package will arrive within 2-3 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-healios-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Confirmation</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      You'll receive an email confirmation with tracking information shortly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 mb-8">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Our customer support team is here to help with any questions about your order.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: support@healios.com | Phone: 0800 123 4567
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/account" className="flex-1">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  View Order History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}