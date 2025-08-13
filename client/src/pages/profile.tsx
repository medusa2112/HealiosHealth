import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Loader2, CheckCircle } from 'lucide-react';
import { useUser } from '@/hooks/use-auth';
import { getCustCsrf } from '@/lib/authClient';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please fill in both first and last name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const csrfToken = getCustCsrf();
      const response = await fetch('/api/auth/customer/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully! Redirecting to shop...');
      // User data will be refreshed on next page load
      
      // Redirect to shopping page after success
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isProfileComplete = user?.firstName && user?.lastName && 
                           user.firstName.trim() !== '' && user.lastName.trim() !== '';

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-black dark:text-white" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto mb-4 bg-black dark:bg-white flex items-center justify-center">
                {isProfileComplete ? (
                  <CheckCircle className="w-6 h-6 text-white dark:text-black" />
                ) : (
                  <User className="w-6 h-6 text-white dark:text-black" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-black dark:text-white">
                {isProfileComplete ? 'Update Profile' : 'Complete Your Profile'}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {isProfileComplete 
                  ? 'Update your personal information below.'
                  : 'Please provide your name to start shopping with Healios.'
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-black dark:text-white">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                    className="w-full"
                    data-testid="input-firstName"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-black dark:text-white">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                    className="w-full"
                    data-testid="input-lastName"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  disabled={isLoading}
                  data-testid="button-save-profile"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    isProfileComplete ? 'Update Profile' : 'Save & Start Shopping'
                  )}
                </Button>
              </form>

              {isProfileComplete && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className="text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                    data-testid="button-continue-shopping"
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}