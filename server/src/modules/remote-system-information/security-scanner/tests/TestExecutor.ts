import { RemoteSSHExecutorComponent } from '../../core/RemoteSSHExecutorComponent';
import { SecurityTest, SecurityTestResult } from './types';
import { getAllTests, getTestById, resolveTestDependencies } from './database';
import logger from '../../../../logger';

export interface TestExecutionResult {
  testId: string;
  name: string;
  category: string;
  result: SecurityTestResult;
  timestamp: string;
  duration: number;
}

export class TestExecutor {
  private executedTests: Set<string> = new Set();
  private platform: string = 'linux'; // Default platform

  constructor(
    private executor: RemoteSSHExecutorComponent,
    private options: {
      timeout?: number;
      parallel?: boolean;
      stopOnFailure?: boolean;
    } = {}
  ) {}

  async detectPlatform(): Promise<void> {
    try {
      const uname = await this.executor.runCommand('uname -s');
      this.platform = uname.toLowerCase().trim();
    } catch (error) {
      logger.error('Failed to detect platform:', error);
      // Keep default platform
    }
  }

  async executeTest(test: SecurityTest): Promise<TestExecutionResult> {
    const startTime = Date.now();

    try {
      // Skip if test not applicable to current platform
      if (!test.platforms.includes(this.platform)) {
        return {
          testId: test.id,
          name: test.name,
          category: test.category,
          result: {
            status: 'skipped',
            message: `Test not applicable for platform ${this.platform}`
          },
          timestamp: new Date().toISOString(),
          duration: 0
        };
      }

      // Execute command
      const command = typeof test.command === 'function' ? 
        test.command(this.platform) : test.command;

      const output = await this.executor.runCommand(command, {
        elevatePrivilege: true,
        timeout: this.options.timeout
      });

      // Evaluate results
      const result = test.evaluate(output);

      return {
        testId: test.id,
        name: test.name,
        category: test.category,
        result,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };

    } catch (error) {
      logger.error(`Error executing test ${test.id}:`, error);
      return {
        testId: test.id,
        name: test.name,
        category: test.category,
        result: {
          status: 'fail',
          message: 'Test execution failed',
          details: error instanceof Error ? error.message : String(error)
        },
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      };
    }
  }

  async executeTests(testIds?: string[]): Promise<TestExecutionResult[]> {
    await this.detectPlatform();
    
    const results: TestExecutionResult[] = [];
    const tests = testIds ? 
      testIds.map(id => getTestById(id)).filter((t): t is SecurityTest => t !== undefined) :
      getAllTests();

    for (const test of tests) {
      // Skip if already executed
      if (this.executedTests.has(test.id)) {
        continue;
      }

      // Execute dependencies first
      const dependencies = resolveTestDependencies(test.id);
      for (const depId of dependencies) {
        if (!this.executedTests.has(depId)) {
          const depTest = getTestById(depId);
          if (depTest) {
            const depResult = await this.executeTest(depTest);
            results.push(depResult);
            this.executedTests.add(depId);

            // Check if we should stop on failure
            if (this.options.stopOnFailure && depResult.result.status === 'fail') {
              return results;
            }
          }
        }
      }

      // Execute the test
      const result = await this.executeTest(test);
      results.push(result);
      this.executedTests.add(test.id);

      // Check if we should stop on failure
      if (this.options.stopOnFailure && result.result.status === 'fail') {
        break;
      }
    }

    return results;
  }

  getExecutionSummary(results: TestExecutionResult[]) {
    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      warnings: 0,
      skipped: 0,
      categories: new Map<string, {
        total: number;
        passed: number;
        failed: number;
        warnings: number;
        skipped: number;
      }>()
    };

    results.forEach(result => {
      // Update overall counts
      switch (result.result.status) {
        case 'pass':
          summary.passed++;
          break;
        case 'fail':
          summary.failed++;
          break;
        case 'warning':
          summary.warnings++;
          break;
        case 'skipped':
          summary.skipped++;
          break;
      }

      // Update category counts
      const categoryStats = summary.categories.get(result.category) || {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        skipped: 0
      };

      categoryStats.total++;
      switch (result.result.status) {
        case 'pass':
          categoryStats.passed++;
          break;
        case 'fail':
          categoryStats.failed++;
          break;
        case 'warning':
          categoryStats.warnings++;
          break;
        case 'skipped':
          categoryStats.skipped++;
          break;
      }

      summary.categories.set(result.category, categoryStats);
    });

    return {
      ...summary,
      categories: Object.fromEntries(summary.categories)
    };
  }
}
