#!/usr/bin/env tsx

import { readFileSync, readdirSync, writeFileSync, accessSync, constants } from 'fs';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';

// Define error types for better error handling
interface FileSystemError extends Error {
  code?: string;
  path?: string;
}

// Generate unique IDs
function generateId(): string {
  return randomBytes(10).toString('base64url');
}

// 🔒 Security issue patterns
const securityPatterns = {
  unauthRoute: {
    pattern: /router\.(get|post|put|delete)\s*\(\s*['"`][^'"`]+['"`]\s*,\s*(?!requireAuth|isAuthenticated|protectRoute)/,
    description: 'Route missing authentication middleware',
    severity: 'high'
  },
  unvalidatedInput: {
    pattern: /const\s+\{[^}]*\}\s*=\s*req\.(body|query|params)(?!.*after.*safeParse)/,
    description: 'Request data destructured without validation',
    severity: 'critical'
  },
  rawSQL: {
    pattern: /sql\s*`\s*SELECT.*FROM(?!.*\$\{|\$[0-9])/i,
    description: 'Raw SQL query without parameterization',
    severity: 'critical'
  },
  sensitiveResp: {
    pattern: /res\.json\((.*password|.*token|.*secret)/,
    description: 'Sensitive data in JSON response',
    severity: 'high'
  },
  duplicateRoute: {
    pattern: /router\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g,
    description: 'Duplicate route definition',
    severity: 'medium'
  }
};

interface SecurityIssue {
  id: string;
  type: string;
  description: string;
  severity: string;
  filePath: string;
  line: number;
  snippet: string;
  fixed: boolean;
}

const trackedFiles = ['.ts', '.tsx', '.js'];
const srcPath = './server';

function findAllFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    // Check if directory is accessible before attempting to read
    accessSync(dir, constants.R_OK);
    
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories with individual error handling
        try {
          const subFiles = findAllFiles(fullPath);
          files.push(...subFiles);
        } catch (error) {
          const fsError = error as FileSystemError;
          if (fsError.code === 'EACCES') {
            console.warn(`⚠️ Permission denied accessing directory: ${fullPath}`);
          } else if (fsError.code === 'ENOENT') {
            console.warn(`⚠️ Directory not found: ${fullPath}`);
          } else {
            console.warn(`⚠️ Error accessing directory ${fullPath}: ${fsError.message}`);
          }
          // Continue scanning other directories instead of failing completely
          continue;
        }
      } else if (entry.isFile() && trackedFiles.includes(extname(entry.name))) {
        // Verify file is readable before adding to scan list
        try {
          accessSync(fullPath, constants.R_OK);
          files.push(fullPath);
        } catch (error) {
          const fsError = error as FileSystemError;
          if (fsError.code === 'EACCES') {
            console.warn(`⚠️ Permission denied accessing file: ${fullPath}`);
          } else {
            console.warn(`⚠️ Error accessing file ${fullPath}: ${fsError.message}`);
          }
          // Skip this file but continue with others
        }
      }
    }
    
    return files;
  } catch (error) {
    const fsError = error as FileSystemError;
    
    if (fsError.code === 'EACCES') {
      console.warn(`⚠️ Permission denied accessing directory: ${dir}`);
    } else if (fsError.code === 'ENOENT') {
      console.warn(`⚠️ Directory not found: ${dir}`);
    } else if (fsError.code === 'ENOTDIR') {
      console.warn(`⚠️ Path is not a directory: ${dir}`);
    } else {
      console.warn(`⚠️ Unexpected error scanning directory ${dir}: ${fsError.message}`);
    }
    
    // Return empty array to gracefully continue execution
    return [];
  }
}

