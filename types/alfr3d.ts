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
}

export interface ScanResult {
  issues: SecurityIssue[];
  scanTimestamp: string;
  totalFiles: number;
  totalRoutes: number;
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