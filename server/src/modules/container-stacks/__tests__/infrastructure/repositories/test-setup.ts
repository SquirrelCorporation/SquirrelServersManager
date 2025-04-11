import { vi } from 'vitest';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CONTAINER_CUSTOM_STACK_REPOSITORY } from '../../../infrastructure/schemas/container-custom-stack-repository.schema';
import { CONTAINER_CUSTOM_STACK } from '../../../infrastructure/schemas/container-custom-stack.schema';

// Import necessary NestJS decorators and classes
vi.mock('@nestjs/mongoose', () => {
  return {
    Schema: (options = {}) => {
      return (constructor: any) => {
        // Do nothing, just a mock decorator
      };
    },
    Prop: (options = {}) => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    SchemaFactory: {
      createForClass: (documentClass: any) => {
        return {
          // Return a mock schema
          schema: {}
        };
      }
    },
    InjectModel: () => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    getModelToken: (name: string) => `${name}Model`
  };
});

// Create proper mock for the schema files
vi.mock('../../../infrastructure/schemas/container-custom-stack.schema', () => {
  class MockContainerCustomStackDocument extends Document {
    uuid: string;
    name: string;
    yaml: string;
    json?: any;
    lockJson: boolean;
    path?: string;
    containerCustomStackRepository?: any;
    
    constructor() {
      super();
      this.uuid = 'mock-uuid';
      this.name = 'Mock Stack';
      this.yaml = 'version: "3"';
      this.lockJson = false;
    }
  }
  
  return {
    CONTAINER_CUSTOM_STACK: 'ContainerCustomStack',
    ContainerCustomStackDocument: MockContainerCustomStackDocument,
    ContainerCustomStackSchema: {
      // Return a mock schema with proper typing
    }
  };
});

vi.mock('../../../infrastructure/schemas/container-custom-stack-repository.schema', () => {
  class MockContainerCustomStackRepositoryDocument extends Document {
    uuid: string;
    name: string;
    accessToken?: string;
    branch?: string;
    email?: string;
    userName?: string;
    remoteUrl?: string;
    enabled: boolean;
    matchesList?: string[];
    onError?: boolean;
    onErrorMessage?: string;
    gitService?: string;
    ignoreSSLErrors?: boolean;
    
    constructor() {
      super();
      this.uuid = 'mock-repo-uuid';
      this.name = 'Mock Repo';
      this.enabled = true;
    }
  }
  
  return {
    CONTAINER_CUSTOM_STACK_REPOSITORY: 'ContainerCustomStackRepository',
    ContainerCustomStackRepositoryDocument: MockContainerCustomStackRepositoryDocument,
    ContainerCustomStackRepositorySchema: {
      // Return a mock schema with proper typing
    }
  };
});

// Mock the repositories and entities
vi.mock('../../../domain/entities/container-custom-stack.entity', () => {
  class MockContainerCustomStack {
    uuid: string;
    name: string;
    yaml?: string;
    json?: any;
    lockJson?: boolean;
    
    constructor() {
      this.uuid = 'mock-uuid';
      this.name = 'Mock Stack';
    }
  }
  
  interface MockContainerCustomStackRepositoryEntity {
    uuid: string;
    name: string;
  }
  
  return {
    ContainerCustomStack: MockContainerCustomStack,
    IContainerCustomStackRepositoryEntity: {}
  };
});

// Mock mappers
vi.mock('../../../infrastructure/mappers/container-custom-stack.mapper', () => {
  return {
    ContainerCustomStackMapper: class {
      toDomain(entity: any) {
        if (!entity) return null;
        return {
          uuid: entity.uuid || 'mock-uuid',
          name: entity.name || 'Mock Stack'
        };
      }
      
      toDomainList(entities: any[]) {
        if (!entities || !Array.isArray(entities)) return [];
        return entities.map(entity => this.toDomain(entity));
      }
      
      toPersistence(domain: any) {
        return {
          uuid: domain.uuid || 'mock-uuid',
          name: domain.name || 'Mock Stack',
          toObject: () => ({
            uuid: domain.uuid || 'mock-uuid',
            name: domain.name || 'Mock Stack'
          })
        };
      }
    }
  };
});

vi.mock('../../../infrastructure/mappers/container-custom-stack-repository.mapper', () => {
  return {
    ContainerCustomStackRepositoryMapper: class {
      toDomain(entity: any) {
        if (!entity) return null;
        return {
          uuid: entity.uuid || 'mock-repo-uuid',
          name: entity.name || 'Mock Repository'
        };
      }
      
      toDomainList(entities: any[]) {
        if (!entities || !Array.isArray(entities)) return [];
        return entities.map(entity => this.toDomain(entity));
      }
      
      toPersistence(domain: any) {
        return {
          uuid: domain.uuid || 'mock-repo-uuid',
          name: domain.name || 'Mock Repository',
          toObject: () => ({
            uuid: domain.uuid || 'mock-repo-uuid',
            name: domain.name || 'Mock Repository'
          })
        };
      }
    }
  };
});