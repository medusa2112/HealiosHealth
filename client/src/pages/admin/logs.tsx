import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Database, Settings, ShoppingCart, FileText, LogIn, LogOut, Search, Filter } from "lucide-react";
import type { AdminLog } from "@shared/schema";
import { AdminNavbar } from '@/components/admin-navbar';
import { useLocation } from "wouter";

export default function AdminLogsPage() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24"); // hours
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Fetch admin logs with pagination and time filtering
  const { data: logsResponse, isLoading } = useQuery<{ logs: AdminLog[], total: number, totalPages: number }>({
    queryKey: ['/api/admin/logs', { page, limit: PAGE_SIZE, hours: timeFilter, search, actionFilter, targetFilter }],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const logs = logsResponse?.logs || [];
  const totalLogs = logsResponse?.total || 0;
  const totalPages = logsResponse?.totalPages || 1;

  // Logs are now filtered server-side, no need for client-side filtering
  const filteredLogs = logs;

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('login')) return <LogIn className="w-4 h-4" />;
    if (actionType.includes('logout')) return <LogOut className="w-4 h-4" />;
    if (actionType.includes('product')) return <ShoppingCart className="w-4 h-4" />;
    if (actionType.includes('order')) return <FileText className="w-4 h-4" />;
    if (actionType.includes('user')) return <User className="w-4 h-4" />;
    if (actionType.includes('admin')) return <Shield className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes('login_success') || actionType.includes('create')) return 'bg-green-100 text-green-800';
    if (actionType.includes('login_failed') || actionType.includes('delete')) return 'bg-red-100 text-red-800';
    if (actionType.includes('update') || actionType.includes('edit')) return 'bg-blue-100 text-blue-800';
    if (actionType.includes('logout')) return 'bg-gray-100 text-gray-800';
    return 'bg-orange-100 text-orange-800';
  };

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch {
      return { raw: details };
    }
  };

  // Get unique action types and target types for filters
  const uniqueActionTypes = Array.from(new Set((logs || []).map(log => log.actionType))).sort();
  const uniqueTargetTypes = Array.from(new Set((logs || []).map(log => log.targetType))).sort();

  const stats = {
    total: logs?.length || 0,
    logins: logs?.filter(l => l.actionType.includes('login')).length || 0,
    adminActions: logs?.filter(l => !l.actionType.includes('login') && !l.actionType.includes('logout')).length || 0,
    today: logs?.filter(l => {
      if (!l.timestamp) return false;
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length || 0,
  };



  const handleTabChange = (tab: string) => {
    // Navigation handled by the AdminNavbar component
    if (tab !== "logs") {
      setLocation(`/admin`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <AdminNavbar activeTab="logs" onTabChange={handleTabChange} />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Admin Security Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive audit trail of all admin activities and login attempts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">{stats.total}</p>
                  <p className="text-gray-600 dark:text-gray-400">Total Logs</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.logins}</p>
                  <p className="text-gray-600 dark:text-gray-400">Login Attempts</p>
                </div>
                <LogIn className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.adminActions}</p>
                  <p className="text-gray-600 dark:text-gray-400">Admin Actions</p>
                </div>
                <Settings className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
                  <p className="text-gray-600 dark:text-gray-400">Today</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by action, target, or admin ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActionTypes.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={targetFilter} onValueChange={setTargetFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Targets</SelectItem>
                  {uniqueTargetTypes.map(target => (
                    <SelectItem key={target} value={target}>
                      {target.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Time window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last Hour</SelectItem>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="72">Last 3 Days</SelectItem>
                  <SelectItem value="168">Last Week</SelectItem>
                  <SelectItem value="720">Last Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black dark:text-white">Security Audit Logs</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {totalLogs} logs (Page {page} of {totalPages})
              {(search || actionFilter !== "all" || targetFilter !== "all" || timeFilter !== "all") && 
                ` - Filters active`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-500">Loading audit logs...</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-xl font-medium text-black dark:text-white mb-2">
                  No Logs Found
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {search || actionFilter !== "all" || targetFilter !== "all" 
                    ? "Try adjusting your search criteria." 
                    : "Admin activity will appear here."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const details = parseDetails(log.details || '{}');
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.actionType)}
                            <Badge className={getActionColor(log.actionType)}>
                              {log.actionType.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.adminId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.targetType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.targetId.length > 20 ? 
                            `${log.targetId.substring(0, 20)}...` : 
                            log.targetId
                          }
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {details.method && (
                              <div className="mb-1">
                                <span className="font-medium">{details.method}</span> {details.path}
                              </div>
                            )}
                            {details.ip && (
                              <div className="text-xs text-gray-500">
                                IP: {details.ip}
                              </div>
                            )}
                            {log.ipAddress && (
                              <div className="text-xs text-gray-500">
                                IP: {log.ipAddress}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}