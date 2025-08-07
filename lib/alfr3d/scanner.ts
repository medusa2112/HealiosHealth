import { SecurityScanner } from './securityScan';
import { RoutingChecker } from './routingCheck';
import { SchemaChecker } from './schemaCheck';
import { SyncValidator } from './syncValidator';
import { SecurityFinding } from '../../types/alfr3d';

export class Alfr3dScanner {
  private securityScanner = new SecurityScanner();
  private routingChecker = new RoutingChecker();
  private schemaChecker = new SchemaChecker();
  private syncValidator = new SyncValidator();
  
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;
  
  async performFullScan(): Promise<SecurityFinding[]> {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    
    console.log('[ALFR3D] Starting security scan...');
    const startTime = Date.now();
    
    try {
      const [
        apiSecurityIssues,
        unsafeQueryIssues,
        routingIssues,
        schemaIssues,
        schemaDefIssues,
        frontendSyncIssues,
        typeConsistencyIssues
      ] = await Promise.all([
        this.securityScanner.scanApiSecurity(),
        this.securityScanner.scanForUnsafeQueries(),
        this.routingChecker.checkRoutingLogic(),
        this.schemaChecker.checkSchemaConsistency(),
        this.schemaChecker.checkSchemaDefinitions(),
        this.syncValidator.checkFrontendSync(),
        this.syncValidator.checkTypeInterfaceConsistency(),
      ]);
      
      const allFindings = [
        ...apiSecurityIssues,
        ...unsafeQueryIssues,
        ...routingIssues,
        ...schemaIssues,
        ...schemaDefIssues,
        ...frontendSyncIssues,
        ...typeConsistencyIssues,
      ];
      
      const scanDuration = Date.now() - startTime;
      console.log(`[ALFR3D] Scan completed in ${scanDuration}ms. Found ${allFindings.length} issues.`);
      
      return allFindings;
      
    } catch (error) {
      console.error('[ALFR3D] Scan failed:', error);
      return [];
    }
  }
  
  startBackgroundScanning(intervalMs: number = 30000): void {
    if (process.env.NODE_ENV !== 'development') {
      console.log('[ALFR3D] Background scanning disabled in production');
      return;
    }
    
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    console.log(`[ALFR3D] Starting background scanning every ${intervalMs}ms`);
    
    // Initial scan
    this.performFullScan().catch(console.error);
    
    // Set up recurring scans
    this.scanInterval = setInterval(async () => {
      if (!this.isScanning) {
        this.isScanning = true;
        try {
          await this.performFullScan();
        } catch (error) {
          console.error('[ALFR3D] Background scan error:', error);
        } finally {
          this.isScanning = false;
        }
      }
    }, intervalMs);
  }
  
  stopBackgroundScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
      console.log('[ALFR3D] Background scanning stopped');
    }
  }
  
  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }
}