// Smart context checking functions
function hasValidationInContext(lines: string[], lineIndex: number, lookBack: number = 10): boolean {
  const startIndex = Math.max(0, lineIndex - lookBack);
  const contextLines = lines.slice(startIndex, lineIndex + 1);
  const contextText = contextLines.join('\n');
  
  return /\.safeParse\s*\(/.test(contextText) || 
         /\.parse\s*\(/.test(contextText) ||
         /validate\w*\s*\(/.test(contextText);
}

function hasAuthInRoute(line: string): boolean {
  return /requireAuth|isAuthenticated|protectRoute/.test(line);
}

function isInCommentOrString(line: string, position: number): boolean {
  const beforeMatch = line.substring(0, position);
  const inString = (beforeMatch.match(/'/g) || []).length % 2 !== 0 ||
                  (beforeMatch.match(/"/g) || []).length % 2 !== 0 ||
                  (beforeMatch.match(/`/g) || []).length % 2 !== 0;
  const inComment = /\/\//.test(beforeMatch) || /\/\*/.test(beforeMatch);
  return inString || inComment;
}

async function scanFile(path: string): Promise<SecurityIssue[]> {
  try {
    // Check if file is readable before attempting to scan
    accessSync(path, constants.R_OK);
    
    const content = readFileSync(path, 'utf8');
    const lines = content.split('\n');
    const results: SecurityIssue[] = [];
    const routeMap = new Map<string, number>();

    for (const [key, config] of Object.entries(securityPatterns)) {
      if (key === 'duplicateRoute') {
        // Special handling for duplicate routes
        let match;
        const globalRegex = new RegExp(config.pattern.source, config.pattern.flags);
        while ((match = globalRegex.exec(content)) !== null) {
          const route = match[2];
          const lineIndex = content.substring(0, match.index || 0).split('\n').length - 1;
          
          if (routeMap.has(route)) {
            results.push({
              id: generateId(),
              type: key,
              description: config.description,
              severity: config.severity,
              filePath: path,
              line: lineIndex + 1,
              snippet: lines[lineIndex]?.trim().slice(0, 200) || '',
              fixed: false,
            });
          } else {
            routeMap.set(route, lineIndex + 1);
          }
        }
      } else {
        lines.forEach((line, i) => {
          const match = config.pattern.exec(line);
          if (match && !isInCommentOrString(line, match.index || 0)) {
            // Apply smart context checking
            let shouldReport = true;
            
            if (key === 'unauthRoute') {
              // Check if this route actually has auth middleware
              shouldReport = !hasAuthInRoute(line);
            } else if (key === 'unvalidatedInput') {
              // Check if there's validation in context
              shouldReport = !hasValidationInContext(lines, i);
            }
            
            if (shouldReport) {
              results.push({
                id: generateId(),
                type: key,
                description: config.description,
                severity: config.severity,
                filePath: path,
                line: i + 1,
                snippet: line.trim().slice(0, 200),
                fixed: false,
              });
            }
          }
        });
      }
    }

    return results;
  } catch (error) {
    const fsError = error as FileSystemError;
    
    if (fsError.code === 'EACCES') {
      console.warn(`⚠️ Permission denied reading file: ${path}`);
    } else if (fsError.code === 'ENOENT') {
      console.warn(`⚠️ File not found: ${path}`);
    } else if (fsError.code === 'EISDIR') {
      console.warn(`⚠️ Path is a directory, not a file: ${path}`);
    } else if (fsError.code === 'EMFILE' || fsError.code === 'ENFILE') {
      console.warn(`⚠️ Too many open files, skipping: ${path}`);
    } else {
      console.warn(`⚠️ Error reading file ${path}: ${fsError.message}`);
    }
    
    // Return empty array to continue scanning other files
    return [];
  }
}

function outputResults(issues: SecurityIssue[], files: string[]) {
  console.log(`\n📊 Security Scan Results`);
  console.log(`📁 Files scanned: ${files.length}`);
  
  if (issues.length === 0) {
    console.log('✅ No security issues found!');
    return;
  }
  
  console.log(`⚠️  Total issues found: ${issues.length}`);

  // Group by severity
  const bySeverity = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  for (const severity of severityOrder) {
    if (bySeverity[severity]) {
      const emoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '📋';
      console.log(`${emoji} ${severity.toUpperCase()}: ${bySeverity[severity]}`);
    }
  }

  // Group by type
  const byType = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels: Record<string, string> = {
    unauthRoute: 'Unauthenticated Routes',
    unvalidatedInput: 'Unvalidated Input',
    rawSQL: 'Raw SQL Queries',
    sensitiveResp: 'Sensitive Response Data',
    duplicateRoute: 'Duplicate Routes'
  };
  
  for (const [type, count] of Object.entries(byType)) {
    console.log(`📋 ${typeLabels[type] || type}: ${count}`);
  }

  // Show top 10 critical/high issues
  const criticalIssues = issues
    .filter(i => i.severity === 'critical' || i.severity === 'high')
    .slice(0, 10);

  if (criticalIssues.length > 0) {
    console.log('\n🎯 Top Critical/High Issues:');
    criticalIssues.forEach((issue, index) => {
      console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description} (${issue.filePath}:${issue.line})`);
    });
  }
}

function exportToCSV(issues: SecurityIssue[], filename = 'security-issues.csv') {
  const headers = 'ID,Type,Description,Severity,File,Line,Snippet,Fixed\n';
  const rows = issues.map(issue => {
    const escapedSnippet = issue.snippet.replace(/"/g, '""');
    return [
      issue.id,
      issue.type,
      issue.description,
      issue.severity,
      issue.filePath,
      issue.line,
      `"${escapedSnippet}"`,
      issue.fixed
    ].join(',');
  }).join('\n');
  
  writeFileSync(filename, headers + rows);
  console.log(`📄 Security issues exported to ${filename}`);
}

async function run() {
  console.log('🔍 Starting security scan...');
  console.log(`📂 Scanning directory: ${srcPath}`);

  const files = findAllFiles(srcPath);

  const allIssues = (await Promise.all(files.map(scanFile))).flat();

  outputResults(allIssues, files);

  // Export to CSV if issues found
  if (allIssues.length > 0) {
    exportToCSV(allIssues);
  }
}

// Run the scan
run().catch((err) => {
  // // console.error('❌ Security scanner error:', err);
  process.exit(1);
});