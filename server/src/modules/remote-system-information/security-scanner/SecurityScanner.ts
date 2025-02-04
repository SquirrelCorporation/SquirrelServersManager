import { RemoteExecOptions } from '../system-information/types';
import { RemoteSSHExecutorComponent } from '../core/RemoteSSHExecutorComponent';
import logger from '../../../logger';
import { CISFramework } from './compliance/CISFramework';
import { NISTFramework } from './compliance/NISTFramework';
import { ComplianceCheckResult } from './compliance/ComplianceBase';
import { TestExecutor, TestExecutionResult } from './tests/TestExecutor';
import { getTestsByFramework, getTestsByCategory } from './tests/database';

export interface SecurityScanOptions {
  includeCompliance?: boolean;
  categories?: string[];
  frameworks?: string[];
  stopOnFailure?: boolean;
  parallel?: boolean;
  timeout?: number;
}

export class SecurityScanner {
  private cisFramework: CISFramework;
  private nistFramework: NISTFramework;
  private testExecutor: TestExecutor;

  constructor(private executor: RemoteSSHExecutorComponent) {
    this.cisFramework = new CISFramework(executor);
    this.nistFramework = new NISTFramework(executor);
    this.testExecutor = new TestExecutor(executor);
  }

  async performFullScan(options: SecurityScanOptions = {}): Promise<{
    testResults: TestExecutionResult[];
    complianceResults?: ComplianceCheckResult[];
  }> {
    try {
      // Execute security tests
      const testResults = await this.executeSecurityTests(options);
      
      // Execute compliance checks if requested
      let complianceResults: ComplianceCheckResult[] | undefined;
      if (options.includeCompliance) {
        complianceResults = await this.performComplianceChecks();
      }

      return {
        testResults,
        complianceResults
      };
    } catch (error) {
      logger.error('Error during security scan:', error);
      throw error;
    }
  }

  private async executeSecurityTests(options: SecurityScanOptions): Promise<TestExecutionResult[]> {
    // Configure test executor
    this.testExecutor = new TestExecutor(this.executor, {
      timeout: options.timeout,
      parallel: options.parallel,
      stopOnFailure: options.stopOnFailure
    });

    // Collect tests to run based on options
    const testsToRun = new Set<string>();

    if (options.categories) {
      options.categories.forEach(category => {
        getTestsByCategory(category).forEach(test => testsToRun.add(test.id));
      });
    }

    if (options.frameworks) {
      options.frameworks.forEach(framework => {
        getTestsByFramework(framework).forEach(test => testsToRun.add(test.id));
      });
    }

    // Execute tests
    return await this.testExecutor.executeTests(
      testsToRun.size > 0 ? Array.from(testsToRun) : undefined
    );
  }

  async generateSecurityReport(results: {
    testResults: TestExecutionResult[];
    complianceResults?: ComplianceCheckResult[];
  }): Promise<{
    summary: {
      tests: {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
        skipped: number;
        categories: {
          [category: string]: {
            total: number;
            passed: number;
            failed: number;
            warnings: number;
            skipped: number;
          };
        };
      };
      compliance?: {
        totalChecks: number;
        passedChecks: number;
        failedChecks: number;
        complianceScore: number;
        frameworkResults: {
          framework: string;
          version: string;
          passedChecks: number;
          totalChecks: number;
          score: number;
        }[];
      };
    };
    details: {
      testResults: TestExecutionResult[];
      complianceResults?: ComplianceCheckResult[];
    };
  }> {
    const testSummary = this.testExecutor.getExecutionSummary(results.testResults);
    
    let complianceSummary;
    if (results.complianceResults) {
      const frameworkResults = new Map<string, {
        version: string;
        passed: number;
        total: number;
      }>();

      results.complianceResults.forEach(result => {
        const framework = result.framework;
        const current = frameworkResults.get(framework) || {
          version: result.framework === this.cisFramework.getName() ? 
            this.cisFramework.getVersion() : this.nistFramework.getVersion(),
          passed: 0,
          total: 0
        };

        current.total++;
        if (result.status === 'pass') {
          current.passed++;
        }

        frameworkResults.set(framework, current);
      });

      const totalChecks = results.complianceResults.length;
      const passedChecks = results.complianceResults.filter(r => r.status === 'pass').length;

      complianceSummary = {
        totalChecks,
        passedChecks,
        failedChecks: totalChecks - passedChecks,
        complianceScore: (passedChecks / totalChecks) * 100,
        frameworkResults: Array.from(frameworkResults.entries()).map(([framework, stats]) => ({
          framework,
          version: stats.version,
          passedChecks: stats.passed,
          totalChecks: stats.total,
          score: (stats.passed / stats.total) * 100
        }))
      };
    }

    return {
      summary: {
        tests: testSummary,
        compliance: complianceSummary
      },
      details: results
    };
  }

  async performComplianceChecks(): Promise<ComplianceCheckResult[]> {
    const results: ComplianceCheckResult[] = [];
    
    try {
      const cisResults = await this.cisFramework.performChecks();
      results.push(...cisResults);

      const nistResults = await this.nistFramework.performChecks();
      results.push(...nistResults);
    } catch (error) {
      logger.error('Error during compliance checks:', error);
      throw error;
    }

    return results;
  }
}
