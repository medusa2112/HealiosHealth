import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, User, Target, FileText, Filter, Download } from "lucide-react";
import type { AdminLog } from "@shared/schema";

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredLogs, setFilteredLogs] = useState<AdminLog[]>([]);
  const [filters, setFilters] = useState({
    actionType: "",
    targetType: "",
    adminId: "",
    limit: "50"
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.limit) params.set("limit", filters.limit);
      if (filters.adminId) params.set("adminId", filters.adminId);
      if (filters.targetType) params.set("targetType", filters.targetType);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch admin logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.actionType) {
      filtered = filtered.filter(log => 
        log.actionType.toLowerCase().includes(filters.actionType.toLowerCase())
      );
    }

    if (filters.targetType && !filters.targetType.includes("adminId") && !filters.targetType.includes("targetType")) {
      filtered = filtered.filter(log => 
        log.targetType.toLowerCase().includes(filters.targetType.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = ["Timestamp", "Admin ID", "Action", "Target Type", "Target ID", "Details"];
    const csvData = [
      headers,
      ...filteredLogs.map(log => [
        new Date(log.timestamp || '').toLocaleString(),
        log.adminId,
        log.actionType,
        log.targetType,
        log.targetId,
        log.details ? JSON.stringify(log.details) : ""
      ])
    ];

    const csvString = csvData.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
    ).join("\\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin_logs_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getActionTypeColor = (actionType: string): string => {
    if (actionType.includes("create")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (actionType.includes("update")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (actionType.includes("delete")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (actionType.includes("refund")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    if (actionType.includes("upload")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  const getTargetTypeColor = (targetType: string): string => {
    if (targetType === "product") return "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
    if (targetType === "order") return "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400";
    if (targetType === "system") return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400";
    return "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Admin Activity Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive audit trail of all admin actions and system changes
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          disabled={filteredLogs.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black dark:text-white">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="actionFilter">Action Type</Label>
              <Input
                id="actionFilter"
                placeholder="e.g., create, update, delete"
                value={filters.actionType}
                onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="targetFilter">Target Type</Label>
              <Select
                value={filters.targetType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, targetType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All targets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All targets</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adminFilter">Admin ID</Label>
              <Input
                id="adminFilter"
                placeholder="Filter by admin ID"
                value={filters.adminId}
                onChange={(e) => setFilters(prev => ({ ...prev, adminId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="limitFilter">Limit</Label>
              <Select
                value={filters.limit}
                onValueChange={(value) => setFilters(prev => ({ ...prev, limit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 logs</SelectItem>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="200">200 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={fetchLogs}
              className="bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              Apply Filters
            </Button>
            <Button
              onClick={() => setFilters({ actionType: "", targetType: "", adminId: "", limit: "50" })}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                <p className="text-2xl font-bold text-black dark:text-white">{filteredLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                <User className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Admins</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {new Set(filteredLogs.map(log => log.adminId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Target Types</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {new Set(filteredLogs.map(log => log.targetType)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black dark:text-white">Activity Timeline</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `Showing ${filteredLogs.length} of ${logs.length} admin actions`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading admin logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No admin logs found matching your filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getActionTypeColor(log.actionType)}>
                          {log.actionType.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getTargetTypeColor(log.targetType)}>
                          {log.targetType}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Target: {log.targetId}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Admin: {log.adminId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp || '').toLocaleString()}
                        </span>
                      </div>
                      
                      {log.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}