import { ReactNode } from 'react';
import { useUser } from '@/hooks/use-auth';
// ADMIN FUNCTIONALITY REMOVED - no longer importing use-admin-auth
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'customer';
  fallback?: ReactNode;
}

// ADMIN FUNCTIONALITY REMOVED
// Admin protection component - always returns 404 since admin functionality has been removed
function AdminProtectedRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  // Admin functionality has been completely removed from the application
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-black dark:text-white">Access Unavailable</CardTitle>
          <CardDescription>
            Admin functionality has been removed from this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Admin access is no longer available
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Separate component for customer protection
function CustomerProtectedRoute({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, isLoading, login } = useUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-black dark:text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-black dark:text-white">Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={login}
              className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secure authentication required
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'customer',
  fallback 
}: ProtectedRouteProps) {
  // Route to the appropriate protection component based on role
  if (requiredRole === 'admin') {
    return <AdminProtectedRoute fallback={fallback}>{children}</AdminProtectedRoute>;
  }
  
  return <CustomerProtectedRoute fallback={fallback}>{children}</CustomerProtectedRoute>;
}