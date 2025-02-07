import { TestGroup } from '../types';

const sshTests: TestGroup = {
  category: 'ssh',
  tests: [
    {
      id: 'SSH-001',
      name: 'SSH Protocol Version',
      category: 'ssh',
      description: 'Checks if SSH is configured to use only Protocol 2',
      weight: 8,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'grep -i "^Protocol" /etc/ssh/sshd_config',
      evaluate: (output: string) => {
        if (!output) {
          return {
            status: 'warning',
            message: 'Protocol version not explicitly set',
            details: 'SSH Protocol version should be explicitly set to 2',
          };
        }
        return {
          status: output.includes('Protocol 2') ? 'pass' : 'fail',
          message: output.includes('Protocol 2')
            ? 'SSH Protocol 2 is configured'
            : 'SSH Protocol 1 is enabled or Protocol not set to 2',
          score: output.includes('Protocol 2') ? 1 : 0,
        };
      },
      tags: ['ssh', 'configuration', 'security'],
    },
    {
      id: 'SSH-002',
      name: 'SSH Root Login',
      category: 'ssh',
      description: 'Checks if root login is disabled',
      weight: 9,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST', 'ISO27001'],
      platforms: ['linux', 'darwin'],
      command: 'grep -i "^PermitRootLogin" /etc/ssh/sshd_config',
      evaluate: (output: string) => {
        if (!output) {
          return {
            status: 'warning',
            message: 'PermitRootLogin not explicitly set',
            details: 'Root login should be explicitly disabled',
          };
        }
        return {
          status: output.includes('no') ? 'pass' : 'fail',
          message: output.includes('no')
            ? 'Root login is properly disabled'
            : 'Root login is not disabled',
          score: output.includes('no') ? 1 : 0,
        };
      },
      tags: ['ssh', 'configuration', 'security', 'root'],
    },
    {
      id: 'SSH-003',
      name: 'SSH Public Key Authentication',
      category: 'ssh',
      description: 'Verifies that public key authentication is enabled',
      weight: 7,
      priority: 'medium', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'grep -i "^PubkeyAuthentication" /etc/ssh/sshd_config',
      evaluate: (output: string) => {
        if (!output) {
          return {
            status: 'warning',
            message: 'PubkeyAuthentication not explicitly set',
            details: 'Public key authentication should be explicitly enabled',
          };
        }
        return {
          status: output.includes('yes') ? 'pass' : 'fail',
          message: output.includes('yes')
            ? 'Public key authentication is enabled'
            : 'Public key authentication is disabled',
          score: output.includes('yes') ? 1 : 0,
        };
      },
      tags: ['ssh', 'configuration', 'authentication'],
    },
    {
      id: 'SSH-004',
      name: 'SSH Idle Timeout',
      category: 'ssh',
      description: 'Checks SSH idle timeout configuration',
      weight: 6,
      priority: 'medium', // Added priority
      frameworks: ['CIS'],
      platforms: ['linux', 'darwin'],
      command: 'grep -E "^(ClientAliveInterval|ClientAliveCountMax)" /etc/ssh/sshd_config',
      evaluate: (output: string) => {
        const interval = output.match(/ClientAliveInterval\s+(\d+)/)?.[1];
        const countMax = output.match(/ClientAliveCountMax\s+(\d+)/)?.[1];

        if (!interval || !countMax) {
          return {
            status: 'warning',
            message: 'Idle timeout settings not fully configured',
            details: 'Both ClientAliveInterval and ClientAliveCountMax should be set',
          };
        }

        const timeoutOk = parseInt(interval) <= 300; // 5 minutes
        const countOk = parseInt(countMax) <= 3;

        return {
          status: timeoutOk && countOk ? 'pass' : 'fail',
          message:
            timeoutOk && countOk
              ? 'Idle timeout properly configured'
              : 'Idle timeout configuration is too permissive',
          score: timeoutOk && countOk ? 1 : 0,
        };
      },
      tags: ['ssh', 'configuration', 'session'],
    },
  ],
};

export { sshTests };
