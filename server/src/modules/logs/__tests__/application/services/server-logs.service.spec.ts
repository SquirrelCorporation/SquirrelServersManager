import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerLogsService } from '../../../application/services/server-logs.service';
import { IServerLogsRepository } from '../../../domain/repositories/server-logs-repository.interface';
import { ServerLogPresentationMapper } from '../../../presentation/mappers/server-log.mapper';
import { ServerLogEntity } from '../../../domain/entities/server-log.entity';
import * as FilterHelper from '../../../../../helpers/query/FilterHelper';
import * as SorterHelper from '../../../../../helpers/query/SorterHelper';
import * as PaginationHelper from '../../../../../helpers/query/PaginationHelper';

describe('ServerLogsService', () => {
  let service: ServerLogsService;
  let mockServerLogsRepository: any;
  let mockServerLogPresentationMapper: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the helper functions
    vi.mock('../../../../../helpers/query/FilterHelper', () => ({
      filterByFields: vi.fn().mockImplementation(data => data),
      filterByQueryParams: vi.fn().mockImplementation((data, params) => {
        if (params.search === 'error') {
          return data.filter(item => item.msg.includes('error'));
        }
        return data;
      }),
    }));

    vi.mock('../../../../../helpers/query/SorterHelper', () => ({
      sortByFields: vi.fn().mockImplementation(data => data),
    }));

    vi.mock('../../../../../helpers/query/PaginationHelper', () => ({
      paginate: vi.fn().mockImplementation((data, current, pageSize) => {
        const start = (current - 1) * pageSize;
        return data.slice(start, start + pageSize);
      }),
    }));

    mockServerLogsRepository = {
      findAll: vi.fn().mockResolvedValue([]),
    };

    mockServerLogPresentationMapper = {
      toDto: vi.fn().mockImplementation(entity => entity),
    };

    service = new ServerLogsService(
      mockServerLogsRepository as unknown as IServerLogsRepository,
      mockServerLogPresentationMapper as unknown as ServerLogPresentationMapper
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServerLogs', () => {
    it('should return logs with pagination', async () => {
      const mockLogs = [
        { level: 1, time: new Date(), msg: 'log1' },
        { level: 2, time: new Date(), msg: 'log2' },
        { level: 3, time: new Date(), msg: 'log3' },
      ] as ServerLogEntity[];

      mockServerLogsRepository.findAll.mockResolvedValue(mockLogs);

      const params = { current: 1, pageSize: 2 };
      const result = await service.getServerLogs(params);

      expect(mockServerLogsRepository.findAll).toHaveBeenCalled();
      expect(mockServerLogPresentationMapper.toDto).toHaveBeenCalledTimes(2); // Only first 2 due to pagination
      expect(result.data.length).toBe(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.pageSize).toBe(2);
      expect(result.meta.current).toBe(1);
      expect(result.message).toBe('Get server logs successful');
    });

    it('should apply filtering', async () => {
      const mockLogs = [
        { level: 1, time: new Date(), msg: 'error log' },
        { level: 2, time: new Date(), msg: 'info log' },
        { level: 3, time: new Date(), msg: 'debug log' },
      ] as ServerLogEntity[];

      mockServerLogsRepository.findAll.mockResolvedValue(mockLogs);

      const params = { current: 1, pageSize: 10, search: 'error' };
      const result = await service.getServerLogs(params);

      expect(mockServerLogsRepository.findAll).toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination values if not provided', async () => {
      const mockLogs = Array(15).fill({}).map((_, i) => ({
        level: i,
        time: new Date(),
        msg: `log${i}`
      })) as ServerLogEntity[];

      mockServerLogsRepository.findAll.mockResolvedValue(mockLogs);

      const params = {};
      const result = await service.getServerLogs(params);

      expect(mockServerLogsRepository.findAll).toHaveBeenCalled();
      expect(result.data.length).toBe(10); // Default pageSize is 10
      expect(result.meta.total).toBe(15);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.current).toBe(1);
    });
  });
});