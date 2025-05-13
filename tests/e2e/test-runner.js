#!/usr/bin/env node

/**
 * E2E Test Runner for SSM
 * 
 * This script executes all E2E tests and handles reporting.
 */

const { execSync } = require('child_process');
const fs = require('fs');

const TEST_RESULTS_DIR = process.env.TEST_RESULTS_DIR || '/app/test-results';

console.log('Starting E2E test suite...');

try {
  // Make sure the results directory exists
  if (!fs.existsSync(TEST_RESULTS_DIR)) {
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
  }

  // Run the tests
  console.log('Running Vitest...');
  execSync('npx vitest run --config vitest.config.ts --reporter json --outputFile /app/test-results/test-results.json', { 
    stdio: 'inherit' 
  });

  console.log('Tests completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error running tests:', error.message);
  process.exit(1);
}