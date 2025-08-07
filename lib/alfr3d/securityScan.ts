import { glob } from 'glob';
import { readFileSync } from 'fs';
import { SecurityFinding } from '../../types/alfr3d';

export class SecurityScanner {
  private sensitivePatterns = [
    /email\s*[:=]\s*["']?[^"'\s]+@[^"'\s]+/i,
    /password\s*[:=]\s*["'][^"']*["']/i,
    /token\s*[:=]\s*["'][^"']*["']/i,
    /api[_-]?key\s*[:=]\s*["'][^"']*["']/i,
    /secret\s*[:=]\s*["'][^"']*["']/i,
  ];

  private authBypassPatterns = [
    /res\.json\([^)]*\)\s*;?\s*$(?!.*requireAuth|.*protectRoute)/gm,
    /app\.(get|post|put|delete)\([^,]+,\s*(?!.*requireAuth)(?!.*protectRoute)async/g,
  ];

  private validationPatterns = [
    /req\.body(?!\.[a-zA-Z]+\s*=\s*.*\.parse\()/g,
    /req\.params(?!\.[a-zA-Z]+\s*=\s*.*\.parse\()/g,
    /req\.query(?!\.[a-zA-Z]+\s*=\s*.*\.parse\()/g,
  ];

  async scanApiSecurity(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    const serverFiles = await glob('server/**/*.ts');
    
    for (const file of serverFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        // Check for sensitive data exposure
        lines.forEach((line, index) => {
          this.sensitivePatterns.forEach(pattern => {
            if (pattern.test(line)) {
              findings.push({
                type: 'api_security',
                severity: 'high',
                message: 'Potential sensitive data exposure in response',
                file,
                line: index + 1,
                code: line.trim(),
              });
            }
          });
        });

        // Check for missing authentication
        this.authBypassPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            findings.push({
              type: 'api_security',
              severity: 'critical',
              message: 'Route missing authentication middleware',
              file,
              line: lineNumber,
              code: match[0],
            });
          }
        });

        // Check for missing input validation
        this.validationPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            findings.push({
              type: 'api_security',
              severity: 'medium',
              message: 'Direct use of request data without validation',
              file,
              line: lineNumber,
              code: lines[lineNumber - 1]?.trim(),
            });
          }
        });

      } catch (error) {
        console.error(`Error scanning file ${file}:`, error);
      }
    }
    
    return findings;
  }

  async scanForUnsafeQueries(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    const serverFiles = await glob('server/**/*.ts');
    
    const unsafePatterns = [
      /eval\s*\(/g,
      /new\s+Function\s*\(/g,
      /\$\{[^}]*req\.[^}]*\}/g, // Template literal with req data
      /`[^`]*\$\{[^}]*req\.[^}]*\}[^`]*`/g, // SQL injection via template literals
    ];
    
    for (const file of serverFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        unsafePatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            findings.push({
              type: 'api_security',
              severity: 'critical',
              message: 'Potential code injection vulnerability',
              file,
              line: lineNumber,
              code: match[0],
            });
          }
        });
        
      } catch (error) {
        console.error(`Error scanning file ${file}:`, error);
      }
    }
    
    return findings;
  }
}