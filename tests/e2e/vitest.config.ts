import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'SSM E2E Tests',
    environment: 'node',
    globals: true,
    hookTimeout: 30000,
    include: ['tests/**/*.test.ts', './*.test.ts'],
    reporters: ['default', 'json'],
    outputFile: {
      json: '/app/test-results/test-results.json'
    },
    pool: 'forks', // Use forks for test isolation in newer Vitest
    poolOptions: {
      forks: {
        // Authentication must happen before API tests that require auth
        singleFork: true
      }
    },
    // Override the default 30s timeout to give the entire test suite up to 5 minutes to complete
    testTimeout: 300000,
    // Retry tests once to account for network flakiness
    retry: 1
  },
  resolve: {
    alias: {
      '@utils': './utils'
    }
  }
});