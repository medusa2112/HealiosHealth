import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Activity,
  Database,
  Globe,
  Eye,
  RefreshCw
} from 'lucide-react';
import { SEOHead } from '@/components/seo-head';

interface SecurityStats {
  activeAdminSessions: number;
  failedLoginAttempts: number;
  lastSecurityScan: string;
  vulnerabilityCount: number;
  securityScore: number;
}

interface SecurityCheck {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  description: string;
  recommendation?: string;
}

export default function AdminSecurity() {
  const [lastRefresh, setLastRefresh] = useState(new Date().toISOString());

  const { data: securityStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/security/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security/stats', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch security stats');
      }
      return response.json() as Promise<SecurityStats>;
    },
  });

  const { data: securityChecks, isLoading: checksLoading, refetch: refetchChecks } = useQuery({
    queryKey: ['/api/admin/security/checks'],
    queryFn: async () => {
      const response = await fetch('/api/admin/security/checks', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch security checks');
      }
      return response.json() as Promise<SecurityCheck[]>;
    },
  });

  const handleRefresh = async () => {
    setLastRefresh(new Date().toISOString());
    await Promise.all([refetchStats(), refetchChecks()]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (statsLoading || checksLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <SEOHead 
          title="Security Dashboard - Admin | Healios"
          description="Monitor and manage security settings for the Healios admin panel."
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto animate-spin mb-4" />
              <p className="text-gray-600">Loading security dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEOHead 
        title="Security Dashboard - Admin | Healios"
        description="Monitor and manage security settings for the Healios admin panel."
      />
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Security Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor system security status and access controls</p>
          </div>
          <Button onClick={handleRefresh} disabled={statsLoading || checksLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className={`text-2xl font-bold ${getSecurityScoreColor(securityStats?.securityScore || 0)}`}>
                    {securityStats?.securityScore || 0}%
                  </p>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Progress 
                  value={securityStats?.securityScore || 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold">{securityStats?.activeAdminSessions || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                  <p className="text-2xl font-bold text-red-600">{securityStats?.failedLoginAttempts || 0}</p>
                </div>
                <Lock className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
                  <p className="text-2xl font-bold text-orange-600">{securityStats?.vulnerabilityCount || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Checks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Security Checks
            </CardTitle>
            <CardDescription>
              Automated security assessments and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {securityChecks && securityChecks.length > 0 ? (
              <div className="space-y-4">
                {securityChecks.map((check) => (
                  <div 
                    key={check.id} 
                    className={`p-4 border rounded-lg ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <h3 className="font-medium">{check.name}</h3>
                      </div>
                      <Badge 
                        variant={check.status === 'pass' ? 'default' : check.status === 'warn' ? 'secondary' : 'destructive'}
                      >
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                    {check.recommendation && (
                      <p className="text-sm text-blue-600 font-medium">
                        Recommendation: {check.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No security checks available</p>
                <p className="text-gray-400">Security scanning is being initialized.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Access Control
              </CardTitle>
              <CardDescription>
                Manage authentication and authorization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Admin Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Lock className="w-4 h-4 mr-2" />
                Session Management
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Key className="w-4 h-4 mr-2" />
                API Key Management
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Security Monitoring
              </CardTitle>
              <CardDescription>
                Track security events and system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                View Security Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="w-4 h-4 mr-2" />
                IP Whitelist Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Database Security
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Last security check: {securityStats?.lastSecurityScan || 'Never'}</span>
              <span>Dashboard updated: {new Date(lastRefresh).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}