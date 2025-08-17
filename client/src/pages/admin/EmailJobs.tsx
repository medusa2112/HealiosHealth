import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Mail, Clock, Users, TrendingUp, Play, Pause, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailJobStats {
  abandonedCarts: {
    oneHour: number;
    twentyFourHour: number;
  };
  reorderCandidates: number;
  emailsSent: {
    abandonedCart1h: number;
    abandonedCart24h: number;
    reorderReminders: number;
    finalReorderReminders: number;
    total: number;
  };
}

export default function AdminEmailJobs() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch email job statistics
  const { data: stats, isLoading: statsLoading } = useQuery<{success: boolean; stats: EmailJobStats}>({
    queryKey: ["/api/admin/email-jobs/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation to trigger abandoned cart emails
  const triggerAbandonedCarts = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/email-jobs/abandoned-carts"),
    onSuccess: () => {
      toast({
        title: "Abandoned Cart Emails",
        description: "Successfully processed abandoned cart email reminders",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-jobs/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process abandoned cart emails",
        variant: "destructive",
      });
    },
  });

  // Mutation to trigger reorder reminders
  const triggerReorderReminders = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/email-jobs/reorder-reminders"),
    onSuccess: () => {
      toast({
        title: "Reorder Reminders",
        description: "Successfully processed reorder reminder emails",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-jobs/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process reorder reminder emails",
        variant: "destructive",
      });
    },
  });

  // Mutation to trigger all email jobs
  const triggerAllJobs = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/email-jobs/all"),
    onSuccess: () => {
      toast({
        title: "All Email Jobs",
        description: "Successfully processed all automated email jobs",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-jobs/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process email jobs",
        variant: "destructive",
      });
    },
  });

  // Mutation to start scheduler
  const startScheduler = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/email-jobs/scheduler/start"),
    onSuccess: () => {
      toast({
        title: "Email Scheduler",
        description: "Email job scheduler started successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start email scheduler",
        variant: "destructive",
      });
    },
  });

  // Mutation to stop scheduler
  const stopScheduler = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/email-jobs/scheduler/stop"),
    onSuccess: () => {
      toast({
        title: "Email Scheduler",
        description: "Email job scheduler stopped successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stop email scheduler",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automated Email Jobs</h1>
          <p className="text-muted-foreground">
            Monitor and control abandoned cart and reorder reminder email automation
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/email-jobs/stats"] })}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
          <Button
            onClick={() => triggerAllJobs.mutate()}
            disabled={triggerAllJobs.isPending}
          >
            <Mail className="w-4 h-4 mr-2" />
            Run All Jobs
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandoned Carts (1h)</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.stats.abandonedCarts.oneHour || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Carts abandoned 1+ hours ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abandoned Carts (24h)</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.stats.abandonedCarts.twentyFourHour || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Carts abandoned 24+ hours ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Candidates</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.stats.reorderCandidates || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Customers ready for reorder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.stats.emailsSent.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All automated emails sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Email Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of automated emails sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.stats.emailsSent.abandonedCart1h}
                </div>
                <div className="text-sm text-muted-foreground">1h Reminders</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stats.stats.emailsSent.abandonedCart24h}
                </div>
                <div className="text-sm text-muted-foreground">24h Reminders</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.stats.emailsSent.reorderReminders}
                </div>
                <div className="text-sm text-muted-foreground">Reorder Reminders</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.stats.emailsSent.finalReorderReminders}
                </div>
                <div className="text-sm text-muted-foreground">Final Reorder Reminders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Abandoned Cart Emails
            </CardTitle>
            <CardDescription>
              Process 1-hour and 24-hour abandoned cart reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => triggerAbandonedCarts.mutate()}
              disabled={triggerAbandonedCarts.isPending}
            >
              {triggerAbandonedCarts.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminders
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Reorder Reminders
            </CardTitle>
            <CardDescription>
              Process reorder reminder emails for customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => triggerReorderReminders.mutate()}
              disabled={triggerReorderReminders.isPending}
            >
              {triggerReorderReminders.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminders
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Email Scheduler
            </CardTitle>
            <CardDescription>
              Control the automated email job scheduler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => startScheduler.mutate()}
                disabled={startScheduler.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Scheduler
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => stopScheduler.mutate()}
                disabled={stopScheduler.isPending}
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Scheduler
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current status of the automated email system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>Email Scheduler</span>
              <Badge variant="default">
                {process.env.NODE_ENV === 'development' ? 'Running (Dev)' : 'Production'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>Job Frequency</span>
              <Badge variant="outline">Every Hour</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>Environment</span>
              <Badge variant={process.env.NODE_ENV === 'development' ? 'secondary' : 'default'}>
                {process.env.NODE_ENV || 'Development'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span>Last Updated</span>
              <Badge variant="outline">
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}