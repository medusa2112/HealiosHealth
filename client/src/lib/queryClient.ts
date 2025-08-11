import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error('[API_ERROR] Response not OK', {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      responseText: text
    });
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
      
      console.log(`[CSRF] ${cacheKey} token fetched and cached:`, token.substring(0, 10) + '...');
      return token;
    }
  } catch (csrfError) {
    console.warn(`[CSRF] Failed to get ${cacheKey} token`, csrfError);
  }
  return null;
}

// Clear cached tokens on auth changes
export function clearCsrfToken() {
  cachedCustomerCsrfToken = null;
  cachedAdminCsrfToken = null;
  console.log('[CSRF] Token cache cleared');
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log('[API_REQUEST] Starting request', {
    method,
    url,
    hasData: !!data,
    dataType: data ? typeof data : 'none'
    // Removed 'data' to prevent circular reference errors
  });
  
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
        console.log(`[CSRF] ${isAdminRoute ? 'Admin' : 'Customer'} token added to request:`, csrfToken.substring(0, 10) + '...');
      }
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    const duration = Date.now() - startTime;
    console.log('[API_REQUEST] Response received', {
      url,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      duration: `${duration}ms`
      // Removed headers to prevent circular reference errors
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API_REQUEST] Request failed', {
      url,
      method,
      error,
      duration: `${duration}ms`,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
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
    console.log('[QUERY] Fetching', { url, queryKey });
    
    const startTime = Date.now();
    const res = await fetch(url, {
      credentials: "include",
    });

    const duration = Date.now() - startTime;
    console.log('[QUERY] Response', {
      url,
      status: res.status,
      duration: `${duration}ms`
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log('[QUERY] 401 - Returning null as configured');
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
      // Cache admin queries for 5 minutes to prevent excessive re-fetching
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
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
