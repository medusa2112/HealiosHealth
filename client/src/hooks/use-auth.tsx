import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { customerAuth, initializeCustomerCsrf } from '@/lib/authClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize CSRF token on mount
  useEffect(() => {
    initializeCustomerCsrf();
  }, []);

  // Check authentication status using new customer endpoint
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/customer/me'],
    queryFn: () => customerAuth.checkSession(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async (): Promise<void> => {
    await customerAuth.logout();
    window.location.href = '/';
  };

  const login = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        logout,
        login,
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

// Alias for backward compatibility
export const useAuth = useUser;