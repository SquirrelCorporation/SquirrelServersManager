import { SecurityTest, TestGroup } from '../types';

const fileSystemTests: TestGroup = {
  category: 'file_systems',
  tests: [
    {
      id: 'FS-001',
      name: 'Secure Mount Options',
      category: 'file_systems',
      description: 'Checks if filesystems are mounted with secure options',
      weight: 8,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux'],
      command: 'mount | grep -E "\\s/\\s|\\s/home\\s|\\s/var\\s|\\s/tmp\\s"',
      evaluate: (output: string) => {
        const secureOptions = ['noexec', 'nosuid', 'nodev'];
        const mounts = output.split('\n').filter(line => line.length > 0);
        const issues: string[] = [];

        mounts.forEach(mount => {
          if (mount.includes('/tmp') && !secureOptions.every(opt => mount.includes(opt))) {
            issues.push('/tmp missing secure options');
          }
          if (mount.includes('/var') && !mount.includes('nosuid')) {
            issues.push('/var missing nosuid');
          }
          if (mount.includes('/home') && !mount.includes('nosuid')) {
            issues.push('/home missing nosuid');
          }
        });

        return {
          status: issues.length === 0 ? 'pass' : 'fail',
          message: issues.length === 0 ? 
            'Filesystem mount options are secure' : 
            'Insecure filesystem mount options detected',
          details: issues.join(', '),
          recommendation: 'Mount filesystems with appropriate security options'
        };
      },
      tags: ['filesystem', 'mount', 'security']
    },
    {
      id: 'FS-002',
      name: 'World-Writable Files',
      category: 'file_systems',
      description: 'Identifies world-writable files',
      weight: 9,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'find / -xdev -type f -perm -0002 -ls 2>/dev/null',
      evaluate: (output: string) => {
        const files = output.split('\n').filter(line => line.length > 0);
        return {
          status: files.length === 0 ? 'pass' : 'warning',
          message: files.length === 0 ? 
            'No world-writable files found' : 
            `Found ${files.length} world-writable files`,
          details: files.length > 0 ? `First 5 files: ${files.slice(0, 5).join(', ')}` : undefined,
          recommendation: 'Review and remove world-writable permissions where not needed'
        };
      },
      tags: ['filesystem', 'permissions', 'security']
    },
    {
      id: 'FS-003',
      name: 'SUID/SGID Files',
      category: 'file_systems',
      description: 'Identifies SUID/SGID files',
      weight: 8,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'find / -xdev \\( -perm -4000 -o -perm -2000 \\) -type f -ls 2>/dev/null',
      evaluate: (output: string) => {
        const files = output.split('\n').filter(line => line.length > 0);
        const knownSuid = [
          '/usr/bin/sudo',
          '/usr/bin/passwd',
          '/usr/bin/su',
          '/usr/bin/ping'
        ];
        const suspicious = files.filter(file => 
          !knownSuid.some(known => file.includes(known))
        );

        return {
          status: suspicious.length === 0 ? 'pass' : 'warning',
          message: suspicious.length === 0 ? 
            'Only standard SUID/SGID files found' : 
            `Found ${suspicious.length} suspicious SUID/SGID files`,
          details: suspicious.length > 0 ? 
            `Suspicious files: ${suspicious.slice(0, 3).join(', ')}` : undefined,
          recommendation: 'Review and remove unnecessary SUID/SGID bits'
        };
      },
      tags: ['filesystem', 'permissions', 'security', 'suid']
    },
    {
      id: 'FS-004',
      name: 'Unowned Files',
      category: 'file_systems',
      description: 'Checks for files without valid owner/group',
      weight: 7,
      frameworks: ['CIS'],
      platforms: ['linux', 'darwin'],
      command: 'find / -xdev \\( -nouser -o -nogroup \\) -ls 2>/dev/null',
      evaluate: (output: string) => {
        const files = output.split('\n').filter(line => line.length > 0);
        return {
          status: files.length === 0 ? 'pass' : 'warning',
          message: files.length === 0 ? 
            'No unowned files found' : 
            `Found ${files.length} files without valid owner/group`,
          details: files.length > 0 ? 
            `Example files: ${files.slice(0, 3).join(', ')}` : undefined,
          recommendation: 'Assign proper ownership to files or remove them'
        };
      },
      tags: ['filesystem', 'ownership', 'security']
    },
    {
      id: 'FS-005',
      name: 'Home Directory Permissions',
      category: 'file_systems',
      description: 'Verifies home directory permissions',
      weight: 7,
      frameworks: ['CIS'],
      platforms: ['linux', 'darwin'],
      command: 'ls -ld /home/*',
      evaluate: (output: string) => {
        const dirs = output.split('\n').filter(line => line.length > 0);
        const issues = dirs.filter(dir => {
          const perms = dir.substring(0, 10);
          return perms.charAt(8) === 'w' || perms.charAt(9) === 'w';
        });

        return {
          status: issues.length === 0 ? 'pass' : 'fail',
          message: issues.length === 0 ? 
            'Home directory permissions are secure' : 
            `Found ${issues.length} home directories with insecure permissions`,
          recommendation: 'Ensure home directories are not group or world-writable'
        };
      },
      tags: ['filesystem', 'permissions', 'security', 'home']
    },
    {
      id: 'FS-006',
      name: 'Temporary Files',
      category: 'file_systems',
      description: 'Checks security of temporary file directories',
      weight: 6,
      frameworks: ['CIS', 'NIST'],
      platforms: ['linux', 'darwin'],
      command: 'ls -ld /tmp /var/tmp; mount | grep -E "\\s/tmp\\s|\\s/var/tmp\\s"',
      evaluate: (output: string) => {
        const hasSticky = output.includes('drwxrwxrwt');
        const secureMount = output.includes('noexec') && output.includes('nosuid');
        
        return {
          status: hasSticky && secureMount ? 'pass' : 'warning',
          message: 'Temporary directories need security improvements',
          details: `Sticky bit: ${hasSticky ? 'Set' : 'Not set'}, Secure mount: ${secureMount ? 'Yes' : 'No'}`,
          recommendation: !hasSticky ? 'Set sticky bit on temp directories' :
            !secureMount ? 'Mount temp directories with noexec,nosuid options' : undefined
        };
      },
      tags: ['filesystem', 'temporary', 'security']
    }
  ]
};

export { fileSystemTests };
