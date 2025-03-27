# Remote System Information Module Migration Plan

This document outlines the plan to migrate the `remote-system-information` module to follow clean architecture principles, similar to the `automations` module.

## Current Structure Analysis

The current `remote-system-information` module:
- Contains a ported NPM library (originally JS, migrated to TS)
- No dedicated NestJS module file
- Uses device repositories from devices module
- Has complex utility functions and business logic mixed together
- No external API - used internally by other modules

## Target Architecture

```
/remote-system-information/
  ├── domain/
  │   ├── entities/
  │   │   └── remote-system-info.d.ts (type definitions)
  │   ├── components/ (moved from system-information)
  │   │   ├── base-component.ts
  │   │   ├── cpu/
  │   │   │   ├── cpu.component.ts (renamed from CPUComponent.ts)
  │   │   │   ├── cpu.consts.ts
  │   │   │   └── cpu.utils.ts
  │   │   ├── memory/
  │   │   │   ├── memory.component.ts (renamed from MemoryComponent.ts)
  │   │   │   ├── memory.consts.ts
  │   │   │   └── memory.utils.ts
  │   │   ├── ... (other components)
  │   │   └── remote-os.ts (renamed from RemoteOS.ts)
  │   └── interfaces/
  │       ├── component.interface.ts
  │       └── remote-ssh-executor.interface.ts
  ├── application/
  │   ├── interfaces/
  │   │   ├── remote-system-information-service.interface.ts
  │   │   └── remote-system-information-engine-service.interface.ts
  │   └── services/
  │       ├── remote-system-information.service.ts
  │       ├── remote-ssh-executor.service.ts
  │       └── engine/
  │           └── remote-system-information-engine.service.ts
  ├── infrastructure/
  │   └── queue/
  │       ├── remote-system-information.processor.ts
  │       ├── constants.ts
  │       └── types.ts
  ├── remote-system-information.module.ts
  └── index.ts
```

## Migration Strategy

### 1. Domain Layer - Core Components Migration

Since the `system-information` directory contains a ported NPM library that represents core business logic for gathering system information, in a clean architecture approach these components belong in the **domain layer**. 

1. **Migrate system-information to domain/components (2 days)**
   - Move all system-information logic to domain/components
   - Rename components to follow consistent naming conventions:
     - `CPUComponent.ts` → `cpu.component.ts`
     - `MemoryComponent.ts` → `memory.component.ts`
   - Organize by component type (cpu, memory, etc.)
   - Maintain constants and utility files alongside components
   - Rename `RemoteOS.ts` to `remote-os.ts` for consistency

2. **Create domain interfaces and types (1 day)**
   - Define component interfaces that abstract the core functionality
   - Create unified type definitions for system information data

```typescript
// domain/interfaces/component.interface.ts
export interface IComponent {
  getId(): string;
  register(id: string, name: string, configuration: any): Promise<IComponent>;
  deregister(): Promise<void>;
  init(): Promise<void>;
  execute(): Promise<any>;
}

// domain/entities/remote-system-info.d.ts
export namespace RemoteSystemInfo {
  export enum ComponentType {
    CPU = 'cpu',
    MEMORY = 'memory',
    FILESYSTEM = 'filesystem',
    SYSTEM = 'system',
    OS = 'os',
    WIFI = 'wifi',
    USB = 'usb',
    GRAPHICS = 'graphics',
    BLUETOOTH = 'bluetooth',
    NETWORK = 'network',
    VERSIONS = 'versions'
  }

  export interface Configuration {
    cpu?: ComponentConfig;
    memory?: ComponentConfig;
    fileSystem?: ComponentConfig;
    system?: ComponentConfig;
    os?: ComponentConfig;
    wifi?: ComponentConfig;
    usb?: ComponentConfig;
    graphics?: ComponentConfig;
    bluetooth?: ComponentConfig;
    networkInterfaces?: ComponentConfig;
    versions?: ComponentConfig;
    host: string;
    deviceUuid: string;
  }

  export interface ComponentConfig {
    watch: boolean;
    cron: string;
  }

  export interface ComponentData {
    type: ComponentType;
    data: any;
    timestamp: Date;
    deviceUuid: string;
  }
}
```

### 2. Application Layer - Service Implementations

