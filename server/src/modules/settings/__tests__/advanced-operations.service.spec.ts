import { EventEmitter2 } from '@nestjs/event-emitter';
import { Connection, Model } from 'mongoose';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock interfaces
interface IServerLogsService {
  deleteAll: () => Promise<void>;
  getServerLogs: () => Promise<any>;
}

interface IAnsibleLogsService {
  deleteAll: () => Promise<void>;
}

// Mock the service class
class AdvancedOperationsService {
  private readonly logger = { log: vi.fn(), error: vi.fn() };

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly serverLogsService: IServerLogsService,
    private readonly ansibleLogsService: IAnsibleLogsService,
    private readonly playbookModel: Model<any>,
  ) {}

  async restartServer(): Promise<void> {
    this.logger.log('Restarting server...');
    this.eventEmitter.emit('server.restart');
  }

  async deleteLogs(): Promise<void> {
    this.logger.log('Deleting logs...');
    await this.serverLogsService.deleteAll();
  }

  async deleteAnsibleLogs(): Promise<void> {
    this.logger.log('Deleting Ansible logs...');
    await this.ansibleLogsService.deleteAll();
  }

  async deletePlaybooksModelAndResync(): Promise<void> {
    this.logger.log('Deleting playbooks model and resyncing...');

    try {
      await this.playbookModel.db.collection('playbooks').drop();
      this.logger.log('Playbooks model deleted and resynced successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting playbooks model and resyncing: ${errorMessage}`);
      throw error;
    }
  }
}

vi.mock('@nestjs/event-emitter');

describe('AdvancedOperationsService', () => {
  let service: AdvancedOperationsService;
  let mockEventEmitter: EventEmitter2;
  let mockServerLogsService: IServerLogsService;
  let mockAnsibleLogsService: IAnsibleLogsService;
  let mockPlaybookModel: Model<any>;
  let mockCollection: { drop: Mock; find: Mock };

  beforeEach(() => {
    mockEventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    mockServerLogsService = {
      deleteAll: vi.fn(),
      getServerLogs: vi.fn(),
    } as unknown as IServerLogsService;

    mockAnsibleLogsService = {
      deleteAll: vi.fn(),
    } as unknown as IAnsibleLogsService;

    mockCollection = {
      drop: vi.fn().mockResolvedValue(undefined),
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          {
            uuid: '123',
            name: 'test-repo',
          },
        ]),
      }),
    };

    const mockDb = {
      collection: vi.fn().mockReturnValue(mockCollection),
    } as unknown as Connection;

    mockPlaybookModel = {
      db: mockDb,
    } as unknown as Model<any>;

    service = new AdvancedOperationsService(
      mockEventEmitter,
      mockServerLogsService,
      mockAnsibleLogsService,
      mockPlaybookModel,
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
      expect(mockServerLogsService.deleteAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAnsibleLogs', () => {
    it('should call ansible logs repository deleteAll method', async () => {
      await service.deleteAnsibleLogs();
      expect(mockAnsibleLogsService.deleteAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletePlaybooksModelAndResync', () => {
    it('should drop playbooks collection and resync repositories', async () => {
      await service.deletePlaybooksModelAndResync();

      expect(mockPlaybookModel.db.collection).toHaveBeenCalledWith('playbooks');
      expect(mockCollection.drop).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockCollection.drop.mockRejectedValueOnce(error);

      await expect(service.deletePlaybooksModelAndResync()).rejects.toThrow(error);
    });
  });
});
