import { ReactNode } from 'react';
import { useUser } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, Settings } from 'lucide-react';
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
  const { user, isLoading, login } = useUser();
  const { toast } = useToast();
  
  // Development-only demo login mutation
  const demoLoginMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/demo-admin-login'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Demo Login Successful",
        description: "You are now logged in as admin for testing.",
      });
      // Reload the page to reflect authentication state
      window.location.reload();
    },
    onError: () => {
      toast({
        title: "Demo Login Failed",
        description: "Unable to log in with demo account.",
        variant: "destructive",
      });
    },
  });

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
              Log In with Replit
            </Button>
            
            {/* Development-only demo login button */}
            {import.meta.env.DEV && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">
                      Development Only
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => demoLoginMutation.mutate()}
                  disabled={demoLoginMutation.isPending}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {demoLoginMutation.isPending ? 'Logging in...' : 'Admin Demo Login'}
                </Button>
              </>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secure authentication powered by Replit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-black dark:text-white">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this admin area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}