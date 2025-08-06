import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Package, Calendar, CreditCard, X, RotateCcw } from "lucide-react";
import type { Subscription, ProductVariant, Product } from "@shared/schema";

interface SubscriptionWithDetails extends Subscription {
  variant: ProductVariant & {
    product: Product;
  };
}

export default function PortalSubscriptions() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['/api/subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json() as Promise<SubscriptionWithDetails[]>;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to cancel subscription');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Subscription canceled", description: "Your subscription will end at the current billing period" });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" });
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reactivate subscription');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Subscription reactivated", description: "Your subscription is now active again" });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reactivate subscription", variant: "destructive" });
    }
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Paused</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation('/portal')} className="hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">My Subscriptions</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => setLocation('/portal')} className="hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">My Subscriptions</h1>
          <p className="text-gray-600">Manage your auto-refill subscriptions</p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active subscriptions</h3>
          <p className="text-gray-600 mb-6">
            You don't have any active subscriptions yet. Browse our products to set up auto-refill.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={subscription.variant.imageUrl || subscription.variant.product.imageUrl}
                      alt={subscription.variant.product.name}
                      className="w-16 h-16 object-cover"
                    />
                    <div>
                      <CardTitle className="text-lg">{subscription.variant.product.name}</CardTitle>
                      <p className="text-sm text-gray-600">{subscription.variant.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(subscription.status)}
                        <span className="text-sm text-gray-500">
                          Every {subscription.intervalDays} days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">R{subscription.variant.price}</p>
                    <p className="text-sm text-gray-600">per delivery</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Started</p>
                      <p className="text-gray-600">{formatDate(subscription.startDate)}</p>
                    </div>
                  </div>

                  {subscription.currentPeriodEnd && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Next Billing</p>
                        <p className="text-gray-600">{formatDate(subscription.currentPeriodEnd)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Payment</p>
                      <p className="text-gray-600">Credit Card</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {subscription.status === 'active' && !subscription.cancelAt && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this subscription? You'll continue to receive 
                            deliveries until the end of your current billing period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Active</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelMutation.mutate(subscription.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Cancel Subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {subscription.status === 'active' && subscription.cancelAt && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => reactivateMutation.mutate(subscription.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reactivate
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (subscription.variant.productId) {
                        setLocation(`/products/${subscription.variant.productId}`);
                      }
                    }}
                  >
                    View Product
                  </Button>
                </div>

                {subscription.cancelAt && (
                  <div className="bg-orange-50 border border-orange-200 p-3 text-sm text-orange-800">
                    <strong>Cancellation scheduled:</strong> Your subscription will end on {formatDate(subscription.cancelAt)}. 
                    You can reactivate it until then.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}