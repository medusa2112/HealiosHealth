import { useEffect, ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "../hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequireRoleProps {
  role: "admin" | "customer" | "guest";
  children: ReactNode;
  fallbackMessage?: string;
  allowedRoles?: Array<"admin" | "customer" | "guest">;
  fallbackPath?: string;
}

export function RequireRole({ 
  role, 
  children, 
  fallbackMessage, 
  allowedRoles = [role],
  fallbackPath = "/login"
}: RequireRoleProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Add a small delay to allow auth context to stabilize
    const timer = setTimeout(() => {
      if (!isLoading && !hasRedirected) {
        // If user is not logged in, redirect to login
        if (!user) {
          
          setLocation(fallbackPath);
          setHasRedirected(true);
          return;
        }

        // If user doesn't have any of the allowed roles
        if (!allowedRoles.includes(user.role as any)) {
          }]`);
          
          // Smart redirect based on user's actual role
          if (user.role === "admin" && !allowedRoles.includes("admin")) {
            setLocation("/admin");
          } else if (user.role === "customer" && !allowedRoles.includes("customer")) {
            setLocation("/portal");
          } else {
            setLocation(fallbackPath);
          }
          setHasRedirected(true);
        }
      }
    }, 50); // Small delay to prevent race conditions

    return () => clearTimeout(timer);
  }, [user, isLoading, role, allowedRoles, setLocation, hasRedirected, fallbackPath]);

  // Show enhanced loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center space-y-4">
          <div className="relative">
            <Shield className="w-12 h-12 text-gray-400 mx-auto" />
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verifying Access</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Checking your permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state for unauthorized access
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Authentication Required</strong>
              <br />
              {fallbackMessage || `You need to sign in to access this ${role} area.`}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setLocation("/login")} className="flex-1">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="flex-1">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state for insufficient permissions
  if (!allowedRoles.includes(user.role as any)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black p-4">
        <div className="max-w-md w-full">
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Access Restricted</strong>
              <br />
              Your account ({user.role}) doesn't have permission to access this area. 
              Required role: {allowedRoles.join(' or ')}.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation(user.role === 'admin' ? '/admin' : user.role === 'customer' ? '/portal' : '/')} 
              className="flex-1"
            >
              Go to Your Dashboard
            </Button>
            <Button variant="outline" onClick={() => setLocation("/")} className="flex-1">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected content
  return <>{children}</>;
}