1. **Define service interfaces (1 day)**
   - Create interfaces for the services that will orchestrate components
   - Define engine service that manages the lifecycle of components

```typescript
// application/interfaces/remote-system-information-service.interface.ts
import { RemoteSystemInfo } from '../../domain/entities/remote-system-info';

export const REMOTE_SYSTEM_INFORMATION_SERVICE = 'REMOTE_SYSTEM_INFORMATION_SERVICE';

export interface IRemoteSystemInformationService {
  getSystemInformation(deviceUuid: string, type: RemoteSystemInfo.ComponentType): Promise<any>;
  getAllSystemInformation(deviceUuid: string): Promise<Record<RemoteSystemInfo.ComponentType, any>>;
  refreshSystemInformation(deviceUuid: string, type?: RemoteSystemInfo.ComponentType): Promise<void>;
  isSystemInformationEnabled(deviceUuid: string): Promise<boolean>;
  enableSystemInformation(deviceUuid: string, config: RemoteSystemInfo.Configuration): Promise<void>;
  disableSystemInformation(deviceUuid: string): Promise<void>;
}

// application/interfaces/remote-system-information-engine-service.interface.ts
import { IComponent } from '../../domain/interfaces/component.interface';
import { Device } from '@modules/devices/domain/entities/device.entity';

export const REMOTE_SYSTEM_INFORMATION_ENGINE = 'REMOTE_SYSTEM_INFORMATION_ENGINE';

export interface IRemoteSystemInformationEngineService {
  getStates(): { watcher: Record<string, IComponent> };
  registerComponent(device: Device): Promise<IComponent>;
  registerWatchers(): Promise<void>;
  deregisterComponent(component: IComponent): Promise<void>;
  deregisterByDeviceUuid(deviceUuid: string): Promise<void>;
  deregisterWatchers(): Promise<void>;
  deregisterAll(): Promise<void>;
  saveSystemInformationData(data: RemoteSystemInfo.ComponentData): Promise<void>;
}
```

2. **Implement services (2 days)**
   - Create service implementations that use the domain components
   - Extract engine functionality from existing code to new service class
   - Add dependency injection for devices module repository

```typescript
// application/services/engine/remote-system-information-engine.service.ts
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Device } from '@modules/devices/domain/entities/device.entity';
import { IDeviceRepository, DEVICE_REPOSITORY } from '@modules/devices/domain/repositories/device-repository.interface';
import { IComponent } from '../../../domain/interfaces/component.interface';
import { RemoteSystemInformationWatcher } from '../../../domain/components/watchers/remote-system-information-watcher';
import { IRemoteSystemInformationEngineService } from '../../interfaces/remote-system-information-engine-service.interface';
import { RemoteSystemInfo } from '../../../domain/entities/remote-system-info';

@Injectable()
export class RemoteSystemInformationEngineService implements IRemoteSystemInformationEngineService, OnModuleInit {
  private readonly logger = new Logger(RemoteSystemInformationEngineService.name);
  private readonly watchers: Map<string, IComponent> = new Map();
  private readonly dataStore: Map<string, RemoteSystemInfo.ComponentData> = new Map();

  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository
  ) {}

  // Implementation of methods...
}
```

### 3. Infrastructure Layer - Queue Processing

1. **Set up Bull queue for async processing (1 day)**
   - Create processor for async system information collection
   - Define job types and constants

```typescript
// infrastructure/queue/constants.ts
export const QUEUE_NAME = 'remote-system-info';
export const CONCURRENCY = 5;

// infrastructure/queue/types.ts
import { RemoteSystemInfo } from '../../domain/entities/remote-system-info';

export interface RefreshSystemInfoJob {
  deviceUuid: string;
  type?: RemoteSystemInfo.ComponentType;
}

// infrastructure/queue/remote-system-information.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { CONCURRENCY, QUEUE_NAME } from './constants';
import { RefreshSystemInfoJob } from './types';
import { DEVICE_REPOSITORY, IDeviceRepository } from '@modules/devices/domain/repositories/device-repository.interface';
import { IRemoteSystemInformationEngineService } from '../../application/interfaces/remote-system-information-engine-service.interface';

@Processor(QUEUE_NAME)
export class RemoteSystemInformationProcessor {
  // Implementation...
}
```

