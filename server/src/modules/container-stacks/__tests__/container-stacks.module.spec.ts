import { describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { Controller, Injectable, Module } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { CONTAINER_CUSTOM_STACK } from '../infrastructure/schemas/container-custom-stack.schema';
import { CONTAINER_CUSTOM_STACK_REPOSITORY } from '../infrastructure/schemas/container-custom-stack-repository.schema';
import { CONTAINER_STACKS_SERVICE } from '../application/interfaces/container-stacks-service.interface';
import { CONTAINER_CUSTOM_STACK_REPOSITORY as CONTAINER_CUSTOM_STACK_REPOSITORY_TOKEN } from '../domain/repositories/container-custom-stack-repository.interface';
import { CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY } from '../domain/repositories/container-custom-stack-repository-repository.interface';
import { CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE } from '../application/interfaces/container-stacks-repository-engine-service.interface';
import { CONTAINER_REPOSITORY_COMPONENT_SERVICE } from '../application/interfaces/container-repository-component-service.interface';
import { ContainerStacksModule } from '../container-stacks.module';
import { ContainerStacksController } from '../container-stacks.controller';
import { ContainerStacksService } from '../container-stacks.service';
import { ContainerCustomStackRepository } from '../infrastructure/repositories/container-custom-stack.repository';
import { ContainerCustomStackRepositoryMapper } from '../infrastructure/mappers/container-custom-stack-repository.mapper';
import { ContainerCustomStackMapper } from '../infrastructure/mappers/container-custom-stack.mapper';

vi.mock('@modules/auth/strategies/jwt-auth.guard', () => ({
  JwtAuthGuard: class {
    canActivate() {
      return true;
    }
  },
}));

vi.mock('@modules/ansible-vault', () => ({
  AnsibleVaultModule: class {
    static forRoot() {
      return {
        module: class {},
        providers: [],
      };
    }
  },
}));

vi.mock('../shell/shell.module', () => ({
  ShellModule: class {
    static forRoot() {
      return {
        module: class {},
        providers: [],
      };
    }
  },
}));

vi.mock('@nestjs/mongoose', () => {
  const actual = {
    Prop: () => {
      return (target: any, propertyKey: string) => {};
    },
    Schema: () => {
      return (constructor: Function) => {};
    },
    SchemaFactory: {
      createForClass: (dto: any) => ({
        schema: {},
      }),
    },
    MongooseModule: {
      forFeature: () => ({
        module: class {},
        providers: [],
      }),
      forRoot: () => ({
        module: class {},
        providers: [],
      }),
    },
    InjectModel: () => {
      return (target: any, key: string, index?: number) => {};
    },
    getModelToken: (name: string) => `${name}Model`,
  };
  return actual;
});

// Create mock classes for all dependencies
@Controller()
class MockContainerStacksController {}

@Injectable()
class MockContainerStacksService {}

@Injectable()
class MockContainerCustomStackRepository {}

@Injectable()
class MockContainerCustomStacksRepositoryRepository {}

@Injectable()
class MockContainerCustomStacksRepositoryEngineService {}

@Injectable()
class MockContainerRepositoryComponentService {}

@Injectable()
class MockContainerCustomStackMapper {}

@Injectable()
class MockContainerCustomStackRepositoryMapper {}

// Mock Mongoose Model
class MockModel {
  constructor() {}
  static find() {
    return {
      exec: () => Promise.resolve([]),
    };
  }
}

// Mock external modules
@Module({})
class MockShellModule {}

@Module({})
class MockAnsibleVaultModule {}

// Mock MongooseModule
const mockMongooseModule = MongooseModule.forFeature([
  { name: CONTAINER_CUSTOM_STACK, schema: {} },
  { name: CONTAINER_CUSTOM_STACK_REPOSITORY, schema: {} },
]);

@Module({
  imports: [MockShellModule, MockAnsibleVaultModule, mockMongooseModule],
  controllers: [MockContainerStacksController],
  providers: [
    {
      provide: CONTAINER_STACKS_SERVICE,
      useClass: MockContainerStacksService,
    },
    {
      provide: CONTAINER_CUSTOM_STACK_REPOSITORY_TOKEN,
      useClass: MockContainerCustomStackRepository,
    },
    {
      provide: CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY,
      useClass: MockContainerCustomStacksRepositoryRepository,
    },
    {
      provide: CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE,
      useClass: MockContainerCustomStacksRepositoryEngineService,
    },
    {
      provide: CONTAINER_REPOSITORY_COMPONENT_SERVICE,
      useClass: MockContainerRepositoryComponentService,
    },
    {
      provide: getModelToken(CONTAINER_CUSTOM_STACK),
      useValue: MockModel,
    },
    {
      provide: getModelToken(CONTAINER_CUSTOM_STACK_REPOSITORY),
      useValue: MockModel,
    },
    MockContainerStacksService,
    MockContainerCustomStackRepository,
    MockContainerCustomStacksRepositoryRepository,
    MockContainerCustomStacksRepositoryEngineService,
    MockContainerRepositoryComponentService,
    MockContainerCustomStackMapper,
    MockContainerCustomStackRepositoryMapper,
  ],
  exports: [
    CONTAINER_STACKS_SERVICE,
    MockContainerStacksService,
    CONTAINER_CUSTOM_STACK_REPOSITORY_TOKEN,
    CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY,
    CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE,
    CONTAINER_REPOSITORY_COMPONENT_SERVICE,
  ],
})
class MockContainerStacksModule {}

describe('ContainerStacksModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ContainerStacksModule],
    })
      .overrideModule(ContainerStacksModule)
      .useModule(MockContainerStacksModule)
      .compile();

    expect(module).toBeDefined();
  });
});