#!/usr/bin/env tsx

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';

// Generate unique IDs
function generateId(): string {
  return randomBytes(10).toString('base64url');
}

// 🔒 Security issue patterns
const securityPatterns = {
  unauthRoute: {
    pattern: /router\.(get|post|put|delete)\(['"`][^'"`]+['"`],\s*(?!requireAuth)/,
    description: 'Route missing requireAuth middleware',
    severity: 'high'
  },
  unvalidatedInput: {
    pattern: /req\.(body|query|params)(?!.*safeParse|.*validate)/,
    description: 'Request data used without validation',
    severity: 'critical'
  },
  rawSQL: {
    pattern: /[`'"]\s*SELECT.*FROM.*\s*['"`]/i,
    description: 'Raw SQL query detected (injection risk)',
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
  try {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? findAllFiles(join(dir, entry.name))
        : trackedFiles.includes(extname(entry.name)) ? [join(dir, entry.name)] : []
    );
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}`);
    return [];
  }
}

async function scanFile(path: string): Promise<SecurityIssue[]> {
  try {
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
          if (config.pattern.test(line)) {
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
        });
      }
    }

    return results;
  } catch (error) {
    console.warn(`Warning: Could not scan file ${path}:`, error instanceof Error ? error.message : String(error));
    return [];
  }
}

function outputResults(issues: SecurityIssue[], files: string[]) {
  console.log(`\n✅ Security Scan Complete!`);
  console.log(`📊 Results:`);
  console.log(`   - Files scanned: ${files.length}`);
  console.log(`   - Issues found: ${issues.length}`);

  if (issues.length === 0) {
    console.log(`\n🎉 No security issues found! Great job!`);
    return;
  }

  // Group by severity
  const bySeverity = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`\n🔒 Issues by severity:`);
  const severityOrder = ['critical', 'high', 'medium', 'low'];
  for (const severity of severityOrder) {
    if (bySeverity[severity]) {
      const emoji = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '📋';
      console.log(`   ${emoji} ${severity}: ${bySeverity[severity]}`);
    }
  }

  // Group by type
  const byType = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`\n📋 Issues by type:`);
  const typeLabels: Record<string, string> = {
    unauthRoute: 'Unauthenticated Routes',
    unvalidatedInput: 'Unvalidated Input',
    rawSQL: 'Raw SQL Queries',
    sensitiveResp: 'Sensitive Response Data',
    duplicateRoute: 'Duplicate Routes'
  };
  
  for (const [type, count] of Object.entries(byType)) {
    console.log(`   - ${typeLabels[type] || type}: ${count}`);
  }

  // Show top 10 critical/high issues
  const criticalIssues = issues
    .filter(i => i.severity === 'critical' || i.severity === 'high')
    .slice(0, 10);

  if (criticalIssues.length > 0) {
    console.log(`\n🚨 Top Critical/High Issues:`);
    criticalIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
      console.log(`      📁 ${issue.filePath}:${issue.line}`);
      console.log(`      📝 ${issue.snippet}`);
      console.log();
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
  console.log(`📄 Results exported to ${filename}`);
}

async function run() {
  console.log('🔍 Starting Security Fix Tracker...');
  console.log('🎯 Scanning for:');
  console.log('   - Routes missing requireAuth');
  console.log('   - Unvalidated request inputs (req.body, req.params, req.query)');
  console.log('   - Raw SQL string construction');
  console.log('   - JSON responses exposing sensitive fields');
  console.log('   - Duplicate route definitions');
  console.log();

  const files = findAllFiles(srcPath);
  console.log(`📁 Scanning ${files.length} TypeScript files...`);
  
  const allIssues = (await Promise.all(files.map(scanFile))).flat();

  outputResults(allIssues, files);

  // Export to CSV if issues found
  if (allIssues.length > 0) {
    exportToCSV(allIssues);
  }
}

// Run the scan
run().catch((err) => {
  console.error('❌ Security scanner error:', err);
  process.exit(1);
});