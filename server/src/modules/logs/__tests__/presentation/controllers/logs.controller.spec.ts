import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SERVER_LOGS_SERVICE } from '../../../applicati../../domain/interfaces/server-logs-service.interface';
import { LogsController } from '../../../presentation/controllers/logs.controller';

describe('LogsController', () => {
  let controller: LogsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: SERVER_LOGS_SERVICE,
          useValue: {
            getServerLogs: () => ({}),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<LogsController>(LogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getServerLogs', async () => {
    const mockQuery = { current: 1, pageSize: 10 };
    const mockResult = {
      data: [],
      meta: { total: 0, success: true, pageSize: 10, current: 1 },
      message: 'Get server logs successful',
    };

    const mockServerLogsService = {
      getServerLogs: vi.fn().mockResolvedValue(mockResult),
    };

    // Replace the service with our mock
    (controller as any).serverLogsService = mockServerLogsService;

    const result = await controller.getServerLogs(mockQuery);

    expect(mockServerLogsService.getServerLogs).toHaveBeenCalledWith(mockQuery);
    expect(result).toEqual(mockResult);
  });
});
