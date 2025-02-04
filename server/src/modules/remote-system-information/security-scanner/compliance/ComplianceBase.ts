import { SecurityScanResult } from '../types';
import { RemoteSSHExecutorComponent } from '../../core/RemoteSSHExecutorComponent';

export interface ComplianceCheckResult extends SecurityScanResult {
  complianceId: string;
  framework: string;
  controlFamily?: string;
  impact?: 'low' | 'moderate' | 'high';
}

export abstract class ComplianceFramework {
  constructor(protected executor: RemoteSSHExecutorComponent) {}

  abstract getName(): string;
  abstract getVersion(): string;
  abstract performChecks(): Promise<ComplianceCheckResult[]>;
  
  protected async executeCheck(command: string, options?: { elevatePrivilege?: boolean }): Promise<string> {
    try {
      return await this.executor.runCommand(command, { elevatePrivilege: options?.elevatePrivilege ?? true });
    } catch (error) {
      throw new Error(`Failed to execute compliance check: ${error}`);
    }
  }
}
