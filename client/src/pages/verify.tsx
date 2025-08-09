import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function Verify() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const emailParam = urlParams.get('email');
  const typeParam = urlParams.get('type'); // 'reset' or 'email' (default)
  
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  
  const isPasswordReset = typeParam === 'reset';

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf/token', {
          credentials: 'include'
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
        setError('Unable to initialise security token. Please refresh the page.');
      }
    };

    fetchCsrfToken();
  }, []);

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    return errors;
  };

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csrfToken) {
      setError('Security token not available. Please refresh the page.');
      return;
    }

    if (!email || !code) {
      setError('Please enter your email and verification code');
      return;
    }

    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    // Password reset specific validation
    if (isPasswordReset) {
      if (!newPassword || !confirmPassword) {
        setError('Please enter and confirm your new password');
        return;
      }

      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        setError(passwordErrors[0]);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      
      if (isPasswordReset) {
        // Use the existing reset-password endpoint
        response = await apiRequest('POST', '/api/auth/reset-password', {
          email,
          code,
          newPassword
        });
      } else {
        // Use the existing email verification endpoint
        response = await apiRequest('POST', '/api/auth/verify', {
          email,
          code
        });
      }

      const result = await response.json();

      if (response.ok && result.success) {
        if (isPasswordReset) {
          setSuccess('Password reset successfully! Redirecting to login...');
          setTimeout(() => {
            setLocation('/login');
          }, 2000);
        } else {
          setSuccess('Email verified successfully! Redirecting...');
          setTimeout(() => {
            setLocation(result.redirectUrl || '/portal');
          }, 1500);
        }
      } else {
        setError(result.message || (isPasswordReset ? 'Password reset failed' : 'Verification failed'));
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Unable to process request. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!csrfToken) {
      setError('Security token not available. Please refresh the page.');
      return;
    }

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      
      if (isPasswordReset) {
        // Resend password reset code using forgot-password endpoint
        response = await apiRequest('POST', '/api/auth/forgot-password', { email });
      } else {
        // Resend email verification code
        response = await apiRequest('POST', '/api/auth/resend-code', { email });
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(`New ${isPasswordReset ? 'password reset' : 'verification'} code sent to your email`);
        setResendTimer(30); // 30 second cooldown
        setCode(''); // Clear old code
      } else {
        setError(result.message || 'Failed to resend code');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Unable to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    document.title = isPasswordReset ? 'Reset Password | Healios' : 'Verify Email | Healios';
  }, [isPasswordReset]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 mx-auto mb-4 bg-black dark:bg-white flex items-center justify-center">
              {isPasswordReset ? (
                <Lock className="w-6 h-6 text-white dark:text-black" />
              ) : (
                <Mail className="w-6 h-6 text-white dark:text-black" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            {isPasswordReset ? 'Reset your password' : 'Verify your email'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {isPasswordReset 
              ? 'Enter the 6-digit code sent to your email and choose a new password'
              : 'Enter the 6-digit code sent to your email address'
            }
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-black dark:text-white">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-black dark:text-white">
                {isPasswordReset ? 'Reset code' : 'Verification code'}
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                pattern="[0-9]{6}"
                autoComplete="off"
                autoFocus
                required
              />
            </div>

            {isPasswordReset && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-black dark:text-white">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {newPassword && validatePassword(newPassword).length > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Password requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validatePassword(newPassword).map((error, index) => (
                          <li key={index} className="text-red-600 dark:text-red-400">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black dark:text-white">
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                  )}
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading || !csrfToken}
              className="w-full bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black transition-all duration-200 hover:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPasswordReset ? 'Resetting password...' : 'Verifying...'}
                </>
              ) : (
                isPasswordReset ? 'Reset password' : 'Verify email'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isResending || resendTimer > 0}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isPasswordReset ? 'Resend reset code' : 'Resend code'}
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {isPasswordReset ? 'Remember your password?' : 'Already verified?'}
              </span>{' '}
              <button
                type="button"
                className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline font-medium"
                onClick={() => setLocation('/login')}
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}