import { ComplianceFramework, ComplianceCheckResult } from './ComplianceBase';
import logger from '../../../../logger';

export class CISFramework extends ComplianceFramework {
  getName(): string {
    return 'CIS Benchmarks';
  }

  getVersion(): string {
    return '1.0.0';
  }

  async performChecks(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    try {
      // 1. Initial System Settings
      results.push(...await this.checkFileSystemConfiguration());
      results.push(...await this.checkSoftwareUpdates());
      results.push(...await this.checkBootSettings());
      
      // 2. Services
      results.push(...await this.checkServiceConfiguration());
      
      // 3. Network Configuration
      results.push(...await this.checkNetworkSecurity());
      
      // 4. Logging and Auditing
      results.push(...await this.checkAuditConfiguration());
      
      // 5. Access, Authentication and Authorization
      results.push(...await this.checkAccessControl());
      
    } catch (error) {
      logger.error('Error during CIS compliance checks:', error);
    }
    
    return results;
  }

  private async checkFileSystemConfiguration(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 1.1.1.1 Ensure mounting of cramfs filesystems is disabled
    try {
      const cramfsCheck = await this.executeCheck('modprobe -n -v cramfs');
      results.push({
        complianceId: 'CIS-1.1.1.1',
        framework: this.getName(),
        category: 'Filesystem Configuration',
        controlFamily: 'Initial Setup',
        status: cramfsCheck.includes('install /bin/true') ? 'pass' : 'fail',
        description: 'Ensure mounting of cramfs filesystems is disabled',
        severity: 'medium',
        impact: 'low'
      });
    } catch (error) {
      logger.error('Error checking cramfs:', error);
    }

    // CIS 1.1.21 Ensure sticky bit is set on all world-writable directories
    try {
      const stickyBitCheck = await this.executeCheck("df --local -P | awk '{if (NR!=1) print $6}' | xargs -I '{}' find '{}' -xdev -type d -perm -0002 2>/dev/null | xargs -I '{}' stat -c '%a %U %G %n' '{}'");
      results.push({
        complianceId: 'CIS-1.1.21',
        framework: this.getName(),
        category: 'Filesystem Configuration',
        controlFamily: 'Initial Setup',
        status: !stickyBitCheck ? 'pass' : 'fail',
        description: 'Ensure sticky bit is set on all world-writable directories',
        severity: 'high',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking sticky bit:', error);
    }

    return results;
  }

  private async checkSoftwareUpdates(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 1.2.1 Ensure package manager repositories are configured
    try {
      const repoCheck = await this.executeCheck('apt-cache policy');
      results.push({
        complianceId: 'CIS-1.2.1',
        framework: this.getName(),
        category: 'Software Updates',
        controlFamily: 'Initial Setup',
        status: repoCheck.includes('http') ? 'pass' : 'fail',
        description: 'Ensure package manager repositories are configured',
        severity: 'high',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking package repositories:', error);
    }

    return results;
  }

  private async checkBootSettings(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 1.4.1 Ensure bootloader password is set
    try {
      const grubCheck = await this.executeCheck('grep "^password" /boot/grub/grub.cfg');
      results.push({
        complianceId: 'CIS-1.4.1',
        framework: this.getName(),
        category: 'Boot Settings',
        controlFamily: 'Initial Setup',
        status: grubCheck ? 'pass' : 'fail',
        description: 'Ensure bootloader password is set',
        severity: 'high',
        impact: 'high'
      });
    } catch (error) {
      logger.error('Error checking bootloader password:', error);
    }

    return results;
  }

  private async checkServiceConfiguration(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 2.1.1 Ensure time synchronization is in use
    try {
      const ntpCheck = await this.executeCheck('systemctl is-enabled systemd-timesyncd.service');
      results.push({
        complianceId: 'CIS-2.1.1',
        framework: this.getName(),
        category: 'Service Configuration',
        controlFamily: 'Services',
        status: ntpCheck.includes('enabled') ? 'pass' : 'fail',
        description: 'Ensure time synchronization is in use',
        severity: 'medium',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking time synchronization:', error);
    }

    return results;
  }

  private async checkNetworkSecurity(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 3.1.1 Ensure IP forwarding is disabled
    try {
      const ipForwardCheck = await this.executeCheck('sysctl net.ipv4.ip_forward');
      results.push({
        complianceId: 'CIS-3.1.1',
        framework: this.getName(),
        category: 'Network Configuration',
        controlFamily: 'Network',
        status: ipForwardCheck.includes('0') ? 'pass' : 'fail',
        description: 'Ensure IP forwarding is disabled',
        severity: 'medium',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking IP forwarding:', error);
    }

    return results;
  }

  private async checkAuditConfiguration(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 4.1.1.1 Ensure audit log storage size is configured
    try {
      const auditLogCheck = await this.executeCheck('grep max_log_file /etc/audit/auditd.conf');
      results.push({
        complianceId: 'CIS-4.1.1.1',
        framework: this.getName(),
        category: 'Logging and Auditing',
        controlFamily: 'Auditing',
        status: auditLogCheck ? 'pass' : 'fail',
        description: 'Ensure audit log storage size is configured',
        severity: 'medium',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking audit log configuration:', error);
    }

    return results;
  }

  private async checkAccessControl(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    // CIS 5.2.1 Ensure permissions on /etc/ssh/sshd_config are configured
    try {
      const sshdConfigCheck = await this.executeCheck('stat /etc/ssh/sshd_config');
      const hasCorrectPerms = sshdConfigCheck.includes('(0600/-rw-------)');
      results.push({
        complianceId: 'CIS-5.2.1',
        framework: this.getName(),
        category: 'Access Control',
        controlFamily: 'SSH Server',
        status: hasCorrectPerms ? 'pass' : 'fail',
        description: 'Ensure permissions on /etc/ssh/sshd_config are configured',
        severity: 'high',
        impact: 'high'
      });
    } catch (error) {
      logger.error('Error checking sshd_config permissions:', error);
    }

    return results;
  }
}
