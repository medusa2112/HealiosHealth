// ALFR3D Types for the security system

export interface SecurityIssue {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  file: string;
  line?: number;
  route?: string;
  status: 'open' | 'in_progress' | 'resolved';
  fixPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityScan {
  id: string;
  status: 'running' | 'completed' | 'failed';
  issuesFound: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface FixPrompt {
  analysis: string;
  steps: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: string;
  prerequisites: string[];
  testingApproach: string;
}

export interface FixEffectivenessAnalysis {
  fixed: SecurityIssue[];
  persistent: SecurityIssue[];
  newIssues: SecurityIssue[];
  analysis: string;
}

export interface FixAttempt {
  id: string;
  issueId: string;
  attempt: number;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface InsertFixAttempt {
  issueId: string;
  attempt: number;
  success: boolean;
  errorMessage?: string;
}