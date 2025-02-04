import { ComplianceFramework, ComplianceCheckResult } from './ComplianceBase';
import logger from '../../../../logger';

export class NISTFramework extends ComplianceFramework {
  getName(): string {
    return 'NIST SP 800-53';
  }

  getVersion(): string {
    return 'Rev. 5';
  }

  async performChecks(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    try {
      // Access Control (AC)
      results.push(...await this.checkAccessControl());
      
      // Audit and Accountability (AU)
      results.push(...await this.checkAuditAccountability());
      
      // Configuration Management (CM)
      results.push(...await this.checkConfigurationManagement());
      
      // Identification and Authentication (IA)
      results.push(...await this.checkIdentificationAuthentication());
      
      // System and Communications Protection (SC)
      results.push(...await this.checkSystemCommunicationsProtection());
      
    } catch (error) {
      logger.error('Error during NIST compliance checks:', error);
    }
    
    return results;
  }

  private async checkAccessControl(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    // AC-2: Account Management
    try {
      const passwordAging = await this.executeCheck('grep PASS_MAX_DAYS /etc/login.defs');
      results.push({
        complianceId: 'AC-2',
        framework: this.getName(),
        category: 'Access Control',
        controlFamily: 'AC',
        status: passwordAging.includes('90') ? 'pass' : 'fail',
        description: 'Account Management - Password Aging Controls',
        severity: 'high',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking account management:', error);
    }

    // AC-3: Access Enforcement
    try {
      const filePerms = await this.executeCheck('find /etc -perm /o+w -type f');
      results.push({
        complianceId: 'AC-3',
        framework: this.getName(),
        category: 'Access Control',
        controlFamily: 'AC',
        status: !filePerms ? 'pass' : 'fail',
        description: 'Access Enforcement - File Permissions',
        severity: 'high',
        impact: 'high'
      });
    } catch (error) {
      logger.error('Error checking access enforcement:', error);
    }

    return results;
  }

  private async checkAuditAccountability(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    // AU-2: Audit Events
    try {
      const auditdStatus = await this.executeCheck('systemctl is-active auditd');
      results.push({
        complianceId: 'AU-2',
        framework: this.getName(),
        category: 'Audit and Accountability',
        controlFamily: 'AU',
        status: auditdStatus.includes('active') ? 'pass' : 'fail',
        description: 'Audit Events - Auditd Service Status',
        severity: 'high',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking audit events:', error);
    }

    // AU-9: Protection of Audit Information
    try {
      const auditLogPerms = await this.executeCheck('stat -c %a /var/log/audit/audit.log');
      results.push({
        complianceId: 'AU-9',
        framework: this.getName(),
        category: 'Audit and Accountability',
        controlFamily: 'AU',
        status: auditLogPerms === '600' ? 'pass' : 'fail',
        description: 'Protection of Audit Information - Log File Permissions',
        severity: 'high',
        impact: 'high'
      });
    } catch (error) {
      logger.error('Error checking audit protection:', error);
    }

    return results;
  }

  private async checkConfigurationManagement(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    // CM-6: Configuration Settings
    try {
      const secureSysctl = await this.executeCheck('sysctl kernel.randomize_va_space');
      results.push({
        complianceId: 'CM-6',
        framework: this.getName(),
        category: 'Configuration Management',
        controlFamily: 'CM',
        status: secureSysctl.includes('2') ? 'pass' : 'fail',
        description: 'Configuration Settings - ASLR Configuration',
        severity: 'medium',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking configuration settings:', error);
    }

    // CM-7: Least Functionality
    try {
      const runningServices = await this.executeCheck('systemctl list-units --type=service --state=active');
      results.push({
        complianceId: 'CM-7',
        framework: this.getName(),
        category: 'Configuration Management',
        controlFamily: 'CM',
        status: 'warning', // Requires manual review
        description: 'Least Functionality - Running Services',
        details: runningServices,
        severity: 'medium',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking least functionality:', error);
    }

    return results;
  }

  private async checkIdentificationAuthentication(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    // IA-2: Identification and Authentication
    try {
      const pamConfig = await this.executeCheck('grep pam_pwquality.so /etc/pam.d/common-password');
      results.push({
        complianceId: 'IA-2',
        framework: this.getName(),
        category: 'Identification and Authentication',
        controlFamily: 'IA',
        status: pamConfig.includes('retry=3') ? 'pass' : 'fail',
        description: 'Identification and Authentication - Password Quality Requirements',
        severity: 'high',
        impact: 'moderate'
      });
    } catch (error) {
      logger.error('Error checking identification and authentication:', error);
    }

    return results;
  }

  private async checkSystemCommunicationsProtection(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];

    // SC-7: Boundary Protection
    try {
      const firewallStatus = await this.executeCheck('ufw status');
      results.push({
        complianceId: 'SC-7',
        framework: this.getName(),
        category: 'System and Communications Protection',
        controlFamily: 'SC',
        status: firewallStatus.includes('active') ? 'pass' : 'fail',
        description: 'Boundary Protection - Firewall Status',
        severity: 'high',
        impact: 'high'
      });
    } catch (error) {
      logger.error('Error checking boundary protection:', error);
    }

    // SC-13: Cryptographic Protection
    try {
      const sshConfig = await this.executeCheck('grep "Ciphers" /etc/ssh/sshd_config');
      const hasStrongCiphers = sshConfig.includes('aes256-gcm@openssh.com');
      results.push({
        complianceId: 'SC-13',
        framework: this.getName(),
        category: 'System and Communications Protection',
        controlFamily: 'SC',
        status: hasStrongCiphers ? 'pass' : 'fail',
        description: 'Cryptographic Protection - SSH Cipher Configuration',
        severity: 'high',
        impact: 'high'
      });
    } catch (error) {
      logger.error('Error checking cryptographic protection:', error);
    }

    return results;
  }
}
