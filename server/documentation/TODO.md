# TODO


### Refactored Device & DeviceAuth models
- The Device Auth model should have sub-objects:
    - SSH Configuration
    - Ansible specific configuration
    - Docker specific configuration
- The Device model should have sub-objects for:
    - Docker specific info

The DTOs should reflect those changes, as well as the a frontend objects and shared-lib

---

### Decide whether events name are defined in modules or in core
- There is a mix of usage here, sometimes define in core, sometimes define in modules

---

### Unify the type of the Component handling variable across engines

---

### Use queues for async treatment for:
- Statistics gathering. Containers and Remove information modules should send their stats through a bull queue consumed by the statistics module instead of calling directly the modules methods

---

### Vault crypto should be extrated to a standalone module in infrastructure
It should not import any others module.

---

### Deletion of devices should be an event to broadcast accross module + take appropriat eactions 
- Delete device auth
- Deregister watcher for docker, proxmox, remote sys info

---

## Comprehensive Test Mocking System Overhaul

## Current Problems
- **Inconsistent mocking approach**: Multiple test-setup.ts files with duplicated code scattered across modules
- **Path alias resolution issues**: Imports using '@modules/...' or '@infrastructure/...' aliases often fail in tests
- **Fragile dependency chains**: Changes to one module's setup can break tests in another module
- **No clear mocking strategy**: Mix of local mocks, global mocks, and direct imports
- **Maintenance burden**: Each module needs its own test setup with redundant mock implementations
- **Multiple mock implementations**: Same services/repositories have different mock implementations
- **Fixed test files**: The current approach of creating fixed versions (test-setup.fixed.ts) creates duplicate code

## Comprehensive Solution

### Recommended Libraries
After evaluation, the following libraries would significantly improve our testing infrastructure:

