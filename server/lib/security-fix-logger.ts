// Direct server-side security fix logging utility
// Use this for logging security fixes from automated scripts and internal processes

import { SecurityLogger, SecurityFixLog } from './security-logger';

// Re-export the interface and main logging function
export { SecurityFixLog } from './security-logger';

// Direct logging function for server-side use
export async function logSecurityFix(fixLog: SecurityFixLog): Promise<void> {
  return SecurityLogger.logSecurityFix(fixLog);
}

// Convenience function for automated fix bots
export async function logAutomatedFix(
  route: string,
  file: string,
  fixType: SecurityFixLog['type'],
  botName: string = 'autofix-bot',
  severity: SecurityFixLog['severity'] = 'medium',
  details?: Record<string, any>
): Promise<void> {
  return logSecurityFix({
    route,
    file,
    type: fixType,
    fixedBy: botName,
    timestamp: new Date().toISOString(),
    severity,
    details
  });
}

// Batch logging for multiple fixes
export async function logMultipleSecurityFixes(fixes: SecurityFixLog[]): Promise<void> {
  const results = await Promise.allSettled(
    fixes.map(fix => SecurityLogger.logSecurityFix(fix))
  );
  
  const failed = results.filter(result => result.status === 'rejected').length;
  if (failed > 0) {
    
  }

}