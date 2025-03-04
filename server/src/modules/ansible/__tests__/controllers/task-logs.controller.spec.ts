import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskLogsController } from '../../controllers/task-logs.controller';
import { TaskLogsService } from '../../services/task-logs.service';

// Mock the API response
vi.mock('../../../middlewares/api/ApiResponse', () => ({
  SuccessResponse: vi.fn().mockImplementation(function(this: any, message, data, meta) {
    this.send = vi.fn();
    return this;
  })
}));

describe('TaskLogsController', () => {
  let controller: TaskLogsController;
  let mockTaskLogsService;

  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Create the mock service with the required methods
    mockTaskLogsService = {
      getTaskLogs: vi.fn().mockImplementation((req, res) => Promise.resolve()),
      getTaskEvents: vi.fn().mockImplementation((req, res) => Promise.resolve())
    };
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskLogsController],
      providers: [
        {
          provide: TaskLogsService,
          useValue: mockTaskLogsService,
        },
      ],
    }).compile();

    controller = module.get<TaskLogsController>(TaskLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
}); 