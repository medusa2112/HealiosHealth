import { glob } from 'glob';
import { readFileSync } from 'fs';
import { SecurityFinding } from '../../types/alfr3d';

export class SchemaChecker {
  async checkSchemaConsistency(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    
    // Check for unsafe query patterns
    const serverFiles = await glob('server/**/*.ts');
    
    const unsafeQueryPatterns = [
      /db\.execute\s*\(\s*`[^`]*\$\{[^}]*\}[^`]*`\s*\)/g, // Raw SQL with interpolation
      /db\.run\s*\(\s*`[^`]*\$\{[^}]*\}[^`]*`\s*\)/g,
      /\.where\s*\(\s*sql`[^`]*\$\{[^}]*req\.[^}]*\}[^`]*`\s*\)/g, // SQL injection in where clauses
    ];
    
    for (const file of serverFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Check for unsafe queries
        unsafeQueryPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            findings.push({
              type: 'db_orm',
              severity: 'critical',
              message: 'Unsafe database query with user input interpolation',
              file,
              line: lineNumber,
              code: match[0],
            });
          }
        });
        
        // Check for queries without where clauses on sensitive operations
        const deletePattern = /db\.delete\s*\([^)]+\)(?!\s*\.where)/g;
        const updatePattern = /db\.update\s*\([^)]+\)(?!\s*\.set.*\.where)/g;
        
        [deletePattern, updatePattern].forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            findings.push({
              type: 'db_orm',
              severity: 'high',
              message: 'Database operation without WHERE clause - potential data loss',
              file,
              line: lineNumber,
              code: match[0],
            });
          }
        });
        
      } catch (error) {
        console.error(`Error checking schema in ${file}:`, error);
      }
    }
    
    return findings;
  }
  
  async checkSchemaDefinitions(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') return [];
    
    const findings: SecurityFinding[] = [];
    const schemaFiles = await glob('shared/**/*schema*.ts');
    
    for (const file of schemaFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        
        // Check for missing validation schemas
        const tablePattern = /export\s+const\s+(\w+)\s*=\s*pgTable/g;
        const tables = [];
        let match;
        while ((match = tablePattern.exec(content)) !== null) {
          tables.push(match[1]);
        }
        
        tables.forEach(tableName => {
          const hasInsertSchema = content.includes(`insert${tableName.charAt(0).toUpperCase() + tableName.slice(1)}Schema`);
          if (!hasInsertSchema) {
            findings.push({
              type: 'db_orm',
              severity: 'medium',
              message: `Missing insert schema validation for table: ${tableName}`,
              file,
            });
          }
        });
        
        // Check for potentially missing indexes on foreign keys
        const foreignKeyPattern = /(\w+)Id:\s*text\(/g;
        const foreignKeys = [];
        let fkMatch;
        while ((fkMatch = foreignKeyPattern.exec(content)) !== null) {
          foreignKeys.push(fkMatch);
        }
        
        if (foreignKeys.length > 0) {
          findings.push({
            type: 'db_orm',
            severity: 'low',
            message: 'Consider adding indexes for foreign key columns for better performance',
            file,
          });
        }
        
      } catch (error) {
        console.error(`Error checking schema definitions in ${file}:`, error);
      }
    }
    
    return findings;
  }
}