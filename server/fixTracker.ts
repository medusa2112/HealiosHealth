#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { db } from './db';
import { securityIssues, fixAttempts } from '@shared/alfr3d-schema';
import { randomBytes } from 'crypto';

// Generate nanoid-style IDs
function generateId(): string {
  return randomBytes(10).toString('base64url');
}

// 🔒 Regex signatures for security issues
const issues = {
  unauthRoute: /router\.(get|post|put|delete)\(['"`][^'"`]+['"`],\s*(?!requireAuth)/,
  unvalidatedInput: /req\.(body|query|params)(?!.*safeParse|.*validate)/,
  rawSQL: /[`'"]\s*SELECT.*FROM.*\s*['"`]/i,
  sensitiveResp: /res\.json\((.*password|.*token|.*secret)/,
  duplicateRoute: /router\.(get|post|put|delete)\(['"`]([^'"`]+)['"`]/g,
};

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

async function scanFile(path: string) {
  try {
    const content = readFileSync(path, 'utf8');
    const lines = content.split('\n');
    const results = [];
    const routeMap = new Map<string, number>();

    for (const [key, regex] of Object.entries(issues)) {
      if (key === 'duplicateRoute') {
        // Special handling for duplicate routes
        let match;
        const globalRegex = new RegExp(regex.source, regex.flags);
        while ((match = globalRegex.exec(content)) !== null) {
          const route = match[2];
          const lineIndex = content.substring(0, match.index || 0).split('\n').length - 1;
          
          if (routeMap.has(route)) {
            results.push({
              id: generateId(),
              type: 'duplicateRoute',
              filePath: path,
              line: lineIndex + 1,
              snippet: lines[lineIndex]?.trim().slice(0, 300) || '',
              fixed: false,
            });
          } else {
            routeMap.set(route, lineIndex + 1);
          }
        }
      } else {
        lines.forEach((line, i) => {
          if (regex.test(line)) {
            results.push({
              id: generateId(),
              type: key,
              filePath: path,
              line: i + 1,
              snippet: line.trim().slice(0, 300),
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

async function run() {
  try {
    console.log('🔍 Starting security scan...');
    
    const files = findAllFiles(srcPath);
    console.log(`📁 Scanning ${files.length} files...`);
    
    const allIssues = (await Promise.all(files.map(scanFile))).flat();

    // Insert issues into database
    for (const issue of allIssues) {
      try {
        await db.insert(securityIssues).values(issue);
      } catch (error) {
        console.warn(`Warning: Could not insert issue:`, error instanceof Error ? error.message : String(error));
      }
    }

    // Create fix attempt record
    const attemptId = generateId();
    const summary = `Detected ${allIssues.length} security issues on ${new Date().toISOString()}`;
    
    try {
      await db.insert(fixAttempts).values({
        id: attemptId,
        summary,
        fileCount: files.length,
        issueCount: allIssues.length,
      });
    } catch (error) {
      console.warn(`Warning: Could not insert fix attempt:`, error instanceof Error ? error.message : String(error));
    }

    console.log(`✅ Scan complete!`);
    console.log(`📊 Results:`);
    console.log(`   - Files scanned: ${files.length}`);
    console.log(`   - Issues found: ${allIssues.length}`);
    console.log(`   - Fix attempt ID: ${attemptId}`);

    // Summary by issue type
    const issueTypes = allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(issueTypes).length > 0) {
      console.log(`\n🔒 Issues by type:`);
      for (const [type, count] of Object.entries(issueTypes)) {
        const typeLabels: Record<string, string> = {
          unauthRoute: 'Unauthenticated Routes',
          unvalidatedInput: 'Unvalidated Input',
          rawSQL: 'Raw SQL Queries',
          sensitiveResp: 'Sensitive Response Data',
          duplicateRoute: 'Duplicate Routes'
        };
        console.log(`   - ${typeLabels[type] || type}: ${count}`);
      }
    }

  } catch (error) {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  }
}

// Run the scan
run().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});