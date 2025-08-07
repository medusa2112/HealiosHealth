export interface SecurityIssue {
  id: string;
  type: 'security' | 'routing' | 'schema' | 'sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file: string;
  line?: number;
  route?: string;
  recommendation: string;
  timestamp: string;
  reviewed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
  archived: boolean;
  archivedAt?: string;
  archivedBy?: string;
  fixPrompt?: FixPrompt;
  fixAttempts: FixAttempt[];
  issueKey: string; // Unique identifier for tracking across scans
}

export interface FixPrompt {
  analysis: string;
  steps: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  prerequisites: string[];
  testingApproach: string;
  generatedAt: string;
  generatedBy: string;
}

export interface FixAttempt {
  id: string;
  timestamp: string;
  appliedBy: string;
  success: boolean;
  notes?: string;
  scanResultBefore: number; // Total issues before fix
  scanResultAfter: number;  // Total issues after fix
  newIssuesIntroduced: number;
}

export interface ScanResult {
  issues: SecurityIssue[];
  scanTimestamp: string;
  totalFiles: number;
  totalRoutes: number;
  comparisonResult?: FixEffectivenessAnalysis;
}

export interface FixEffectivenessAnalysis {
  fixed: SecurityIssue[];
  persistent: SecurityIssue[];
  newIssues: SecurityIssue[];
  analysis: string;
  successRate: number;
}

export interface SecurityFinding {
  type: 'api_security' | 'routing_logic' | 'db_orm' | 'frontend_sync';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  file: string;
  line?: number;
  code?: string;
}

export interface ApiSecurityIssue {
  route: string;
  method: string;
  issue: 'leaked_sensitive_data' | 'missing_auth' | 'missing_validation';
  details: string;
}

export interface RoutingIssue {
  route: string;
  issue: 'duplicate_route' | 'method_mismatch' | 'missing_middleware';
  details: string;
}

export interface SchemaIssue {
  table: string;
  issue: 'schema_mismatch' | 'unsafe_query' | 'missing_where_clause';
  details: string;
}

export interface SyncIssue {
  component: string;
  issue: 'interface_mismatch' | 'missing_error_state' | 'stale_state';
  details: string;
}