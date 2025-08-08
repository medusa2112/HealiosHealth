// Client-side logger interface for security fix logging
// This connects to the server-side security logging system

export interface SecurityFixLog {
  route: string;
  file: string;
  type: 'unauthRoute' | 'unvalidatedInput' | 'duplicateRoute' | 'rateLimitBypass' | 'authBypass' | 'other';
  fixedBy: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
}

export async function logSecurityFix(fixLog: SecurityFixLog): Promise<void> {
  try {
    // Send the security fix log to the server-side logging system
    const response = await fetch('/api/admin/security/fix-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fixLog),
      credentials: 'include' // Include authentication cookies
    });

    if (!response.ok) {
      // If server logging fails, at least log to console
      console.warn('Failed to log security fix to server, logging locally:', fixLog);
      logSecurityFixLocally(fixLog);
      return;
    }

    console.log(`✅ Security fix logged: ${fixLog.type} in ${fixLog.route}`);
  } catch (error) {
    console.error('Failed to log security fix:', error);
    // Fallback to local logging
    logSecurityFixLocally(fixLog);
  }
}

function logSecurityFixLocally(fixLog: SecurityFixLog): void {
  const fixTypeEmoji = {
    unauthRoute: '🔒',
    unvalidatedInput: '🛡️',
    duplicateRoute: '🔄',
    rateLimitBypass: '⏱️',
    authBypass: '🚫',
    other: '🔧'
  };

  const emoji = fixTypeEmoji[fixLog.type] || '🔧';
  const severity = (fixLog.severity || 'medium').toUpperCase();
  
  console.log(`${emoji} SECURITY FIX [${severity}]: ${fixLog.type} fixed in ${fixLog.route} by ${fixLog.fixedBy}`);
  
  // Store in localStorage for potential retry
  const logKey = `security_fix_${Date.now()}`;
  localStorage.setItem(logKey, JSON.stringify(fixLog));
}

// Helper function to retry failed logs
export async function retryFailedSecurityLogs(): Promise<void> {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('security_fix_'));
  
  for (const key of keys) {
    try {
      const logData = JSON.parse(localStorage.getItem(key) || '');
      await logSecurityFix(logData);
      localStorage.removeItem(key); // Remove after successful retry
    } catch (error) {
      console.warn('Failed to retry security log:', error);
    }
  }
}