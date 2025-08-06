import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "../hooks/use-auth";

interface RequireRoleProps {
  role: 'admin' | 'customer';
  children: React.ReactNode;
  fallbackPath?: string;
}

export function RequireRole({ role, children, fallbackPath = "/login" }: RequireRoleProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== role)) {
      console.log(`Access denied. Required role: ${role}, User role: ${user?.role || 'none'}`);
      setLocation(fallbackPath);
    }
  }, [isLoading, user, role, fallbackPath, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Block access if user doesn't have required role
  if (!user || user.role !== role) {
    return null;
  }

  return <>{children}</>;
}