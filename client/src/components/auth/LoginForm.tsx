import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Mail, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [pin, setPin] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send PIN');
      }

      setSuccess('A one-time PIN has been sent to your email. Please check your inbox.');
      setStep('pin');
    } catch (error) {
      console.error('Email login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the PIN from your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, pin: pin.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid PIN');
      }

      // Successful authentication - redirect based on profile completion
      const { user, needsProfileCompletion, redirectTo } = data;
      
      if (needsProfileCompletion) {
        // New user or incomplete profile - redirect to profile completion
        setSuccess(`Welcome${user.firstName ? `, ${user.firstName}` : ''}! Please complete your profile to continue shopping.`);
        setTimeout(() => {
          window.location.href = redirectTo || '/profile';
        }, 2000);
      } else {
        // Existing user with complete profile - redirect to shopping
        const returnUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
        window.location.href = returnUrl;
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setError(error instanceof Error ? error.message : 'Invalid PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPin('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 mx-auto mb-4 bg-black dark:bg-white flex items-center justify-center">
              {step === 'email' ? (
                <LogIn className="w-6 h-6 text-white dark:text-black" />
              ) : (
                <Mail className="w-6 h-6 text-white dark:text-black" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            {step === 'email' ? 'Welcome back' : 'Enter PIN'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {step === 'email' 
              ? 'Sign in to your Healios account to access your wellness portal.' 
              : 'We sent a PIN to your email. Enter it below to sign in.'
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

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black dark:text-white">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="input-email"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                data-testid="button-send-pin"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending PIN...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send PIN
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-black dark:text-white">
                  Enter PIN
                </Label>
                <Input
                  id="pin"
                  type="text"
                  placeholder="Enter the 6-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={isLoading}
                  className="w-full text-center text-lg tracking-widest"
                  maxLength={6}
                  data-testid="input-pin"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Sent to: {email}
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !pin.trim()}
                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                data-testid="button-verify-pin"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmail}
                disabled={isLoading}
                className="w-full"
                data-testid="button-back"
              >
                Back to Email
              </Button>
            </form>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing in you agree to our{' '}
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
            <span className="text-gray-600 dark:text-gray-400">Don't have an account?</span>{' '}
            <button
              type="button"
              className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline font-medium"
              onClick={() => setLocation('/register')}
            >
              Sign up
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}