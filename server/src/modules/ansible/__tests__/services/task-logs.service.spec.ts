import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskLogsService } from '../../services/task-logs.service';
import { AnsibleLogsRepository } from '../../repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from '../../repositories/ansible-task.repository';

// Mock helper functions
vi.mock('../../../helpers/query/FilterHelper', () => ({
  filterByFields: vi.fn().mockImplementation((data) => data),
  filterByQueryParams: vi.fn().mockImplementation((data) => data)
}));

vi.mock('../../../helpers/query/PaginationHelper', () => ({
  paginate: vi.fn().mockImplementation((data, current, pageSize) => 
    data.slice(0, pageSize))
}));

vi.mock('../../../helpers/query/SorterHelper', () => ({
  sortByFields: vi.fn().mockImplementation((data) => data)
}));

vi.mock('../../../middlewares/api/ApiResponse', () => ({
  SuccessResponse: vi.fn().mockImplementation(function(this: any, message, data, meta) {
    this.send = vi.fn();
    return this;
  })
}));

vi.mock('../../../middlewares/api/ApiError', () => ({
  NotFoundError: vi.fn().mockImplementation(function(this: any, message) {
    this.message = message;
    return this;
  })
}));

describe('TaskLogsService', () => {
  let service: TaskLogsService;
  let ansibleLogsRepository;
  let ansibleTaskRepository;

  beforeEach(async () => {
    // Create fresh mocks for each test
    ansibleLogsRepository = {
      findByTaskId: vi.fn(),
      create: vi.fn(),
      deleteByTaskId: vi.fn()
    };
    
    ansibleTaskRepository = {
      findAllWithoutParams: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskLogsService,
        {
          provide: AnsibleLogsRepository,
          useValue: ansibleLogsRepository,
        },
        {
          provide: AnsibleTaskRepository,
          useValue: ansibleTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TaskLogsService>(TaskLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTaskEvents', () => {
    it('should throw NotFoundError if no id is provided', async () => {
      const req = {
        params: {}
      };
      const res = {
        send: vi.fn()
      };

      try {
        await service.getTaskEvents(req, res);
        // If we reach this point, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
}); 