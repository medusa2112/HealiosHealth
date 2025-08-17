/**
 * Client-side admin configuration
 * Controls admin panel visibility based on environment
 */

// Check if admin is enabled - defaults to false in production
export const isAdminEnabled = (): boolean => {
  // Never enable admin in production unless explicitly set
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_ADMIN_ENABLED === 'true';
  }
  
  // In development, enable by default unless explicitly disabled
  return import.meta.env.VITE_ADMIN_ENABLED !== 'false';
};

// Log configuration for transparency (only in development)
if (import.meta.env.DEV) {
  );
}