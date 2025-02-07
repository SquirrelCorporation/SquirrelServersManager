import { TestGroup } from '../types';

const networkTests: TestGroup = {
  category: 'network_configuration',
  tests: [
    {
      id: 'NET-001',
      name: 'IPv4 Forwarding',
      category: 'network_configuration',
      description: 'Checks if IPv4 forwarding is disabled unless needed',
      weight: 7,
      priority: 'medium', // Added priority
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'sysctl net.ipv4.ip_forward',
      evaluate: (output: string) => {
        const isDisabled = output.includes('0');
        return {
          status: isDisabled ? 'pass' : 'warning',
          message: isDisabled ? 'IPv4 forwarding is disabled' : 'IPv4 forwarding is enabled',
          recommendation: 'Disable IPv4 forwarding unless system is a router',
        };
      },
      tags: ['network', 'ipv4', 'security'],
    },
    {
      id: 'NET-002',
      name: 'TCP SYN Cookies',
      category: 'network_configuration',
      description: 'Verifies TCP SYN cookies are enabled',
      weight: 8,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'sysctl net.ipv4.tcp_syncookies',
      evaluate: (output: string) => {
        const isEnabled = output.includes('1');
        return {
          status: isEnabled ? 'pass' : 'fail',
          message: isEnabled ? 'TCP SYN cookies are enabled' : 'TCP SYN cookies are disabled',
          recommendation: 'Enable TCP SYN cookies to prevent SYN flood attacks',
        };
      },
      tags: ['network', 'tcp', 'security', 'ddos'],
    },
    {
      id: 'NET-003',
      name: 'Open Ports',
      category: 'network_configuration',
      description: 'Checks for potentially dangerous open ports',
      weight: 9,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'netstat -tuln',
      evaluate: (output: string) => {
        const dangerousPorts = ['23', '21', '25', '137', '138', '139', '445'];
        const openPorts = output.match(/:(\\d+)/g)?.map((p) => p.substring(1)) || [];
        const dangerous = openPorts.filter((port) => dangerousPorts.includes(port));

        return {
          status: dangerous.length === 0 ? 'pass' : 'fail',
          message:
            dangerous.length === 0
              ? 'No dangerous ports found'
              : 'Potentially dangerous ports are open',
          details:
            dangerous.length > 0 ? `Open dangerous ports: ${dangerous.join(', ')}` : undefined,
          recommendation: 'Close or secure potentially dangerous ports',
        };
      },
      tags: ['network', 'ports', 'security'],
    },
    {
      id: 'NET-004',
      name: 'Host-based Firewall',
      category: 'network_configuration',
      description: 'Checks if host-based firewall is enabled and configured',
      weight: 9,
      priority: 'high', // Added priority
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: (platform) =>
        platform === 'linux'
          ? 'ufw status verbose || (which iptables && iptables -L)'
          : 'pfctl -s info',
      evaluate: (output: string) => {
        const hasRules = output.includes('Chain') || output.includes('Status: active');
        return {
          status: hasRules ? 'pass' : 'fail',
          message: hasRules
            ? 'Firewall is enabled with rules'
            : 'Firewall is not properly configured',
          recommendation: 'Enable and configure host-based firewall',
        };
      },
      tags: ['network', 'firewall', 'security'],
    },
    {
      id: 'NET-005',
      name: 'Network Time Sync',
      category: 'network_configuration',
      description: 'Verifies that time synchronization is enabled',
      weight: 7,
      priority: 'medium', // Added priority
      frameworks: ['CIS'],
      platforms: ['linux', 'darwin'],
      command:
        'systemctl status systemd-timesyncd.service || systemctl status ntpd.service || systemctl status chronyd.service',
      evaluate: (output: string) => {
        const isActive = output.includes('active (running)');
        return {
          status: isActive ? 'pass' : 'warning',
          message: isActive
            ? 'Time synchronization is active'
            : 'Time synchronization is not active',
          recommendation: 'Enable time synchronization service',
        };
      },
      tags: ['network', 'time', 'security'],
    },
    {
      id: 'NET-006',
      name: 'ICMP Broadcast',
      category: 'network_configuration',
      description: 'Checks if ICMP broadcast addresses are ignored',
      weight: 6,
      priority: 'medium', // Added priority
      frameworks: ['CIS'],
      platforms: ['linux'],
      command: 'sysctl net.ipv4.icmp_echo_ignore_broadcasts',
      evaluate: (output: string) => {
        const isIgnored = output.includes('1');
        return {
          status: isIgnored ? 'pass' : 'fail',
          message: isIgnored ? 'ICMP broadcasts are ignored' : 'ICMP broadcasts are accepted',
          recommendation: 'Configure system to ignore ICMP broadcast requests',
        };
      },
      tags: ['network', 'icmp', 'security'],
    },
  ],
};

export { networkTests };
