import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check authentication status
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async (): Promise<void> => {
    await fetch('/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    });
    window.location.href = '/';
  };

  const login = () => {
    window.location.href = '/api/auth/login';
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