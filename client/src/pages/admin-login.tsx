import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { z } from 'zod';
import { adminAuth, initializeAdminCsrf } from '@/lib/authClient';

const AdminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  totp: z.string().optional()
});

type AdminLoginFormData = z.infer<typeof AdminLoginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTotp, setShowTotp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      totp: ''
    }
  });

  // Initialize admin CSRF token on mount
  useEffect(() => {
    initializeAdminCsrf();
    
    // Set page title and meta for SEO
    document.title = 'Admin Login | Healios';
    
    // Set canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/admin/login`);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = `${window.location.origin}/admin/login`;
      document.head.appendChild(link);
    }

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Admin login for Healios store management. Secure access for administrators only.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Admin login for Healios store management. Secure access for administrators only.';
      document.head.appendChild(meta);
    }
  }, []);

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the admin authentication endpoint
      const result = await adminAuth.login(data.email, data.password, data.totp);
      
      // Redirect to admin dashboard
      setLocation('/admin/dashboard');
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      // Check if 2FA is required
      if (err.message?.includes('2FA') || err.message?.includes('TOTP')) {
        setShowTotp(true);
        setError('Please enter your 2FA code');
      } else if (err.message?.includes('customer')) {
        setError('This is the admin login page. Customers should use the main login page.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
      
      // Focus first invalid input
      const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstErrorField) {
        firstErrorField.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="main">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white dark:bg-black border border-gray-300 dark:border-gray-700 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-4">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-600 dark:bg-red-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-black dark:text-white">
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Secure login for Healios administrators
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
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@healios.com"
                  className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-red-600 dark:focus:ring-red-500"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  autoComplete="username"
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
                  placeholder="Enter admin password"
                  className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-red-600 dark:focus:ring-red-500"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {showTotp && (
                <div className="space-y-2">
                  <Label htmlFor="totp" className="text-black dark:text-white">
                    2FA Code
                  </Label>
                  <Input
                    id="totp"
                    type="text"
                    placeholder="6-digit code"
                    className="bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-red-600 dark:focus:ring-red-500"
                    aria-invalid={errors.totp ? 'true' : 'false'}
                    aria-describedby={errors.totp ? 'totp-error' : undefined}
                    autoComplete="one-time-code"
                    maxLength={6}
                    {...register('totp')}
                  />
                  {errors.totp && (
                    <p id="totp-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.totp.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold py-2 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Login
                  </>
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <a href="/" className="hover:underline">
                  ← Back to store
                </a>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
                  ⚠️ Authorized personnel only. All access attempts are logged.
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}