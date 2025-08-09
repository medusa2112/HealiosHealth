import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn } from 'lucide-react';
import { LoginSchema, type LoginFormData } from '@/lib/validators/login';

export function LoginForm() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  });

  const rememberValue = watch('remember');

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

  const onSubmit = async (data: LoginFormData) => {
    if (!csrfToken) {
      setError('Security token not available. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          remember: data.remember
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Redirect based on user role or to account portal
        const redirectUrl = result.redirectUrl || '/portal';
        setLocation(redirectUrl);
      } else {
        setError(result.message || 'We couldn\'t sign you in with those details.');
        
        // Focus first invalid input
        const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
        if (firstErrorField) {
          firstErrorField.focus();
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect. Please check your connection and try again.');
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
              <LogIn className="w-6 h-6 text-white dark:text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            Sign in to Healios
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Access orders, subscriptions and account settings.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
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
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black dark:text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberValue}
                onCheckedChange={(checked) => setValue('remember', checked === true)}
                className="border-gray-300 dark:border-gray-700 data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
              />
              <Label 
                htmlFor="remember" 
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !csrfToken}
              className="w-full bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black transition-all duration-200 hover:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-between w-full text-sm">
              <button
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors underline"
                onClick={() => setLocation('/forgot-password')}
              >
                Forgot your password?
              </button>
              <button
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors underline"
                onClick={() => setLocation('/register')}
              >
                Create an account
              </button>
            </div>

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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}