import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { RegisterSchema, type RegisterFormData } from '@/lib/validators/register';

export function RegisterForm() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    }
  });

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

  const onSubmit = async (data: RegisterFormData) => {
    if (!csrfToken) {
      setError('Security token not available. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Redirect to customer portal after successful registration
        const redirectUrl = result.redirectUrl || '/portal';
        setLocation(redirectUrl);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        
        // Focus first invalid input
        const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
        if (firstErrorField) {
          firstErrorField.focus();
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-black dark:text-white">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-black dark:text-white">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
                placeholder="Create a password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-black dark:text-white">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !csrfToken}
              className="w-full bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black transition-all duration-200 hover:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create account
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}