import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, Users, ShoppingCart, Activity, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";


interface ReorderLog {
  id: string;
  userId: string;
  originalOrderId: string;
  newOrderId?: string;
  status: string;
  reorderType: string;
  channel: string;
  itemsCount: number;
  originalAmount: number;
  newAmount?: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export default function ReorderAnalyticsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [limit, setLimit] = useState(100);

  // Fetch reorder logs with filtering
  const { data: reorderLogs, isLoading } = useQuery<ReorderLog[]>({
    queryKey: ["/api/admin/reorder-logs", { status: statusFilter, channel: channelFilter, limit }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch reorder analytics summary
  const { data: analytics } = useQuery<{
    totalReorders: number;
    completedReorders: number;
    conversionRate: number;
    totalReorderValue: number;
    avgReorderValue: number;
    topChannels: Array<{ channel: string; count: number; value: number }>;
    reordersByStatus: Array<{ status: string; count: number }>;
    dailyReorders: Array<{ date: string; count: number; value: number }>;
  }>({
    queryKey: ["/api/admin/reorder-analytics"],
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-white";
    switch (status) {
      case 'completed': return <Badge className={`${baseClasses} bg-green-600`}>Completed</Badge>;
      case 'initiated': return <Badge className={`${baseClasses} bg-blue-600`}>Initiated</Badge>;
      case 'checkout_created': return <Badge className={`${baseClasses} bg-yellow-600`}>Checkout Created</Badge>;
      case 'failed': return <Badge className={`${baseClasses} bg-red-600`}>Failed</Badge>;
      case 'cancelled': return <Badge className={`${baseClasses} bg-gray-600`}>Cancelled</Badge>;
      default: return <Badge className={`${baseClasses} bg-gray-500`}>{status}</Badge>;
    }
  };

  const getChannelBadge = (channel: string) => {
    const channelColors: Record<string, string> = {
      customer_portal: 'bg-blue-600',
      customer_portal_authenticated: 'bg-green-600',
      admin_panel: 'bg-purple-600',
      automated: 'bg-orange-600',
      api: 'bg-indigo-600'
    };
    
    return (
      <Badge className={`text-white ${channelColors[channel] || 'bg-gray-600'}`}>
        {channel.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading reorder analytics...</div>
      </div>
    );
  }



  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Phase 13: Reorder Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive reorder tracking, funnel analytics, and email automation insights
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              Back to Admin
            </Button>
          </Link>
        </div>

        {/* Analytics Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {analytics.completedReorders}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Completed Reorders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {(analytics.conversionRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      R{analytics.totalReorderValue.toFixed(2)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Total Reorder Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-black dark:text-white">
                      R{analytics.avgReorderValue.toFixed(2)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">Avg Reorder Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-900">
            <TabsTrigger value="logs">Reorder Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Trends</TabsTrigger>
            <TabsTrigger value="email-tracking">Email Tracking</TabsTrigger>
          </TabsList>

          {/* Reorder Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Reorder Logs & Tracking</span>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="initiated">Initiated</SelectItem>
                        <SelectItem value="checkout_created">Checkout Created</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={channelFilter} onValueChange={setChannelFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="customer_portal">Customer Portal</SelectItem>
                        <SelectItem value="customer_portal_authenticated">Authenticated Portal</SelectItem>
                        <SelectItem value="admin_panel">Admin Panel</SelectItem>
                        <SelectItem value="automated">Automated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reorderLogs && reorderLogs.length > 0 ? (
                  <div className="space-y-4">
                    {reorderLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-black dark:text-white">
                                Reorder #{log.id.slice(0, 8)}
                              </p>
                              {getStatusBadge(log.status)}
                              {getChannelBadge(log.channel)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Original Order: {log.originalOrderId.slice(0, 8)}
                              {log.newOrderId && ` → New Order: ${log.newOrderId.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              User: {log.userId.slice(0, 8)} | 
                              Items: {log.itemsCount} | 
                              {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-black dark:text-white">
                              {log.newAmount ? `R${log.newAmount.toFixed(2)}` : 'Pending'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Original: R{log.originalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 text-sm">
                            <p className="font-medium text-black dark:text-white mb-2">Metadata:</p>
                            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                              {Object.entries(log.metadata).map(([key, value]) => {
                                // Sanitize metadata display to prevent XSS
                                const sanitizedKey = String(key).replace(/[<>'"&]/g, '');
                                const sanitizedValue = typeof value === 'object' 
                                  ? JSON.stringify(value).replace(/[<>'"&]/g, '') 
                                  : String(value).replace(/[<>'"&]/g, '');
                                
                                return (
                                  <div key={key}>
                                    <span className="font-medium">{sanitizedKey}:</span> {sanitizedValue}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                          {log.newOrderId && (
                            <Link href={`/order-confirmation?order_id=${log.newOrderId}`}>
                              <Button variant="outline" size="sm">
                                View New Order
                              </Button>
                            </Link>
                          )}
                          <Link href={`/order-confirmation?order_id=${log.originalOrderId}`}>
                            <Button variant="outline" size="sm">
                              View Original Order
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No reorder logs found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Reorder logs will appear here when customers place reorders
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Top Reorder Channels</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.topChannels && analytics.topChannels.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.topChannels.map((channel) => (
                        <div key={channel.channel} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {getChannelBadge(channel.channel)}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-black dark:text-white">
                              {channel.count} orders
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              R{channel.value.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No channel data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-black dark:text-white">Reorders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.reordersByStatus && analytics.reordersByStatus.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.reordersByStatus.map((status) => (
                        <div key={status.status} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(status.status)}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-black dark:text-white">
                              {status.count} orders
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No status data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Tracking Tab */}
          <TabsContent value="email-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black dark:text-white flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Automation & Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                      <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                        Reorder Confirmation Emails
                      </h3>
                      <p className="text-green-600 dark:text-green-300 text-sm">
                        Automated emails sent when reorder payments are completed
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                      <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Funnel Analytics Integration
                      </h3>
                      <p className="text-blue-600 dark:text-blue-300 text-sm">
                        Track reorder initiation to completion conversion rates
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800">
                      <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                        Comprehensive Metadata
                      </h3>
                      <p className="text-purple-600 dark:text-purple-300 text-sm">
                        Complete audit trail with IP, user agent, timestamps
                      </p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-medium text-black dark:text-white mb-3">Phase 13 Implementation Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-black dark:text-white">Reorder logging system operational</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-black dark:text-white">Automated email confirmation on reorder completion</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-black dark:text-white">Funnel analytics tracking (initiated → completed)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-black dark:text-white">Comprehensive metadata collection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-black dark:text-white">Multi-channel reorder support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}