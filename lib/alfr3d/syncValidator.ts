import { glob } from 'glob';
import { readFileSync } from 'fs';
import { SecurityFinding } from '../../types/alfr3d';

export class SyncValidator {
  async checkFrontendSync(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    
    // Check React components for common issues
    const componentFiles = await glob('client/src/**/*.{ts,tsx}');
    
    for (const file of componentFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Check for missing error states in forms
        if (content.includes('useForm') || content.includes('useMutation')) {
          if (!content.includes('error') && !content.includes('Error')) {
            findings.push({
              type: 'frontend_sync',
              severity: 'medium',
              message: 'Form component missing error state handling',
              file,
            });
          }
        }
        
        // Check for potentially stale useQuery hooks
        const queryPattern = /useQuery\s*<([^>]+)>\s*\(\s*\{[^}]*queryKey:\s*\[([^\]]+)\]/g;
        let match;
        while ((match = queryPattern.exec(content)) !== null) {
          const queryKey = match[2];
          if (queryKey.includes('static-string') || !queryKey.includes("'")) {
            findings.push({
              type: 'frontend_sync',
              severity: 'low',
              message: 'Query key might be too static - consider dynamic keys for cache invalidation',
              file,
            });
          }
        }
        
        // Check for missing loading states
        if (content.includes('useQuery') && !content.includes('isLoading') && !content.includes('loading')) {
          findings.push({
            type: 'frontend_sync',
            severity: 'low',
            message: 'Component with useQuery missing loading state',
            file,
          });
        }
        
        // Check for potential type mismatches (basic check)
        const apiRequestPattern = /apiRequest\s*\(\s*["'][^"']*["']\s*,\s*["']([^"']*)["']/g;
        const apiCalls = Array.from(content.matchAll(apiRequestPattern));
        
        apiCalls.forEach(call => {
          const method = call[1];
          if (method === 'POST' || method === 'PUT') {
            // Check if there's data being sent
            if (!content.includes('data:') && !content.includes('body:')) {
              findings.push({
                type: 'frontend_sync',
                severity: 'medium',
                message: `${method} request might be missing request body`,
                file,
              });
            }
          }
        });
        
      } catch (error) {
        console.error(`Error checking frontend sync in ${file}:`, error);
      }
    }
    
    return findings;
  }
  
  async checkTypeInterfaceConsistency(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    
    try {
      // Check shared types vs frontend usage
      const sharedFiles = await glob('shared/**/*.ts');
      const frontendFiles = await glob('client/src/**/*.{ts,tsx}');
      
      const sharedTypes = new Set<string>();
      
      // Extract shared type definitions
      for (const file of sharedFiles) {
        const content = readFileSync(file, 'utf-8');
        const typePattern = /export\s+(?:interface|type)\s+(\w+)/g;
        const types = Array.from(content.matchAll(typePattern));
        types.forEach(type => sharedTypes.add(type[1]));
      }
      
      // Check frontend usage
      for (const file of frontendFiles) {
        const content = readFileSync(file, 'utf-8');
        
        // Look for local interface definitions that might conflict
        const localTypePattern = /interface\s+(\w+)/g;
        const localTypes = Array.from(content.matchAll(localTypePattern));
        
        localTypes.forEach(localType => {
          if (sharedTypes.has(localType[1])) {
            findings.push({
              type: 'frontend_sync',
              severity: 'medium',
              message: `Local interface '${localType[1]}' conflicts with shared type`,
              file,
            });
          }
        });
      }
      
    } catch (error) {
      console.error('Error checking type consistency:', error);
    }
    
    return findings;
  }
}