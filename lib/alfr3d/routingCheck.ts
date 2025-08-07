import { glob } from 'glob';
import { readFileSync } from 'fs';
import { SecurityFinding } from '../../types/alfr3d';

interface RouteDefinition {
  method: string;
  path: string;
  file: string;
  line: number;
  hasAuth: boolean;
  hasValidation: boolean;
}

export class RoutingChecker {
  async checkRoutingLogic(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    const routes = await this.extractRoutes();
    
    // Check for duplicate routes
    const routeMap = new Map<string, RouteDefinition[]>();
    routes.forEach(route => {
      const key = `${route.method}:${route.path}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, []);
      }
      routeMap.get(key)!.push(route);
    });
    
    // Find duplicates
    routeMap.forEach((routeList, key) => {
      if (routeList.length > 1) {
        routeList.forEach(route => {
          findings.push({
            type: 'routing_logic',
            severity: 'high',
            message: `Duplicate route definition: ${key}`,
            file: route.file,
            line: route.line,
          });
        });
      }
    });
    
    // Check for missing middleware chains
    routes.forEach(route => {
      if (route.path.includes('/admin') && !route.hasAuth) {
        findings.push({
          type: 'routing_logic',
          severity: 'critical',
          message: 'Admin route missing authentication middleware',
          file: route.file,
          line: route.line,
        });
      }
      
      if (route.method === 'POST' && !route.hasValidation) {
        findings.push({
          type: 'routing_logic',
          severity: 'medium',
          message: 'POST route missing input validation',
          file: route.file,
          line: route.line,
        });
      }
    });
    
    return findings;
  }
  
  private async extractRoutes(): Promise<RouteDefinition[]> {
    const routes: RouteDefinition[] = [];
    const serverFiles = await glob('server/**/*.ts');
    
    const routePattern = /app\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
    const authPattern = /(requireAuth|protectRoute)/;
    const validationPattern = /\.parse\(|validate\(|schema\(/;
    
    for (const file of serverFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        let match;
        while ((match = routePattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const lineContent = lines[lineNumber - 1] || '';
          
          // Check surrounding lines for middleware
          const contextLines = lines.slice(Math.max(0, lineNumber - 3), lineNumber + 3).join('\n');
          
          routes.push({
            method: match[1].toUpperCase(),
            path: match[2],
            file,
            line: lineNumber,
            hasAuth: authPattern.test(contextLines),
            hasValidation: validationPattern.test(contextLines),
          });
        }
        
      } catch (error) {
        console.error(`Error extracting routes from ${file}:`, error);
      }
    }
    
    return routes;
  }
}