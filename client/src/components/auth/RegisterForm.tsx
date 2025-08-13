import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Github, Mail } from 'lucide-react';
import { SiGoogle, SiApple, SiX } from 'react-icons/si';

export function RegisterForm() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Customer OAuth provider configurations - Direct provider endpoints
  const oauthProviders = [
    {
      name: 'Google',
      icon: SiGoogle,
      color: 'bg-[#4285f4] hover:bg-[#3367d6] text-white',
      provider: 'google',
      enabled: true
    },
    {
      name: 'GitHub',
      icon: Github,
      color: 'bg-[#24292e] hover:bg-[#1b1f23] text-white',
      provider: 'github',
      enabled: true
    },
    {
      name: 'Apple',
      icon: SiApple,
      color: 'bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black',
      provider: 'apple',
      enabled: true
    },
    {
      name: 'X',
      icon: SiX,
      color: 'bg-black hover:bg-gray-800 text-white',
      provider: 'twitter',
      enabled: true
    },
  ].filter(provider => provider.enabled);

  const handleCustomerAuth = (provider: { provider: string; name: string }) => {
    try {
      // Store return URL for post-auth redirect (customer portal) 
      const returnUrl = new URLSearchParams(window.location.search).get('redirect') || '/portal';
      
      // Send the return URL to server for session storage (more reliable than sessionStorage)
      fetch('/api/customer/set-return-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ returnUrl })
      }).catch(err => console.warn('Could not set return URL:', err));
      
      // Clear any admin session data to ensure customer registration
      sessionStorage.removeItem('admin_auth_return_url');
      
      // Use direct OAuth provider endpoints instead of Replit Auth proxy
      window.location.href = `/api/auth/${provider.provider}`;
    } catch (error) {
      console.error(`${provider.name} authentication error:`, error);
      setError('Authentication service temporarily unavailable. Please try again.');
    }
  };

  // Email/fallback authentication (uses original Replit OAuth)
  const handleEmailAuth = () => {
    try {
      const returnUrl = new URLSearchParams(window.location.search).get('redirect') || '/portal';
      
      fetch('/api/customer/set-return-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ returnUrl })
      }).catch(err => console.warn('Could not set return URL:', err));
      
      sessionStorage.removeItem('admin_auth_return_url');
      
      // Email authentication still uses main Replit OAuth
      window.location.href = '/api/login';
    } catch (error) {
      console.error('Email authentication error:', error);
      setError('Authentication service temporarily unavailable. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 mx-auto mb-4 bg-black dark:bg-white flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white dark:text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            Create your account
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Join Healios to access premium wellness products and personalised health insights.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Providers */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Sign up with your preferred provider:
            </p>
            
            {oauthProviders.map((provider) => (
              <Button
                key={provider.name}
                type="button"
                variant="outline"
                onClick={() => handleCustomerAuth(provider)}
                className={`w-full h-12 font-medium transition-all duration-200 hover:scale-[0.99] ${provider.color}`}
              >
                <provider.icon className="w-5 h-5 mr-3" />
                Continue with {provider.name}
              </Button>
            ))}

            {/* Email option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-black px-2 text-gray-500 dark:text-gray-400">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleEmailAuth}
              className="w-full h-12 border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 hover:scale-[0.99]"
            >
              <Mail className="w-5 h-5 mr-3" />
              Continue with Email
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By creating an account you agree to our{' '}
              <button
                type="button"
                className="underline hover:text-black dark:hover:text-white transition-colors"
                onClick={() => setLocation('/terms')}
              >
                Terms
              </button>{' '}
              and acknowledge our{' '}
              <button
                type="button"
                className="underline hover:text-black dark:hover:text-white transition-colors"
                onClick={() => setLocation('/privacy')}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="text-center w-full text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account?</span>{' '}
            <button
              type="button"
              className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline font-medium"
              onClick={() => setLocation('/login')}
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}