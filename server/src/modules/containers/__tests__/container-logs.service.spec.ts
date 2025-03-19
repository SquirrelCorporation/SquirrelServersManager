import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ContainerLogsService } from '../services/container-logs.service';
import { ContainerRepository } from '../repositories/container.repository';
import { WatcherEngineService } from '../services/watcher-engine.service';
import { Kind } from '../application/services/components/core/component';
import { WATCHERS } from '../application/services/components/core/constants';

describe('ContainerLogsService', () => {
  let service: ContainerLogsService;
  let containerRepository: ContainerRepository;
  let watcherEngineService: WatcherEngineService;

  const mockContainer = {
    id: 'container-id',
    watcher: 'docker-watcher',
  };

  const mockDockerComponent = {
    getContainerLiveLogs: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContainerLogsService,
        {
          provide: ContainerRepository,
          useValue: {
            findById: vi.fn().mockResolvedValue(mockContainer),
          },
        },
        {
          provide: WatcherEngineService,
          useValue: {
            getStates: vi.fn().mockReturnValue({
              watcher: {
                'watcher.docker.docker-watcher': mockDockerComponent,
              },
            }),
            buildId: vi.fn().mockReturnValue('watcher.docker.docker-watcher'),
          },
        },
      ],
    }).compile();

    service = module.get<ContainerLogsService>(ContainerLogsService);
    containerRepository = module.get<ContainerRepository>(ContainerRepository);
    watcherEngineService = module.get<WatcherEngineService>(WatcherEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findContainerById', () => {
    it('should return a container when found', async () => {
      const result = await service.findContainerById('container-id');

      expect(result).toEqual(mockContainer);
      expect(containerRepository.findById).toHaveBeenCalledWith('container-id');
    });

    it('should throw an error when repository throws', async () => {
      vi.spyOn(containerRepository, 'findById').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findContainerById('container-id')).rejects.toThrow('Database error');
    });
  });

  describe('findRegisteredComponent', () => {
    it('should return a Docker component when found', async () => {
      const result = await service.findRegisteredComponent('docker-watcher');

      expect(result).toEqual(mockDockerComponent);
      expect(watcherEngineService.getStates).toHaveBeenCalled();
      expect(watcherEngineService.buildId).toHaveBeenCalledWith(Kind.WATCHER, WATCHERS.DOCKER, 'docker-watcher');
    });

    it('should throw an error when service throws', async () => {
      vi.spyOn(watcherEngineService, 'getStates').mockImplementationOnce(() => {
        throw new Error('Service error');
      });

      await expect(service.findRegisteredComponent('docker-watcher')).rejects.toThrow('Service error');
    });
  });
});