import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useUser } from "../hooks/use-auth";
import { ExternalLink, UserPlus } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = user.role === 'admin' ? '/admin' : user.role === 'customer' ? '/portal' : '/';
      setLocation(redirectTo);
    }
  }, [user, setLocation]);

  const handleSignUp = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Join Healios</CardTitle>
          <CardDescription>
            Create your account with Replit to start your health journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSignUp}
            className="w-full h-12 text-lg"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Sign up with Replit
          </Button>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Secure registration powered by Replit</p>
          </div>
          
          <div className="text-center">
            <Button variant="link" onClick={() => setLocation('/login')}>
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}