export interface SecurityTest {
  id: string;
  name: string;
  category: SecurityTestCategory;
  description: string;
  remediation?: string;
  weight: number; // Impact weight of the test (1-10)
  frameworks?: string[]; // e.g., ['CIS', 'NIST', 'ISO27001']
  dependencies?: string[]; // IDs of tests that must run before this one
  platforms: string[]; // e.g., ['linux', 'darwin']
  command: string | ((platform: string) => string); // Command to run or function that returns command
  evaluate: (output: string) => SecurityTestResult;
  tags?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface SecurityTestResult {
  status: 'pass' | 'fail' | 'warning' | 'skipped';
  message?: string;
  details?: string;
  score?: number;
}

export type SecurityTestCategory =
  | 'boot_security'
  | 'file_systems'
  | 'kernel'
  | 'memory'
  | 'authentication'
  | 'users_groups'
  | 'shells'
  | 'file_integrity'
  | 'malware'
  | 'network_configuration'
  | 'network_ports'
  | 'processes'
  | 'software'
  | 'ssh'
  | 'system_integrity'
  | 'containers'
  | 'database_security'
  | 'web_servers'
  | 'php'
  | 'dns'
  | 'crypto'
  | 'virtualization';

export interface TestGroup {
  category: SecurityTestCategory;
  tests: SecurityTest[];
}