1. **strong-mock** (https://github.com/NiGhTTraX/strong-mock)
   - Type-safe mocking of interfaces and functions
   - Detailed error messages
   - Powerful argument matching
   - Perfect for mocking our service interfaces

2. **@golevelup/nestjs** Testing Packages
   - NestJS-specific testing utilities
   - Seamless integration with Vitest
   - Module mocking helpers

### 1. Centralized Mock Registry
- Create a central mock registry that manages all mock implementations
- Allow modules to register their mocks with the registry
- Provide typed access to mocks through a consistent API
- Implement a structured approach to mock versioning and configuration

```typescript
// src/__tests__/mocks/registry.ts
export class MockRegistry {
  private static mocks = new Map<symbol, any>();

  static register<T>(token: symbol, implementation: T): void {
    MockRegistry.mocks.set(token, implementation);
  }

  static get<T>(token: symbol): T {
    if (!MockRegistry.mocks.has(token)) {
      throw new Error(`Mock for token ${token.toString()} not registered`);
    }
    return MockRegistry.mocks.get(token) as T;
  }

  static reset(): void {
    MockRegistry.mocks.clear();
  }
}
```

### 2. Standardized Mock Factory
- Create a factory pattern for generating consistent mocks
- Define interfaces for all mock configurations
- Allow customization while maintaining default behaviors
- Generate mocks that are type-safe and consistent

```typescript
// src/__tests__/mocks/factories/repository-factory.ts
import { MockRegistry } from '../registry';
import { mock, when } from 'strong-mock';

export interface RepositoryMockConfig<T, K> {
  findOne?: (id: K) => T | null;
  findAll?: () => T[];
  create?: (data: Partial<T>) => T;
  update?: (id: K, data: Partial<T>) => T;
  delete?: (id: K) => boolean;
  // ...other repository methods
}

export function createRepositoryMock<T, K>(
  token: symbol,
  config: RepositoryMockConfig<T, K> = {}
): any {
  const defaultConfig: RepositoryMockConfig<T, K> = {
    findOne: () => null,
    findAll: () => [],
    create: (data) => ({ id: 'mock-id', ...data } as unknown as T),
    update: (id, data) => ({ id, ...data } as unknown as T),
    delete: () => true,
  };

  const mergedConfig = { ...defaultConfig, ...config };
  
  // Use strong-mock for type-safety
  const repoMock = mock<any>();
  
  when(() => repoMock.findOne).thenReturn(vi.fn().mockImplementation(mergedConfig.findOne));
  when(() => repoMock.findAll).thenReturn(vi.fn().mockImplementation(mergedConfig.findAll));
  when(() => repoMock.create).thenReturn(vi.fn().mockImplementation(mergedConfig.create));
  when(() => repoMock.update).thenReturn(vi.fn().mockImplementation(mergedConfig.update));
  when(() => repoMock.delete).thenReturn(vi.fn().mockImplementation(mergedConfig.delete));

  MockRegistry.register(token, repoMock);
  return repoMock;
}
```

### 3. Module-Specific Mock Presets
- Define preset configurations for each module
- Allow modules to customize their mock behavior while maintaining consistency
- Create a simple API for test files to use

```typescript
// src/__tests__/mocks/presets/devices.ts
import { DEVICE_REPOSITORY } from '@modules/devices/domain/repositories/device-repository.interface';
import { createRepositoryMock } from '../factories/repository-factory';
import { IDevice } from '@modules/devices/domain/entities/device.entity';

export const mockDevice: IDevice = {
  _id: '615f5f4e8f5bca001c8ae123',
  uuid: '12345678-1234-1234-1234-123456789012',
  status: 1,
  systemInformation: {},
  capabilities: {
    containers: {},
  },
  configuration: {
    containers: {},
  },
};

export function setupDeviceMocks(config = {}) {
  return createRepositoryMock<IDevice, string>(DEVICE_REPOSITORY, {
    findOne: () => mockDevice,
    findAll: () => [mockDevice],
    ...config,
  });
}
```

### 4. Global Test Setup
- Create a global test setup file that configures the testing environment
- Set up vitest hooks to reset the mock registry between tests
- Configure path alias resolution correctly for tests

```typescript
// src/__tests__/vitest.setup.ts
import { beforeEach } from 'vitest';
import { MockRegistry } from './mocks/registry';

// Reset the mock registry before each test
beforeEach(() => {
  MockRegistry.reset();
});

// Set up global mocks for common dependencies
vi.mock('fs', () => ({
  // Standard fs mock implementation
}));

vi.mock('path', () => ({
  // Standard path mock implementation
}));

// ...other common mocks
```

### 5. Dependency Injection for Tests
- Create a test module factory that configures NestJS modules with mocks
- Allow test-specific overrides of mock implementations
- Maintain consistent dependency injection in tests

```typescript
// src/__tests__/utils/test-module.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MockRegistry } from '../mocks/registry';

export async function createTestModule(
  moduleClass: any,
  providers: any[] = [],
  imports: any[] = [],
  controllers: any[] = []
): Promise<TestingModule> {
  const module = await Test.createTestingModule({
    imports,
    controllers,
    providers: [
      // Default providers from the module
      ...moduleClass.providers || [],
      // Custom providers for the test
      ...providers,
    ],
  }).compile();

  return module;
}
```

### 6. Simplified Test API
- Create helper functions for common test scenarios
- Reduce boilerplate in test files
- Make tests more readable and maintainable

```typescript
// src/__tests__/utils/test-helpers.ts
import { createTestModule } from './test-module';
import { setupDeviceMocks } from '../mocks/presets/devices';

export async function setupDeviceServiceTest(config = {}) {
  // Set up device repository mock
  const deviceRepository = setupDeviceMocks(config.deviceRepository);
  
  // Create test module
  const module = await createTestModule(
    DevicesModule,
    [
      // Override providers here
    ]
  );
  
  // Get the service to test
  const service = module.get<DevicesService>(DevicesService);
  
  return {
    service,
    deviceRepository,
    module,
  };
}
```

### 7. Migration Strategy
- Create a phased approach for migrating existing tests to the new system
- Start with the most problematic modules first
- Create a template for new tests to follow
- Document the new approach thoroughly

#### Phase 1: Core Infrastructure
- Implement the mock registry and factory system
- Migrate common utility mocks (fs, path, etc.)
- Create a consistent test module factory
- Add strong-mock and golevelup/nestjs testing packages

#### Phase 2: Key Domain Modules
- Migrate device, ansible, and container modules
- Create preset configurations for these modules
- Update test files to use the new system

#### Phase 3: Remaining Modules
- Migrate all other modules to the new system
- Create preset configurations for these modules
- Update test files to use the new system

#### Phase 4: Cleanup and Documentation
- Remove duplicate test setup files
- Document the new approach thoroughly
- Create examples for common test scenarios

### 8. Implementation Timeline
- Phase 1: 2 weeks
- Phase 2: 3 weeks
- Phase 3: 4 weeks
- Phase 4: 1 week

## Benefits
- **Consistency**: All tests use the same mocking approach
- **Maintainability**: Changes to mocks are made in one place
- **Type safety**: Mocks are correctly typed with strong-mock
- **Readability**: Tests are concise and focus on what's being tested
- **Scalability**: New modules can easily adopt the same pattern
- **Resilience**: Tests are less likely to break due to dependency changes
- **Performance**: Reduced duplication leads to faster test execution

## Conclusion
This comprehensive approach addresses the root causes of the current test issues by creating a structured, consistent, and maintainable mocking system. By leveraging strong-mock for type safety and golevelup's NestJS testing utilities, we can create robust, reliable tests that are easier to maintain and extend. This solution provides a clear path forward for new tests and a migration strategy for existing tests, ultimately leading to a more reliable and robust test suite.
