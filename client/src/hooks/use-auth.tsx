import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  // OAuth login handled by redirecting to /api/login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Query to get current user with proper 401 handling
  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: true,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute for auth queries
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });

  useEffect(() => {
    if (userData && typeof userData === 'object' && 'id' in userData) {
      setUser(userData as User);
    } else {
      setUser(null);
    }
  }, [userData]);

  // OAuth login: redirect to /api/login
  // No manual login/register needed

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Force immediate refetch to clear auth state
      setTimeout(() => refetch(), 100);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
}