import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { LoginSchema, type LoginFormData } from '@/lib/validators/login';
import { customerAuth } from '@/lib/authClient';

export function LoginForm() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await customerAuth.login(data.email, data.password);
      
      // Invalidate auth queries to refresh user state
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/customer/me'] });
      
      // Show success message briefly
      setSuccess(`Welcome back! Redirecting...`);
      
      // Get redirect URL from query params or use default
      const returnUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
      
      // Redirect after a brief delay
      setTimeout(() => {
        setLocation(returnUrl);
      }, 1000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
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
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Sign in to your Healios account to access your wellness portal.
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email address"
                        disabled={isLoading}
                        className="w-full"
                        data-testid="input-email"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          className="w-full pr-10"
                          data-testid="input-password"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          data-testid="toggle-password-visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                data-testid="button-login"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

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
              data-testid="link-register"
            >
              Sign up
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}