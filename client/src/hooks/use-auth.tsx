import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: { username: string; email: string; password: string; sessionToken?: string }) => Promise<boolean>;
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
    console.log('[AUTH] userData changed:', userData, 'isLoading:', isLoading);
    if (userData && typeof userData === 'object' && 'id' in userData) {
      console.log('[AUTH] Setting user:', userData);
      setUser(userData as User);
    } else {
      console.log('[AUTH] Clearing user');
      setUser(null);
    }
  }, [userData, isLoading]);

  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Force immediate refetch to ensure auth state is current
        setTimeout(() => refetch(), 100);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: { username: string; email: string; password: string; sessionToken?: string }): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        refetch(); // Refresh user data
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

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
        login,
        logout,
        register,
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