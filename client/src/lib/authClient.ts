/**
 * Authentication client for dual auth system
 * Handles separate customer and admin authentication with CSRF protection
 */

// Helper to read cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// CSRF token getters
export const getCustCsrf = () => getCookie('csrf_cust');
export const getAdminCsrf = () => getCookie('csrf_admin');

// Initialize CSRF tokens on app boot
export async function initializeCustomerCsrf(): Promise<void> {
  try {
    await fetch('/api/csrf', {
      method: 'GET',
      credentials: 'include'
    });
    console.log('[AUTH] Customer CSRF token initialized');
  } catch (error) {
    console.error('[AUTH] Failed to initialize customer CSRF:', error);
  }
}

export async function initializeAdminCsrf(): Promise<void> {
  try {
    await fetch('/api/admin/csrf', {
      method: 'GET',
      credentials: 'include'
    });
    console.log('[AUTH] Admin CSRF token initialized');
  } catch (error) {
    console.error('[AUTH] Failed to initialize admin CSRF:', error);
  }
}

// Customer authentication functions
export const customerAuth = {
  async login(email: string, password: string) {
    const csrfToken = getCustCsrf();
    const response = await fetch('/api/auth/customer/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken })
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },

  async register(email: string, password: string, firstName: string, lastName: string) {
    const csrfToken = getCustCsrf();
    const response = await fetch('/api/auth/customer/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken })
      },
      body: JSON.stringify({ email, password, firstName, lastName })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },

  async logout() {
    const csrfToken = getCustCsrf();
    const response = await fetch('/api/auth/customer/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(csrfToken && { 'X-CSRF-Token': csrfToken })
      }
    });
    
    if (!response.ok) {
      console.error('[AUTH] Logout failed:', response.status);
    }
    
    return response;
  },

  async checkSession() {
    const response = await fetch('/api/auth/customer/me', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error('Session check failed');
    }
    
    const data = await response.json();
    return data.user;
  }
};

// Admin authentication functions
export const adminAuth = {
  async login(email: string, password: string, totp?: string) {
    const csrfToken = getAdminCsrf();
    const response = await fetch('/api/auth/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken })
      },
      body: JSON.stringify({ email, password, totp })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Admin login failed');
    }
    
    return response.json();
  },

  async logout() {
    const csrfToken = getAdminCsrf();
    const response = await fetch('/api/auth/admin/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(csrfToken && { 'X-CSRF-Token': csrfToken })
      }
    });
    
    if (!response.ok) {
      console.error('[AUTH] Admin logout failed:', response.status);
    }
    
    return response;
  },

  async checkSession() {
    const response = await fetch('/api/auth/admin/me', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error('Admin session check failed');
    }
    
    const data = await response.json();
    return data.admin;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const csrfToken = getAdminCsrf();
    const response = await fetch('/api/auth/admin/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken })
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password change failed');
    }
    
    return response.json();
  }
};

// Guest to account order claim
export async function claimGuestOrders(orderIds: string[]) {
  const csrfToken = getCustCsrf();
  const response = await fetch('/api/orders/claim', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken })
    },
    body: JSON.stringify({ orderIds })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to claim orders');
  }
  
  return response.json();
}

// Initialize CSRF on app boot based on context
export async function initializeAuth(isAdminContext: boolean = false) {
  if (isAdminContext) {
    await initializeAdminCsrf();
  } else {
    await initializeCustomerCsrf();
  }
}