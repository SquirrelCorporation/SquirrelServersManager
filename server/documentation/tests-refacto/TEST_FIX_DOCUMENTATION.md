# Test Failures Analysis and Solution

## Problem Overview

When running tests in the SquirrelServersManager server, multiple test files fail with import resolution errors. These failures occur when test files try to import modules using path aliases like `@modules/...` or `@infrastructure/...` but the test framework (Vitest) cannot resolve these paths correctly during test execution.

The main error pattern observed is:

```
Error: Failed to load url @modules/sftp/infrastructure/repositories/sftp.repository (resolved id: @modules/sftp/infrastructure/repositories/sftp.repository) in /path/to/test-file.spec.ts. Does the file exist?
```

## Root Causes

1. **Path Alias Resolution**: The path aliases defined in the `tsconfig.json` and `vitest.config.ts` files are not being correctly resolved during test execution, likely due to a configuration issue with Vitest.

2. **Mock Implementation**: Some test files rely on mocked implementations of modules that are imported elsewhere in the codebase, causing dependency chains that break when one file can't be properly resolved.

3. **Test Setup Structure**: Test setup files use relative imports instead of aliased paths, which can lead to inconsistent module resolution between development and test environments.

## Solutions

### Solution 1: Fix Path Alias Resolution for Tests

Update the `vitest.config.ts` file to ensure path aliasing works correctly:

```typescript
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.spec.ts'],
    exclude: ['**/*.md'],
    setupFiles: ['./src/__tests__/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: [
      { find: '@modules', replacement: resolve(__dirname, './src/modules') },
      { find: '@infrastructure', replacement: resolve(__dirname, './src/infrastructure') },
      { find: '@common', replacement: resolve(__dirname, './src/common') },
      { find: '@config', replacement: resolve(__dirname, './src/config') },
      { find: '@middlewares', replacement: resolve(__dirname, './src/middlewares') },
      { find: 'ssm-shared-lib', replacement: resolve(__dirname, '../shared-lib') },
    ],
  },
});
```

### Solution 2: Consolidate Mock Implementations

Create a comprehensive global mock setup file that addresses all modules required by tests:

1. Update the main test setup file (`src/__tests__/test-setup.ts`) to include all necessary mocks.
2. Ensure it correctly mocks all modules with path aliases.
3. Use `vi.mock()` with the full path alias pattern.

Example:

```typescript
// In src/__tests__/test-setup.ts

import { vi } from 'vitest';

// Mock modules with path aliases
vi.mock('@infrastructure/common/query/pagination.util', () => ({
  paginate: (array, page, pageSize) => {
    if (!array) return [];
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    return array.slice(startIndex, endIndex);
  }
}));

vi.mock('@modules/sftp/infrastructure/repositories/sftp.repository', () => ({
  SftpRepository: class MockSftpRepository {
    // Mock implementation
  }
}));

// etc. for all required modules
```

### Solution 3: Use Local Files Instead of Path Aliases in Tests

For specific test files that continue to have resolution issues, modify them to use relative imports instead of path aliases:

```typescript
// Instead of
import { SomeClass } from '@modules/some-path';

// Use
import { SomeClass } from '../../some-path';
```

### Solution 4: Create Module-Specific Test Utilities

For modules with complex dependencies, create specific test utility files that provide mock implementations:

1. Create files like `src/modules/sftp/__tests__/mocks.ts`
2. Export ready-to-use mock objects and classes
3. Import these directly in test files instead of trying to import and mock the real implementations

### Implementation Strategy

1. Start by updating `vitest.config.ts` to use the correct path alias format.
2. Create a comprehensive global test setup file that handles common mocks.
3. For problematic modules, create module-specific mock files.
4. Update tests to use the appropriate mock files.
5. As a last resort, modify imports in test files to use relative paths instead of aliases.

## Specific Module Solutions

### 1. Infrastructure/Common/Query

Create dedicated mocks for pagination, sorting, and filtering utilities:

```typescript
// src/infrastructure/common/query/__tests__/mocks.ts
export const mockPaginate = <T>(array: T[], page: number, pageSize: number): T[] => {
  if (!array) return [];
  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;
  return array.slice(startIndex, endIndex);
};
```

### 2. SFTP Module

Create dedicated mocks for the SFTP repository and service:

```typescript
// src/modules/sftp/__tests__/mocks.ts
export class MockSftpRepository {
  connect = vi.fn().mockResolvedValue({
    sftp: {
      readdir: vi.fn().mockImplementation((path, cb) => cb(null, [])),
      // ...other methods
    },
    close: vi.fn(),
  });
}
```

### 3. Container Components

Create dedicated mocks for registry components:

```typescript
// src/modules/containers/__tests__/mocks.ts
export class MockAcrRegistryComponent {
  name = 'acr';
  configuration = {
    clientid: 'clientid',
    clientsecret: 'clientsecret',
  };
  // ...other methods
}
```

## Conclusion

The test failures in the SquirrelServersManager server are primarily due to module resolution issues with path aliases in the test environment. By implementing a combination of the solutions above, the tests can be fixed without modifying the core codebase (as per the requirement to only modify test files).

For a sustainable long-term solution, it would be advisable to standardize the testing approach across the codebase, potentially using a dedicated testing library that better supports path aliases and module mocking.