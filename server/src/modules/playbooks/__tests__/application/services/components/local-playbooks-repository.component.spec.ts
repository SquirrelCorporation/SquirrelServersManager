import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockLocalPlaybooksRegisterComponent } from './local-playbooks-repository-test-setup';

// Import the test setup to ensure mocks are applied
import './local-playbooks-repository-test-setup';

describe('LocalPlaybooksRegisterComponent', () => {
  let component: MockLocalPlaybooksRegisterComponent;
  let mockFileSystemService: any;
  let mockPlaybookFileService: any;
  let mockPlaybookRepository: any;
  let mockPlaybooksRegisterRepository: any;
  let mockEventEmitter: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    mockFileSystemService = {
      createDirectory: vi.fn().mockResolvedValue(undefined),
      deleteFiles: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybookFileService = {
      newPlaybook: vi.fn().mockResolvedValue(undefined),
      deletePlaybook: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybookRepository = {
      findOneByUuid: vi.fn().mockResolvedValue({}),
      updateOrCreate: vi.fn().mockResolvedValue({}),
    };

    mockPlaybooksRegisterRepository = {
      findByUuid: vi.fn().mockResolvedValue({
        uuid: 'local-123',
        name: 'Local Repository',
      }),
      update: vi.fn().mockResolvedValue(undefined),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    // Create a mock Logger with child method
    const mockLogger = {
      ...Logger,
      child: vi.fn().mockReturnValue({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      }),
    };

    component = new MockLocalPlaybooksRegisterComponent(
      mockFileSystemService,
      mockPlaybookFileService,
      mockPlaybookRepository,
      mockPlaybooksRegisterRepository,
      mockEventEmitter,
      'local-123',
      mockLogger,
      'Local Repository',
      '/path/to/local',
    );

    // Mock syncToDatabase method
    vi.spyOn(component, 'syncToDatabase').mockResolvedValue(3);
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  describe('init', () => {
    it('should initialize the component by creating the directory', async () => {
      await component.init();
      expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith(
        '/path/to/local/local-123',
      );
    });
  });

  describe('syncFromRepository', () => {
    it('should sync from repository by calling syncToDatabase', async () => {
      await component.syncFromRepository();
      expect(component.syncToDatabase).toHaveBeenCalled();
    });
  });

  describe('basic functionality', () => {
    it('should have the correct properties initialized', () => {
      expect(component.name).toBe('Local Repository');
      expect(component.uuid).toBe('local-123');
      expect(component.directory).toBe('/path/to/local/local-123');
      expect(component.rootPath).toBe('/path/to/local');
    });
  });
});
