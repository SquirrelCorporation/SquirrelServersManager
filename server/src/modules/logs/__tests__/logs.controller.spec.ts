import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LogsController } from '../controllers/logs.controller';
import { ServerLogsService } from '../services/server-logs.service';
import { TaskLogsService } from '../services/task-logs.service';

describe('LogsModule', () => {
  let controller: LogsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [
        {
          provide: ServerLogsService,
          useValue: {
            getServerLogs: () => ({}),
          },
        },
        {
          provide: TaskLogsService,
          useValue: {
            getTaskLogs: () => ({}),
            getTaskEvents: () => ({}),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<LogsController>(LogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
