import { TestGroup } from '../types';

const authenticationTests: TestGroup = {
  category: 'authentication',
  tests: [
    {
      id: 'AUTH-001',
      name: 'Password Quality Requirements',
      category: 'authentication',
      description: 'Checks password quality requirements in PAM configuration',
      weight: 8,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'grep -E "^password.*pam_pwquality.so" /etc/pam.d/common-password',
      evaluate: (output: string) => {
        const hasMinLen = output.includes('minlen=');
        const hasComplexity = output.includes('dcredit=') && output.includes('ucredit=');
        return {
          status: hasMinLen && hasComplexity ? 'pass' : 'fail',
          message:
            hasMinLen && hasComplexity
              ? 'Password quality requirements properly configured'
              : 'Password quality requirements not properly configured',
          details: 'Should include minimum length and complexity requirements',
        };
      },
      tags: ['authentication', 'password', 'security'],
    },
    {
      id: 'AUTH-002',
      name: 'Password Aging Controls',
      category: 'authentication',
      description: 'Verifies password aging controls are properly configured',
      weight: 7,
      priority: 'medium', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'grep -E "^PASS_MAX_DAYS|^PASS_MIN_DAYS|^PASS_WARN_AGE" /etc/login.defs',
      evaluate: (output: string) => {
        const maxDays = output.match(/PASS_MAX_DAYS\s+(\d+)/)?.[1];
        const minDays = output.match(/PASS_MIN_DAYS\s+(\d+)/)?.[1];
        const warnAge = output.match(/PASS_WARN_AGE\s+(\d+)/)?.[1];

        const maxOk = maxDays && parseInt(maxDays) <= 90;
        const minOk = minDays && parseInt(minDays) >= 7;
        const warnOk = warnAge && parseInt(warnAge) >= 7;

        return {
          status: maxOk && minOk && warnOk ? 'pass' : 'fail',
          message: 'Password aging controls need adjustment',
          details: `Max Days: ${maxDays}, Min Days: ${minDays}, Warn Age: ${warnAge}`,
        };
      },
      tags: ['authentication', 'password', 'security'],
    },
    {
      id: 'AUTH-003',
      name: 'Root Account Status',
      category: 'authentication',
      description: 'Checks if root account is properly secured',
      weight: 9,
      priority: 'high', // Added priority
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'passwd -S root',
      evaluate: (output: string) => {
        const isLocked = output.includes('L') || output.includes('locked');
        return {
          status: isLocked ? 'pass' : 'warning',
          message: isLocked ? 'Root account is locked' : 'Root account is not locked',
          recommendation: 'Consider locking root account if not required',
        };
      },
      tags: ['authentication', 'root', 'security'],
    },
    {
      id: 'AUTH-004',
      name: 'Failed Login Delay',
      category: 'authentication',
      description: 'Verifies that failed login delay is configured',
      weight: 6,
      priority: 'medium', // Added priority
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'grep -E "^auth.*pam_faildelay.so" /etc/pam.d/login',
      evaluate: (output: string) => {
        const hasDelay = output.includes('delay=');
        return {
          status: hasDelay ? 'pass' : 'warning',
          message: hasDelay
            ? 'Failed login delay is configured'
            : 'Failed login delay is not configured',
          recommendation: 'Configure failed login delay to prevent brute force attacks',
        };
      },
      tags: ['authentication', 'brute-force', 'security'],
    },
    {
      id: 'AUTH-005',
      name: 'Sudo Configuration',
      category: 'authentication',
      description: 'Checks sudo configuration for security best practices',
      weight: 8,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'grep -E "^Defaults.*" /etc/sudoers',
      evaluate: (output: string) => {
        const hasLogInput = output.includes('log_input');
        const hasLogOutput = output.includes('log_output');
        const hasPasswd = !output.includes('!authenticate');

        return {
          status: hasLogInput && hasLogOutput && hasPasswd ? 'pass' : 'warning',
          message: 'Sudo configuration needs improvement',
          details: `Logging: ${hasLogInput && hasLogOutput ? 'Enabled' : 'Disabled'}, Authentication: ${hasPasswd ? 'Required' : 'Not Required'}`,
          recommendation: 'Enable sudo command logging and require authentication',
        };
      },
      tags: ['authentication', 'sudo', 'security'],
    },
  ],
};

export { authenticationTests };
