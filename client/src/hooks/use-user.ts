import { useQuery } from "@tanstack/react-query";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export function useUser() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['/auth/me'],
    queryFn: async () => {
      try {
        const response = await fetch('/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null; // User not authenticated
          }
          throw new Error('Failed to fetch user');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}