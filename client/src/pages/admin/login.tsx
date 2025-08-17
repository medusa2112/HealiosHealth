// ADMIN LOGIN PAGE - SIMPLE EMAIL PIN AUTHENTICATION
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'email' | 'pin'>('email');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Admin Login | Healios';
  }, []);

  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/oauth/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'PIN sent',
          description: 'Check your email for the login PIN',
        });
        setStep('pin');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send PIN',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send PIN',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 6) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/oauth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
        // Redirect to admin dashboard
        window.location.href = '/admin';
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Invalid PIN',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Verification failed',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your admin email to receive a login PIN'
              : 'Enter the 6-digit PIN sent to your email'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={handleSendPin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@healios.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    data-testid="input-admin-email"
                  />
                </div>
              </div>
              <Button 
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
                disabled={loading || !email}
                data-testid="button-send-pin"
              >
                {loading ? 'Sending...' : 'Send Login PIN'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Enter PIN</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="pin"
                    type="text"
                    placeholder="000000"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 text-center text-2xl tracking-wider"
                    maxLength={6}
                    required
                    data-testid="input-pin"
                  />
                </div>
              </div>
              <Button 
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
                disabled={loading || pin.length !== 6}
                data-testid="button-verify-pin"
              >
                {loading ? 'Verifying...' : 'Verify PIN'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email');
                  setPin('');
                }}
                data-testid="button-back"
              >
                Back to email
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Authorized administrators only</p>
            <p className="mt-1 text-xs">Contact support if you need access</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminLogin;