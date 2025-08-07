import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useUser } from "../hooks/use-auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setLocation('/admin');
      } else if (user.role === 'customer') {
        setLocation('/portal');
      } else {
        setLocation('/');
      }
    }
  }, [user, setLocation]);

  const handleReplitAuth = () => {
    // Redirect to Replit Auth
    window.location.href = '/api/login';
  };

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, firstName, lastName }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect based on role
        if (data.redirectUrl) {
          setLocation(data.redirectUrl);
        } else {
          setLocation('/');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            Sign In to Wild Nutrition
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Replit Auth - Primary Method */}
          <Button 
            onClick={handleReplitAuth}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            size="lg"
          >
            Continue with Replit
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-500 dark:text-gray-400">
                Development Mode
              </span>
            </div>
          </div>

          {/* Mock Login for Development */}
          <form onSubmit={handleMockLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black dark:text-white">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                placeholder="your.email@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-black dark:text-white">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-black dark:text-white">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded">
              <strong>Test Accounts:</strong><br/>
              Admin: admin@wildnutrition.com<br/>
              Customer: customer@wildnutrition.com
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Mock Sign In (Dev)"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}