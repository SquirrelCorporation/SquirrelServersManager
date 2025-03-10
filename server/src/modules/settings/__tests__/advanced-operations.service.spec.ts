import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdvancedOperationsService } from '../application/services/advanced-operations.service';

describe('AdvancedOperationsService', () => {
  let service: AdvancedOperationsService;
  let mockEventEmitter: any;
  let mockServerLogsRepository: any;
  let mockAnsibleLogsRepository: any;
  let mockPlaybooksRepositoryEngineService: any;
  let mockPlaybookModel: any;

  beforeEach(() => {
    mockEventEmitter = {
      emit: vi.fn(),
    };

    mockServerLogsRepository = {
      deleteAll: vi.fn(),
    };

    mockAnsibleLogsRepository = {
      deleteAll: vi.fn(),
    };

    mockPlaybooksRepositoryEngineService = {
      getState: vi.fn(),
      deregisterRepository: vi.fn(),
      registerRepository: vi.fn(),
    };

    mockPlaybookModel = {
      db: {
        collection: vi.fn().mockReturnValue({
          drop: vi.fn().mockResolvedValue(undefined),
          find: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([{ uuid: '123', name: 'test-repo' }]),
          }),
        }),
      },
    };

    service = new AdvancedOperationsService(
      mockEventEmitter,
      mockServerLogsRepository,
      mockAnsibleLogsRepository,
      mockPlaybooksRepositoryEngineService,
      mockPlaybookModel
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('restartServer', () => {
    it('should emit server.restart event', async () => {
      await service.restartServer();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('server.restart');
    });
  });

  describe('deleteLogs', () => {
    it('should call server logs repository deleteAll method', async () => {
      await service.deleteLogs();
      expect(mockServerLogsRepository.deleteAll).toHaveBeenCalled();
    });
  });

  describe('deleteAnsibleLogs', () => {
    it('should call ansible logs repository deleteAll method', async () => {
      await service.deleteAnsibleLogs();
      expect(mockAnsibleLogsRepository.deleteAll).toHaveBeenCalled();
    });
  });

  describe('deletePlaybooksModelAndResync', () => {
    it('should drop playbooks collection and resync repositories', async () => {
      mockPlaybooksRepositoryEngineService.getState.mockReturnValue({
        '123': { name: 'test-repo' },
      });

      await service.deletePlaybooksModelAndResync();

      expect(mockPlaybookModel.db.collection).toHaveBeenCalledWith('playbooks');
      expect(mockPlaybookModel.db.collection().drop).toHaveBeenCalled();
      expect(mockPlaybooksRepositoryEngineService.getState).toHaveBeenCalled();
      expect(mockPlaybooksRepositoryEngineService.deregisterRepository).toHaveBeenCalledWith('123');
      expect(mockPlaybookModel.db.collection).toHaveBeenCalledWith('playbookrepositories');
      expect(mockPlaybookModel.db.collection().find).toHaveBeenCalled();
      expect(mockPlaybookModel.db.collection().find().toArray).toHaveBeenCalled();
      expect(mockPlaybooksRepositoryEngineService.registerRepository).toHaveBeenCalledWith({ uuid: '123', name: 'test-repo' });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockPlaybookModel.db.collection().drop.mockRejectedValue(error);

      await expect(service.deletePlaybooksModelAndResync()).rejects.toThrow(error);
    });
  });
});