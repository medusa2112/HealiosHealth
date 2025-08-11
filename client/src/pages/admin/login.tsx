// ADMIN LOGIN PAGE - ONLY REPLIT OAUTH BUTTON
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function AdminLogin() {
  const handleReplitLogin = () => {
    // Direct to Replit OAuth endpoint
    window.location.href = '/api/admin/oauth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            Sign in with your authorized Replit account to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleReplitLogin}
            className="w-full bg-black hover:bg-gray-800 text-white"
            size="lg"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Sign in with Replit
          </Button>
          
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>Authorized administrators only</p>
            <div className="text-xs text-gray-500">
              dominic96@replit.com • jv@thefourths.com • dn@thefourths.com • admin@healios.com
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}