import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Calendar, Package, CreditCard } from "lucide-react";
// Import auth context
import { useUser } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import type { ProductVariant } from "@shared/schema";

interface SubscriptionSectionProps {
  variant: ProductVariant;
  productName: string;
}

export function SubscriptionSection({ variant, productName }: SubscriptionSectionProps) {
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const intervals = [
    { value: 15, label: "Every 15 days", discount: 5 },
    { value: 30, label: "Every 30 days", discount: 10 },
    { value: 45, label: "Every 45 days", discount: 8 },
    { value: 60, label: "Every 60 days", discount: 5 }
  ];

  const selectedIntervalData = intervals.find(i => i.value === selectedInterval) || intervals[1];
  const discountedPrice = parseFloat(variant.price) * (1 - selectedIntervalData.discount / 100);
  const totalSavings = (parseFloat(variant.price) - discountedPrice) * quantity;

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to set up a subscription",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: variant.id,
          quantity,
          intervalDays: selectedInterval
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription checkout');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (error) {
      // // console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!variant.subscriptionEnabled) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 text-blue-600">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Subscribe & Save</h3>
            <p className="text-sm text-gray-600">Never run out with automatic refills</p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-800 border-green-200">
            Save up to 10%
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Delivery Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Delivery every:</label>
            <Select value={selectedInterval.toString()} onValueChange={(value) => setSelectedInterval(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervals.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{interval.label}</span>
                      <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                        {interval.discount}% off
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity per delivery:</label>
            <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} bottle{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white p-4 border border-blue-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Regular price:</span>
            <span className="text-sm line-through text-gray-500">
              R{(parseFloat(variant.price) * quantity).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Subscription price:</span>
            <span className="text-lg font-semibold text-green-600">
              R{(discountedPrice * quantity).toFixed(2)}
            </span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-green-600">You save:</span>
              <span className="text-sm font-semibold text-green-600">
                R{totalSavings.toFixed(2)} per delivery
              </span>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Flexible scheduling</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="h-4 w-4 text-blue-500" />
            <span>Free shipping</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span>Cancel anytime</span>
          </div>
        </div>

        <Separator className="my-4" />

        <Button 
          onClick={handleSubscribe}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Start Subscription - R{(discountedPrice * quantity).toFixed(2)}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          You can cancel or modify your subscription anytime in your account portal.
          First delivery within 3-5 business days.
        </p>
      </CardContent>
    </Card>
  );
}