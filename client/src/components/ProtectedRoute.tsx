import { ReactNode } from 'react';
import { useUser } from '@/hooks/use-auth';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'customer';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'customer',
  fallback 
}: ProtectedRouteProps) {
  // Use different auth hooks based on required role
  const customerAuth = useUser();
  const adminAuthResult = useAdminAuth();
  const { toast } = useToast();
  
  // Select the appropriate auth data based on required role
  const authData = requiredRole === 'admin' ? {
    user: adminAuthResult.admin,
    isLoading: adminAuthResult.isLoading,
    login: () => window.location.href = '/admin/login'
  } : {
    user: customerAuth.user,
    isLoading: customerAuth.isLoading,
    login: customerAuth.login
  };

  const { user, isLoading, login } = authData;

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
              {requiredRole === 'admin' ? 'Admin Login' : 'Log In with Replit'}
            </Button>
            

            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {requiredRole === 'admin' ? 'Admin authentication required' : 'Secure authentication powered by Replit'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For admin routes, user is already authenticated as admin if we reach this point
  // For customer routes, check if admin is trying to access (no additional role check needed)
  
  return <>{children}</>;
}