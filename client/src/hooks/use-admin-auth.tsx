import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { adminAuth, initializeAdminCsrf } from '@/lib/authClient';

interface AdminAuthContextType {
  admin: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Initialize admin CSRF token on mount
  useEffect(() => {
    initializeAdminCsrf();
  }, []);

  // Check admin authentication status
  const { data: admin, isLoading } = useQuery<User | null>({
    queryKey: ['/api/admin/oauth/status'],
    queryFn: () => adminAuth.checkSession(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = async (): Promise<void> => {
    await adminAuth.logout();
    window.location.href = '/admin/login';
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin: admin || null,
        isLoading,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}