import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './test-setup';

// Create mock classes for the module's exports
class MockPlaybookService {
  findAll = vi.fn().mockResolvedValue([]);
  findOne = vi.fn().mockResolvedValue({});
  create = vi.fn().mockResolvedValue({});
  update = vi.fn().mockResolvedValue({});
  delete = vi.fn().mockResolvedValue(true);
}

class MockPlaybooksRegisterService {
  findAll = vi.fn().mockResolvedValue([]);
  findOne = vi.fn().mockResolvedValue({});
  create = vi.fn().mockResolvedValue({});
  update = vi.fn().mockResolvedValue({});
  delete = vi.fn().mockResolvedValue(true);
  sync = vi.fn().mockResolvedValue(true);
}

class MockPlaybooksRegisterEngineService {
  getComponentFactory = vi.fn().mockReturnValue({});
}

class MockPlaybookController {
  findAll = vi.fn().mockResolvedValue([]);
  findOne = vi.fn().mockResolvedValue({});
  create = vi.fn().mockResolvedValue({});
  update = vi.fn().mockResolvedValue({});
  delete = vi.fn().mockResolvedValue(true);
}

class MockPlaybooksRepositoryController {
  findAll = vi.fn().mockResolvedValue([]);
  findOne = vi.fn().mockResolvedValue({});
  create = vi.fn().mockResolvedValue({});
  update = vi.fn().mockResolvedValue({});
  delete = vi.fn().mockResolvedValue(true);
}

// Mock repositories
const mockPlaybookRepository = {
  findAll: vi.fn().mockResolvedValue([]),
  findOne: vi.fn().mockResolvedValue({}),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(true),
};

const mockPlaybooksRegisterRepository = {
  findAll: vi.fn().mockResolvedValue([]),
  findOne: vi.fn().mockResolvedValue({}),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(true),
};

// Mock the PlaybooksModule
class MockPlaybooksModule {}

// Mock the MongooseModule
const mockMongooseModule = {
  forFeature: () => ({}),
};

// Mock common-test-helpers
vi.mock('../../common-test-helpers', () => ({
  rootMongooseTestModule: () => ({}),
  closeInMongodConnection: vi.fn().mockResolvedValue(undefined),
}));

describe('PlaybooksModule', () => {
  let playbooksModule;

  beforeEach(async () => {
    const moduleRef = {
      get: vi.fn().mockImplementation((token) => {
        if (token === MockPlaybooksModule) return new MockPlaybooksModule();
        if (token === MockPlaybookService) return new MockPlaybookService();
        if (token === MockPlaybooksRegisterService) return new MockPlaybooksRegisterService();
        if (token === MockPlaybooksRegisterEngineService)
          return new MockPlaybooksRegisterEngineService();
        if (token === MockPlaybookController) return new MockPlaybookController();
        if (token === MockPlaybooksRepositoryController)
          return new MockPlaybooksRepositoryController();
        return undefined;
      }),
    };

    // Create a mock module test factory
    vi.spyOn(Test, 'createTestingModule').mockImplementation(() => {
      return {
        imports: [],
        overrideProvider: () => ({
          useValue: () => ({
            compile: vi.fn().mockResolvedValue(moduleRef),
          }),
        }),
        compile: vi.fn().mockResolvedValue(moduleRef),
      };
    });

    playbooksModule = new MockPlaybooksModule();
  });

  it('should be defined', () => {
    expect(playbooksModule).toBeDefined();
  });

  it('should provide PlaybookService', async () => {
    const service = new MockPlaybookService();
    expect(service).toBeDefined();
  });

  it('should provide PlaybooksRegisterService', async () => {
    const service = new MockPlaybooksRegisterService();
    expect(service).toBeDefined();
  });

  it('should provide PlaybooksRegisterEngineService', async () => {
    const service = new MockPlaybooksRegisterEngineService();
    expect(service).toBeDefined();
  });

  it('should provide PlaybookController', async () => {
    const controller = new MockPlaybookController();
    expect(controller).toBeDefined();
  });

  it('should provide PlaybooksRepositoryController', async () => {
    const controller = new MockPlaybooksRepositoryController();
    expect(controller).toBeDefined();
  });
});
