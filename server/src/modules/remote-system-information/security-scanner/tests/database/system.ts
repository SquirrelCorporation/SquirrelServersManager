import { SecurityTest, TestGroup } from '../types';

const systemTests: TestGroup = {
  category: 'system_integrity',
  tests: [
    {
      id: 'SYS-001',
      name: 'ASLR Configuration',
      category: 'system_integrity',
      description: 'Checks if Address Space Layout Randomization is properly configured',
      weight: 8,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'sysctl kernel.randomize_va_space',
      evaluate: (output: string) => {
        const value = output.match(/\d+/)?.[0];
        return {
          status: value === '2' ? 'pass' : 'fail',
          message: value === '2' ? 
            'ASLR is properly configured' : 
            'ASLR is not properly configured',
          recommendation: 'Set kernel.randomize_va_space to 2'
        };
      },
      tags: ['system', 'kernel', 'security', 'aslr']
    },
    {
      id: 'SYS-002',
      name: 'Core Dumps',
      category: 'system_integrity',
      description: 'Verifies that core dumps are restricted',
      weight: 7,
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'grep -E "^\\*.*hard.*core.*0" /etc/security/limits.conf && sysctl fs.suid_dumpable',
      evaluate: (output: string) => {
        const limitsOk = output.includes('hard core 0');
        const sysctlOk = output.includes('fs.suid_dumpable = 0');
        return {
          status: limitsOk && sysctlOk ? 'pass' : 'warning',
          message: 'Core dumps are not properly restricted',
          recommendation: 'Disable core dumps for all users and SUID programs'
        };
      },
      tags: ['system', 'core-dumps', 'security']
    },
    {
      id: 'SYS-003',
      name: 'Boot Security',
      category: 'boot_security',
      description: 'Checks if bootloader is password protected',
      weight: 9,
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'grep "^password" /boot/grub/grub.cfg || grep "^GRUB2_PASSWORD" /etc/grub.d/00_header',
      evaluate: (output: string) => {
        const hasPassword = output.length > 0;
        return {
          status: hasPassword ? 'pass' : 'fail',
          message: hasPassword ? 
            'Bootloader is password protected' : 
            'Bootloader is not password protected',
          recommendation: 'Set bootloader password to prevent unauthorized system modifications'
        };
      },
      tags: ['system', 'boot', 'security']
    },
    {
      id: 'SYS-004',
      name: 'Process Accounting',
      category: 'system_integrity',
      description: 'Verifies if process accounting is enabled',
      weight: 6,
      frameworks: ['NIST'],
      platforms: ['linux'],
      command: 'systemctl status psacct.service || systemctl status acct.service',
      evaluate: (output: string) => {
        const isEnabled = output.includes('active (running)');
        return {
          status: isEnabled ? 'pass' : 'warning',
          message: isEnabled ? 
            'Process accounting is enabled' : 
            'Process accounting is not enabled',
          recommendation: 'Enable process accounting for system auditing'
        };
      },
      tags: ['system', 'accounting', 'audit']
    },
    {
      id: 'SYS-005',
      name: 'USB Storage',
      category: 'system_integrity',
      description: 'Checks if USB storage is disabled or controlled',
      weight: 7,
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'grep "usb-storage" /etc/modprobe.d/* || lsmod | grep usb_storage',
      evaluate: (output: string) => {
        const isDisabled = output.includes('install usb-storage /bin/true') || output.length === 0;
        return {
          status: isDisabled ? 'pass' : 'warning',
          message: isDisabled ? 
            'USB storage is controlled' : 
            'USB storage is not restricted',
          recommendation: 'Disable or control USB storage access'
        };
      },
      tags: ['system', 'usb', 'storage', 'security']
    },
    {
      id: 'SYS-006',
      name: 'Kernel Module Loading',
      category: 'system_integrity',
      description: 'Verifies restrictions on kernel module loading',
      weight: 8,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'grep -E "^install" /etc/modprobe.d/*.conf',
      evaluate: (output: string) => {
        const restrictedModules = [
          'cramfs', 'freevxfs', 'jffs2', 'hfs', 'hfsplus', 'squashfs', 'udf',
          'dccp', 'sctp', 'rds', 'tipc'
        ];
        const disabledCount = restrictedModules.filter(module => 
          output.includes(`install ${module} /bin/true`) || 
          output.includes(`install ${module} /bin/false`)
        ).length;
        
        return {
          status: disabledCount === restrictedModules.length ? 'pass' : 'warning',
          message: `${disabledCount}/${restrictedModules.length} unnecessary modules disabled`,
          recommendation: 'Disable all unnecessary kernel modules'
        };
      },
      tags: ['system', 'kernel', 'modules', 'security']
    },
    {
      id: 'SYS-007',
      name: 'System Entropy',
      category: 'system_integrity',
      description: 'Checks system entropy sources and quality',
      weight: 7,
      frameworks: ['NIST'],
      platforms: ['linux'],
      command: 'systemctl status rngd || cat /proc/sys/kernel/random/entropy_avail',
      evaluate: (output: string) => {
        const hasRngd = output.includes('active (running)');
        const entropyAvail = parseInt(output.match(/\d+/)?.[0] || '0');
        
        return {
          status: hasRngd || entropyAvail >= 2000 ? 'pass' : 'warning',
          message: hasRngd ? 
            'Hardware RNG daemon is active' : 
            `Available entropy: ${entropyAvail}`,
          recommendation: entropyAvail < 2000 ? 'Consider installing hardware RNG or haveged' : undefined
        };
      },
      tags: ['system', 'entropy', 'security', 'cryptography']
    },
    {
      id: 'SYS-008',
      name: 'Secure Time Configuration',
      category: 'system_integrity',
      description: 'Verifies system time synchronization and configuration',
      weight: 6,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'timedatectl status',
      evaluate: (output: string) => {
        const isNTPEnabled = output.includes('NTP synchronized: yes');
        const hasValidTimezone = output.includes('Time zone:') && !output.includes('Time zone: n/a');
        
        return {
          status: isNTPEnabled && hasValidTimezone ? 'pass' : 'warning',
          message: isNTPEnabled && hasValidTimezone ? 
            'Time configuration is correct' : 
            'Time configuration needs attention',
          details: `NTP: ${isNTPEnabled ? 'Enabled' : 'Disabled'}, Timezone: ${hasValidTimezone ? 'Valid' : 'Invalid'}`
        };
      },
      tags: ['system', 'time', 'security']
    }
  ]
};

export { systemTests };
