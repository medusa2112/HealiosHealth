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
import { UserPlus, Lock, Eye, EyeOff, Loader2, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { RegisterSchema, type RegisterFormData } from '@/lib/validators/register';
import { VerificationSchema, type VerificationFormData } from '@/lib/validators/verification';
import { customerAuth } from '@/lib/authClient';

type RegistrationStep = 'details' | 'verification' | 'success';

export function RegisterForm() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<RegistrationStep>('details');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    }
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: {
      email: '',
      code: ''
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await customerAuth.register(
        data.email,
        data.password,
        data.firstName || '',
        data.lastName || ''
      );
      
      // Step 1 completed - PIN verification email sent
      if (result.step === 'verification') {
        setPendingEmail(data.email);
        verificationForm.setValue('email', data.email);
        setSuccess(result.message);
        setStep('verification');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      
      if (errorMessage.includes('already exists')) {
        setError('An account with this email already exists. Redirecting to sign in...');
        setTimeout(() => {
          setLocation(`/login?email=${encodeURIComponent(data.email)}&message=${encodeURIComponent('Please sign in to your existing account')}`);
        }, 2000);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: VerificationFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await customerAuth.verifyRegistration(data.email, data.code);
      
      // Invalidate auth queries to refresh user state
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/customer/me'] });
      
      // Step 2 completed - registration successful
      setSuccess(result.message);
      setStep('success');
      
      // Redirect to portal after brief delay
      setTimeout(() => {
        setLocation(result.redirectUrl || '/portal');
      }, 2000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToDetails = () => {
    setStep('details');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 mx-auto mb-4 bg-black dark:bg-white flex items-center justify-center">
              {step === 'success' ? (
                <CheckCircle className="w-6 h-6 text-white dark:text-black" />
              ) : step === 'verification' ? (
                <Mail className="w-6 h-6 text-white dark:text-black" />
              ) : (
                <UserPlus className="w-6 h-6 text-white dark:text-black" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            {step === 'success' 
              ? 'Account Created!' 
              : step === 'verification' 
                ? 'Check your email' 
                : 'Create your account'
            }
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {step === 'success' 
              ? 'Welcome to Healios! Redirecting to your portal...' 
              : step === 'verification'
                ? `We've sent a 6-digit verification code to ${pendingEmail}`
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

          {/* Step 1: Registration Details Form */}
          {step === 'details' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your first name"
                          disabled={isLoading}
                          className="w-full"
                          data-testid="input-firstname"
                          autoComplete="given-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter your last name"
                          disabled={isLoading}
                          className="w-full"
                          data-testid="input-lastname"
                          autoComplete="family-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">Email Address</FormLabel>
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
                            placeholder="Create a secure password"
                            disabled={isLoading}
                            className="w-full pr-10"
                            data-testid="input-password"
                            autoComplete="new-password"
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
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Must be at least 8 characters with uppercase, lowercase, and number
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            disabled={isLoading}
                            className="w-full pr-10"
                            data-testid="input-confirm-password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            data-testid="toggle-confirm-password-visibility"
                          >
                            {showConfirmPassword ? (
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
            </Form>
          )}

          {/* Step 2: PIN Verification Form */}
          {step === 'verification' && (
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                <FormField
                  control={verificationForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter 6-digit code"
                          disabled={isLoading}
                          className="w-full text-center text-2xl tracking-widest font-mono"
                          data-testid="input-verification-code"
                          maxLength={6}
                          autoComplete="one-time-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading || verificationForm.watch('code')?.length !== 6}
                  className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                  data-testid="button-verify-code"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Code
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToDetails}
                  disabled={isLoading}
                  className="w-full"
                  data-testid="button-back-to-details"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
              </form>
            </Form>
          )}

          {/* Terms and Privacy - only show for details step */}
          {step === 'details' && (
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
          )}
        </CardContent>

        {step === 'details' && (
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
        )}
      </Card>
    </div>
  );
}