### 4. Module Integration

1. **Create NestJS module definition (1 day)**
   - Define providers and exports
   - Configure Bull queue integration
   - Import required dependencies

```typescript
// remote-system-information.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { DevicesModule } from '../devices/devices.module';
import { RemoteSystemInformationService } from './application/services/remote-system-information.service';
import { RemoteSSHExecutorService } from './application/services/remote-ssh-executor.service';
import { RemoteSystemInformationEngineService } from './application/services/engine/remote-system-information-engine.service';
import { RemoteSystemInformationProcessor } from './infrastructure/queue/remote-system-information.processor';
import { QUEUE_NAME } from './infrastructure/queue/constants';
import { REMOTE_SYSTEM_INFORMATION_ENGINE } from './application/interfaces/remote-system-information-engine-service.interface';
import { REMOTE_SYSTEM_INFORMATION_SERVICE } from './application/interfaces/remote-system-information-service.interface';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: QUEUE_NAME,
    }),
    DevicesModule,
  ],
  providers: [
    RemoteSystemInformationService,
    RemoteSSHExecutorService,
    RemoteSystemInformationEngineService,
    RemoteSystemInformationProcessor,
    {
      provide: REMOTE_SYSTEM_INFORMATION_SERVICE,
      useClass: RemoteSystemInformationService,
    },
    {
      provide: REMOTE_SYSTEM_INFORMATION_ENGINE,
      useClass: RemoteSystemInformationEngineService,
    },
  ],
  exports: [
    RemoteSystemInformationService,
    RemoteSSHExecutorService,
    RemoteSystemInformationEngineService,
    REMOTE_SYSTEM_INFORMATION_SERVICE,
    REMOTE_SYSTEM_INFORMATION_ENGINE,
  ],
})
export class RemoteSystemInformationModule {}
```

2. **Create public API exports (0.5 days)**
   - Export all required interfaces and services
   - Create barrel file for clean imports

```typescript
// index.ts
export * from './domain/entities/remote-system-info';
export * from './domain/interfaces/component.interface';
export * from './domain/interfaces/remote-ssh-executor.interface';
export * from './application/interfaces/remote-system-information-service.interface';
export * from './application/interfaces/remote-system-information-engine-service.interface';
export * from './application/services/remote-system-information.service';
export * from './application/services/remote-ssh-executor.service';
export * from './application/services/engine/remote-system-information-engine.service';
export * from './remote-system-information.module';
```

### 5. Testing & Documentation

1. **Write tests (3 days)**
   - Unit tests for services and components
   - Integration tests for the module's functionality
   - Tests for integration with other modules

2. **Create documentation (1 day)**
   - Update inline documentation
   - Create module README
   - Document integration points with other modules

## File Naming and Structure Guidelines

1. **Naming Conventions**
   - Use kebab-case for files: `remote-system-info.d.ts` 
   - Use descriptive suffixes: `.component.ts`, `.service.ts`, `.interface.ts`
   - Group related files by domain concept:
     ```
     /cpu
       cpu.component.ts
       cpu.consts.ts
       cpu.utils.ts
     ```

2. **Component Organization**
   - Each component should be a separate directory in `domain/components`
   - Maintain constants and utilities with their respective components
   - Consider creating a base component class for common functionality

## Implementation Timeline

- **Moving & Restructuring Components**: 2 days
- **Domain Layer**: 1 day
- **Application Layer**: 2 days
- **Infrastructure Layer**: 1 day
- **Module Integration**: 1.5 days
- **Testing & Documentation**: 4 days

**Total Estimated Time**: 11.5 working days

## Benefits of This Approach

1. **Improved Separation of Concerns**
   - Core system information components in domain layer (pure business logic)
   - Orchestration logic in application layer
   - Infrastructure concerns (queue, async processing) in infrastructure layer
   - No presentation layer needed as module is used internally

2. **Maintainability**
   - Consistent naming conventions
   - Clear dependencies between layers
   - Testable components
   - Better organization of related files

3. **Extensibility**
   - Easily add new system information components
   - Clear interfaces for extending functionality
   - Decoupled from specific infrastructure implementations

4. **Integration with Other Modules**
   - Well-defined service interfaces for consumers
   - Clean dependency management
   - Proper encapsulation of internal implementation