export interface SecurityScanOptions {
  categories?: SecurityScanCategory[];
  timeout?: number;
  verbose?: boolean;
}

export type SecurityScanCategory =
  | 'ssh'
  | 'firewall'
  | 'updates'
  | 'passwords'
  | 'filesystem'
  | 'services'
  | 'network'
  | 'audit';

export interface SecurityReport {
  timestamp: string;
  hostname: string;
  ipAddress: string;
  scanDuration: number;
  results: SecurityScanResult[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    warning: number;
  };
}

export interface SecurityScanResult {
  category: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  details?: string;
  recommendation?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  compliance?: {
    standard: string;
    control: string;
  }[];
}
