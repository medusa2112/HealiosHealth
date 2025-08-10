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

// Cache the CSRF token for the session
let cachedCsrfToken: string | null = null;

async function getCsrfToken(): Promise<string | null> {
  // Return cached token if available
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }
  
  try {
    const csrfResponse = await fetch('/api/csrf/token', {
      credentials: 'include'
    });
    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json();
      cachedCsrfToken = csrfData.csrfToken;
      console.log('[CSRF] Token fetched and cached:', cachedCsrfToken.substring(0, 10) + '...');
      return cachedCsrfToken;
    }
  } catch (csrfError) {
    console.warn('[CSRF] Failed to get token', csrfError);
  }
  return null;
}

// Clear cached token on auth changes
export function clearCsrfToken() {
  cachedCsrfToken = null;
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
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        console.log('[CSRF] Token added to request:', csrfToken.substring(0, 10) + '...');
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
