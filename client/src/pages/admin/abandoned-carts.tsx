import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Send, ShoppingCart, Clock, DollarSign, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CartItem, AbandonedCart } from '@shared/types';

import { useLocation } from "wouter";

interface CartStats {
  totalAbandoned: number;
  totalValue: number;
  averageValue: number;
  recoveryRate: number;
}

export default function AbandonedCartsPage() {
  const [, setLocation] = useLocation();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<CartStats | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('24');
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());
  const [emailPreview, setEmailPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAbandonedCarts();
  }, [timeFilter]);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/abandoned-carts?hours=${timeFilter}`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // Admin authentication lost, redirect to login
        setLocation('/admin/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setCarts(data.carts || []);
      
      // Ensure all stats values are numbers
      const stats = data.stats || {};
      setStats({
        totalAbandoned: typeof stats.totalAbandoned === 'number' ? stats.totalAbandoned : 0,
        totalValue: typeof stats.totalValue === 'number' ? stats.totalValue : 0,
        averageValue: typeof stats.averageValue === 'number' ? stats.averageValue : 0,
        recoveryRate: typeof stats.recoveryRate === 'number' ? stats.recoveryRate : 0
      });
    } catch (error) {
      // // console.error('Error fetching abandoned carts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch abandoned carts data",
        variant: "destructive",
      });
      setCarts([]);
      setStats({ totalAbandoned: 0, totalValue: 0, averageValue: 0, recoveryRate: 0 });
    } finally {
      setLoading(false);
    }
  };

  const sendRecoveryEmail = async (cartId: string, cartData: AbandonedCart) => {
    try {
      setSendingEmails(prev => new Set(prev).add(cartId));
      
      const response = await fetch('/api/admin/send-recovery-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          cartId,
          sessionToken: cartData.sessionToken,
          items: cartData.items,
          totalAmount: cartData.totalAmount
        })
      });

      if (!response.ok) throw new Error('Failed to send recovery email');

      toast({
        title: "Recovery Email Sent",
        description: "Cart recovery email has been sent successfully",
      });
      
      // Refresh data
      await fetchAbandonedCarts();
    } catch (error) {
      // // console.error('Error sending recovery email:', error);
      toast({
        title: "Error",
        description: "Failed to send recovery email",
        variant: "destructive",
      });
    } finally {
      setSendingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };
  
  const previewEmail = async (cartId: string, emailType: 'abandoned_cart_1h' | 'abandoned_cart_24h' = 'abandoned_cart_1h') => {
    try {
      const response = await fetch('/api/admin/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, emailType })
      });

      if (!response.ok) throw new Error('Failed to generate email preview');

      const data = await response.json();
      setEmailPreview(data.preview);
      setShowPreview(true);
    } catch (error) {
      // // console.error('Error previewing email:', error);
      toast({
        title: "Error",
        description: "Failed to generate email preview",
        variant: "destructive",
      });
    }
  };
  
  const cleanupExpiredCarts = async () => {
    try {
      const response = await fetch('/api/admin/cleanup-expired', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to cleanup expired carts');

      const data = await response.json();
      toast({
        title: "Cleanup Complete",
        description: `Cleaned up ${data.expiredCount} expired carts`,
      });
      
      // Refresh data
      await fetchAbandonedCarts();
    } catch (error) {
      // // console.error('Error cleaning up carts:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup expired carts",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  const parseCartItems = (itemsJson: string): CartItem[] => {
    try {
      const parsed = JSON.parse(itemsJson);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          id: item.product?.id || item.id,
          productId: item.product?.id || item.productId,
          productName: item.product?.name || item.productName,
          quantity: item.quantity || 1,
          price: parseFloat(item.product?.price || item.price || '0')
        }));
      }
      return [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Abandoned Carts</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Abandoned Carts</h1>
          <p className="text-gray-600">Track and recover abandoned shopping carts</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Hour</SelectItem>
              <SelectItem value="24">Last 24 Hours</SelectItem>
              <SelectItem value="72">Last 3 Days</SelectItem>
              <SelectItem value="168">Last Week</SelectItem>
              <SelectItem value="720">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAbandonedCarts}>Refresh</Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalAbandoned !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Abandoned</p>
                  <p className="text-2xl font-bold">{stats.totalAbandoned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">R{(typeof stats.totalValue === 'number' ? stats.totalValue : 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Value</p>
                  <p className="text-2xl font-bold">R{(typeof stats.averageValue === 'number' ? stats.averageValue : 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
                  <p className="text-2xl font-bold">{(typeof stats.recoveryRate === 'number' ? stats.recoveryRate : 0).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abandoned Carts List */}
      <Card>
        <CardHeader>
          <CardTitle>Abandoned Carts ({carts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {carts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No abandoned carts found</p>
              <p className="text-gray-400">Great job! All customers completed their purchases.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carts.map((cart) => {
                const items = parseCartItems(cart.items as any);
                const isRecovered = cart.convertedToOrder;
                
                return (
                  <div 
                    key={cart.id} 
                    className={`p-4 border rounded-lg ${isRecovered ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">
                            Cart #{cart.sessionToken.slice(-8)}
                          </p>
                          {isRecovered && (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              Recovered
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Created: {formatTimeAgo(cart.createdAt)} • 
                          Last Updated: {formatTimeAgo(cart.lastUpdated || cart.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          R{typeof cart.totalAmount === 'number' ? cart.totalAmount.toFixed(2) : (cart.totalAmount || '0.00')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="mb-3">
                      <div className="space-y-2">
                        {items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.productName || 'Unknown Product'}
                            </span>
                            <span>R{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isRecovered && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => sendRecoveryEmail(cart.id, cart)}
                          disabled={sendingEmails.has(cart.id)}
                        >
                          {sendingEmails.has(cart.id) ? (
                            <Clock className="w-4 h-4 mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Send Recovery Email
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}