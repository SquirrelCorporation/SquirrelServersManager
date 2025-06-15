# Test Failures Documentation

## Summary
Total test files: 284
- Passed: 158
- Failed: 126

## Categories of Failures

### 1. Module Import Issues

#### Problem
Multiple test files are failing due to missing or incorrect module imports using path aliases.

#### Affected Files
- Container modules (`src/modules/containers/__tests__/*`)
- Playbook modules (`src/modules/playbooks/__tests__/*`)
- Diagnostic modules (`src/modules/diagnostic/__tests__/*`)
- SSH modules (`src/modules/ssh/__tests__/*`)

#### Required Fixes
1. Verify path alias configuration in `tsconfig.json`
2. Ensure all imported modules exist in the specified paths
3. Update import paths to match the project structure

### 2. Schema Type Definition Issues

#### Problem
MongoDB schema definitions are missing proper type decorators.

#### Affected Files
- `src/modules/container-stacks/infrastructure/schemas/container-custom-stack.schema.ts`
- `src/modules/container-stacks/infrastructure/schemas/container-custom-stack-repository.schema.ts`
- `src/modules/playbooks/infrastructure/schemas/playbooks-register.schema.ts`

#### Required Fixes
1. Add proper type decorators for UUID fields:
```typescript
@Prop({ type: String })
uuid: string;
```

### 3. Test Setup Issues

#### Problem
Test files are missing proper Vitest imports and setup.

#### Affected Files
- `src/modules/ansible/__tests__/application/services/ansible-galaxy-command.service.spec.ts`
- `src/modules/ansible/__tests__/application/services/inventory-transformer.service.spec.ts`
- `src/modules/ansible/__tests__/application/services/extravars/extra-vars-transformer.service.spec.ts`
- `src/modules/ansible/__tests__/application/services/extravars/extra-vars.service.spec.ts`

#### Required Fixes
1. Add proper Vitest imports:
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
```

## Next Steps

1. Fix Module Imports
   - Review and update tsconfig.json path mappings
   - Verify all module files exist in correct locations
   - Update import statements to use correct paths

2. Fix Schema Definitions
   - Add proper type decorators to all MongoDB schema fields
   - Ensure consistent type definitions across related schemas

3. Fix Test Setup
   - Add missing Vitest imports to all test files
   - Ensure proper test lifecycle setup
   - Verify mock implementations

4. Individual Test Fixes
   - After fixing the above issues, run tests individually to catch any remaining specific test logic issues
   - Update test assertions and mocks as needed

## Running Tests

To run individual test files after fixes:

```bash
cd server
npx vitest run path/to/test/file.spec.ts
```

To run all tests:

```bash
cd server
npm run test
``` 