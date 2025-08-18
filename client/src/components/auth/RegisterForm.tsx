import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';

export function RegisterForm() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Please enter your last name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create user account directly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.message?.includes('already exists')) {
          setError('An account with this email already exists. Redirecting to sign in...');
          setTimeout(() => {
            setLocation(`/login?email=${encodeURIComponent(formData.email.trim())}&message=${encodeURIComponent('Please sign in to your existing account')}`);
          }, 2000);
          return;
        }
        throw new Error(data.message || 'Failed to create account');
      }

      // Account created successfully
      setSuccess(`Welcome to Healios, ${formData.firstName}! Your account has been created successfully.`);
      
      // Redirect to sign in page after 3 seconds
      setTimeout(() => {
        setLocation(`/login?email=${encodeURIComponent(formData.email.trim())}&message=${encodeURIComponent('Account created! Please sign in to access your account.')}`);
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 mx-auto mb-4 bg-black dark:bg-white flex items-center justify-center">
              {success ? (
                <CheckCircle className="w-6 h-6 text-white dark:text-black" />
              ) : (
                <UserPlus className="w-6 h-6 text-white dark:text-black" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            {success ? 'Account Created!' : 'Create your account'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {success 
              ? 'You can now sign in to access your account.' 
              : 'Enter your details to create your Healios account.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-black dark:text-white">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="input-firstname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-black dark:text-white">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="input-lastname"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-black dark:text-white">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="input-email"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()}
                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                data-testid="button-create-account"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          )}

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
            </p>
          </div>
        </CardContent>

        <CardFooter className="text-center border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 w-full">
            Already have an account?{' '}
            <button
              type="button"
              className="font-medium text-black dark:text-white hover:underline"
              onClick={() => setLocation('/login')}
              data-testid="link-signin"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}