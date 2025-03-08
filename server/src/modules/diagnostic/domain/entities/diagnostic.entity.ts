import { SsmDeviceDiagnostic } from 'ssm-shared-lib';

export type DiagnosticCheckType = SsmDeviceDiagnostic.Checks;

export interface DiagnosticResult {
  success: boolean;
  severity: 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

export interface DiagnosticReport {
  deviceId: string;
  timestamp: Date;
  results: Record<DiagnosticCheckType, DiagnosticResult>;
}