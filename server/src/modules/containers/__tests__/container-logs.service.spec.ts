import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContainerLogsService } from '../application/services/container-logs.service';
import { WATCHER_ENGINE_SERVICE } from '../domain/interfaces/watcher-engine-service.interface';
import { CONTAINER_REPOSITORY } from '../domain/repositories/container-repository.interface';

describe('ContainerLogsService', () => {
  let service: ContainerLogsService;
  let containerRepository: any;
  let watcherEngineService: any;

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
          provide: CONTAINER_REPOSITORY,
          useValue: {
            findOneById: vi.fn().mockResolvedValue(mockContainer),
          },
        },
        {
          provide: WATCHER_ENGINE_SERVICE,
          useValue: {
            getStates: vi.fn().mockReturnValue({
              watcher: {
                'watcher.docker.docker-watcher': mockDockerComponent,
              },
            }),
            buildId: vi.fn().mockReturnValue('watcher.docker.docker-watcher'),
            findRegisteredDockerComponent: vi.fn().mockReturnValue(mockDockerComponent),
          },
        },
      ],
    }).compile();

    service = module.get<ContainerLogsService>(ContainerLogsService);
    containerRepository = module.get(CONTAINER_REPOSITORY);
    watcherEngineService = module.get(WATCHER_ENGINE_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findContainerById', () => {
    it('should return a container when found', async () => {
      const result = await service.findContainerById('container-id');

      expect(result).toEqual(mockContainer);
      expect(containerRepository.findOneById).toHaveBeenCalledWith('container-id');
    });

    it('should throw an error when repository throws', async () => {
      vi.spyOn(containerRepository, 'findOneById').mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.findContainerById('container-id')).rejects.toThrow('Database error');
    });
  });

  describe('findRegisteredComponent', () => {
    it('should return a Docker component when found', async () => {
      const result = await service.findRegisteredComponent('docker-watcher');

      expect(result).toEqual(mockDockerComponent);
      expect(watcherEngineService.findRegisteredDockerComponent).toHaveBeenCalledWith(
        'docker-watcher',
      );
    });

    it('should throw an error when service throws', async () => {
      vi.spyOn(watcherEngineService, 'findRegisteredDockerComponent').mockImplementationOnce(() => {
        throw new Error('Service error');
      });

      await expect(service.findRegisteredComponent('docker-watcher')).rejects.toThrow(
        'Service error',
      );
    });
  });

  describe('getContainerLiveLogs', () => {
    it('should get container logs successfully', async () => {
      const callback = vi.fn();
      const stopFunction = vi.fn();
      mockDockerComponent.getContainerLiveLogs.mockReturnValue(stopFunction);

      const result = await service.getContainerLiveLogs('container-id', 0, callback);

      expect(result).toBe(stopFunction);
      expect(containerRepository.findOneById).toHaveBeenCalledWith('container-id');
      expect(watcherEngineService.findRegisteredDockerComponent).toHaveBeenCalledWith(
        'docker-watcher',
      );
      expect(mockDockerComponent.getContainerLiveLogs).toHaveBeenCalledWith(
        'container-id',
        0,
        callback,
      );
    });

    it('should throw an error when container has no watcher', async () => {
      const callback = vi.fn();
      containerRepository.findOneById.mockResolvedValueOnce({ id: 'container-id', watcher: null });

      await expect(service.getContainerLiveLogs('container-id', 0, callback)).rejects.toThrow(
        'Container container-id has no associated watchers',
      );
    });

    it('should propagate errors from findContainerById', async () => {
      const callback = vi.fn();
      containerRepository.findOneById.mockRejectedValueOnce(new Error('Container not found'));

      await expect(service.getContainerLiveLogs('container-id', 0, callback)).rejects.toThrow(
        'Container not found',
      );
    });
  });
});
