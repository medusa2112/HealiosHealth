import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    // 
    throw new Error(`${res.status}: ${text}`);
  }
}

// Cache CSRF tokens for both customer and admin
let cachedCustomerCsrfToken: string | null = null;
let cachedAdminCsrfToken: string | null = null;

async function getCsrfToken(isAdminRoute = false): Promise<string | null> {
  const cacheKey = isAdminRoute ? 'admin' : 'customer';
  const cachedToken = isAdminRoute ? cachedAdminCsrfToken : cachedCustomerCsrfToken;
  
  // Return cached token if available
  if (cachedToken) {
    return cachedToken;
  }
  
  try {
    // Use admin CSRF endpoint for admin routes
    const endpoint = isAdminRoute ? '/api/admin/csrf' : '/api/csrf/token';
    const csrfResponse = await fetch(endpoint, {
      credentials: 'include'
    });
    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json();
      const token = csrfData.csrfToken || csrfData.token;
      
      // Cache the token
      if (isAdminRoute) {
        cachedAdminCsrfToken = token;
      } else {
        cachedCustomerCsrfToken = token;
      }
      
      return token;
    }
  } catch (csrfError) {
    
  }
  return null;
}

// Clear cached tokens on auth changes
export function clearCsrfToken() {
  cachedCustomerCsrfToken = null;
  cachedAdminCsrfToken = null;
  console.log('[CSRF] Cleared cached CSRF tokens');
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {

  const startTime = Date.now();
  
  try {
    // Get CSRF token for POST/PUT/DELETE requests
    let headers: Record<string, string> = {};
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    
    if (method !== 'GET' && method !== 'HEAD') {
      // Check if this is an admin route
      const isAdminRoute = url.includes('/api/admin/');
      const csrfToken = await getCsrfToken(isAdminRoute);
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    const duration = Date.now() - startTime;

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    const duration = Date.now() - startTime;
    // 
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    const startTime = Date.now();
    const res = await fetch(url, {
      credentials: "include",
    });

    const duration = Date.now() - startTime;

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    console.log('[QUERY] Data received', { url, dataSize: JSON.stringify(data).length });
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Optimize caching for better performance
      staleTime: 2 * 60 * 1000, // 2 minutes - faster updates
      gcTime: 15 * 60 * 1000, // 15 minutes - longer garbage collection
      retry: false,
    },
    mutations: {
      retry: false,
      // Add optimistic updates for admin operations
      onSuccess: () => {
        // Invalidate only specific queries after mutation success
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['/api/admin'], refetchType: 'none' });
        }, 100);
      },
    },
  },
});
