import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContainerVolumesService } from '../application/services/container-volumes.service';

// Mock device UUID for testing
const TEST_DEVICE_UUID = uuidv4();

// Mock container volume for testing
const mockVolume = {
  id: 'volume-id',
  uuid: uuidv4(),
  name: 'test-volume',
  deviceUuid: TEST_DEVICE_UUID,
  driver: 'local',
  scope: 'local',
  mountpoint: '/var/lib/docker/volumes/test-volume/_data',
  driver_opts: {},
  labels: { 'com.docker.test': 'true' },
  createdAt: new Date(),
};

// Mock Docker watcher component
const mockDockerWatcherComponent = {
  createVolume: vi.fn().mockResolvedValue({
    id: 'volume-id',
    name: 'test-volume',
    driver: 'local',
    scope: 'local',
    mountpoint: '/var/lib/docker/volumes/test-volume/_data',
    driver_opts: {},
    labels: { 'com.docker.test': 'true' },
  }),
  getVolume: vi.fn().mockResolvedValue({
    id: 'volume-id',
    name: 'test-volume',
    driver: 'local',
    scope: 'local',
    mountpoint: '/var/lib/docker/volumes/test-volume/_data',
    driver_opts: {},
    labels: { 'com.docker.test': 'true' },
  }),
  listVolumes: vi.fn().mockResolvedValue([
    {
      id: 'volume-id',
      name: 'test-volume',
      driver: 'local',
      scope: 'local',
      mountpoint: '/var/lib/docker/volumes/test-volume/_data',
      driver_opts: {},
      labels: { 'com.docker.test': 'true' },
    },
  ]),
  removeVolume: vi.fn().mockResolvedValue(undefined),
  pruneVolumes: vi.fn().mockResolvedValue({ count: 2 }),
};

// Mock repository
const mockVolumeRepository = {
  findAll: vi.fn().mockResolvedValue([mockVolume]),
  findAllByDeviceUuid: vi.fn().mockResolvedValue([mockVolume]),
  findOneByUuid: vi.fn().mockResolvedValue(mockVolume),
  findOneByNameAndDeviceUuid: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockImplementation((volume) => Promise.resolve(volume)),
  update: vi.fn().mockImplementation((uuid, data) => Promise.resolve({ ...mockVolume, ...data })),
  deleteByUuid: vi.fn().mockResolvedValue(true),
};

// Mock watcher engine service
const mockWatcherEngineService = {
  findRegisteredDockerComponent: vi.fn().mockReturnValue(mockDockerWatcherComponent),
  onModuleInit: vi.fn(),
  onModuleDestroy: vi.fn(),
  getStates: vi.fn().mockResolvedValue([]),
  getRegistries: vi.fn().mockResolvedValue([]),
  getDevices: vi.fn().mockResolvedValue([]),
  getDeviceByUuid: vi.fn().mockResolvedValue(null),
  getDeviceByIp: vi.fn().mockResolvedValue(null),
  registerDevice: vi.fn().mockResolvedValue(null),
  unregisterDevice: vi.fn().mockResolvedValue(null),
  registerDeviceComponent: vi.fn().mockResolvedValue(null),
  unregisterDeviceComponent: vi.fn().mockResolvedValue(null),
  findRegisteredComponent: vi.fn().mockResolvedValue(null),
  findRegisteredComponentByType: vi.fn().mockResolvedValue(null),
  findRegisteredComponentByName: vi.fn().mockResolvedValue(null),
  registerComponent: vi.fn().mockResolvedValue(null),
  registerWatchers: vi.fn().mockResolvedValue(null),
  registerWatcher: vi.fn().mockResolvedValue(null),
  registerRegistries: vi.fn().mockResolvedValue(null),
  unregisterComponent: vi.fn().mockResolvedValue(null),
  unregisterWatchers: vi.fn().mockResolvedValue(null),
  unregisterWatcher: vi.fn().mockResolvedValue(null),
  deregisterComponent: vi.fn().mockResolvedValue(null),
  deregisterComponents: vi.fn().mockResolvedValue(null),
  deregisterRegistries: vi.fn().mockResolvedValue(null),
  deregisterWatchers: vi.fn().mockResolvedValue(null),
  deregisterWatcher: vi.fn().mockResolvedValue(null),
  getRegisteredComponents: vi.fn().mockResolvedValue([]),
  getRegisteredWatchers: vi.fn().mockResolvedValue([]),
  deregisterAll: vi.fn().mockResolvedValue(null),
  init: vi.fn().mockResolvedValue(null),
  buildId: vi.fn().mockReturnValue('test-id'),
};

// Mock devices service
const mockDevicesService = {
  findOneByUuid: vi.fn().mockImplementation((uuid) => {
    if (uuid === TEST_DEVICE_UUID) {
      return Promise.resolve({ uuid: TEST_DEVICE_UUID, name: 'Test Device' });
    }
    return Promise.resolve(null);
  }),
  create: vi.fn().mockResolvedValue(null),
  update: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  findByUuids: vi.fn().mockResolvedValue([]),
  findOneByIp: vi.fn().mockResolvedValue(null),
  setDeviceOfflineAfter: vi.fn().mockResolvedValue(null),
  deleteByUuid: vi.fn().mockResolvedValue(null),
  findWithFilter: vi.fn().mockResolvedValue([]),
  getDevicesOverview: vi.fn().mockResolvedValue({}),
};

describe('ContainerVolumesService', () => {
  let service: ContainerVolumesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ContainerVolumesService,
          useFactory: () => {
            return new ContainerVolumesService(
              mockVolumeRepository,
              mockWatcherEngineService,
              mockDevicesService,
            );
          },
        },
      ],
    }).compile();

    service = module.get<ContainerVolumesService>(ContainerVolumesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllVolumes', () => {
    it('should return all volumes', async () => {
      const result = await service.getAllVolumes();
      expect(result).toEqual([mockVolume]);
      expect(mockVolumeRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getVolumesByDeviceUuid', () => {
    it('should return volumes for a specific device', async () => {
      const result = await service.getVolumesByDeviceUuid(TEST_DEVICE_UUID);
      expect(result).toEqual([mockVolume]);
      expect(mockVolumeRepository.findAllByDeviceUuid).toHaveBeenCalledWith(TEST_DEVICE_UUID);
    });
  });

  describe('getVolumeByUuid', () => {
    it('should return a specific volume by UUID', async () => {
      const result = await service.getVolumeByUuid(mockVolume.uuid);
      expect(result).toEqual(mockVolume);
      expect(mockVolumeRepository.findOneByUuid).toHaveBeenCalledWith(mockVolume.uuid);
    });
  });

  describe('createVolume', () => {
    it('should create a new volume on a device', async () => {
      const volumeData = {
        name: 'new-volume',
        driver: 'local',
        labels: { test: 'value' },
        uuid: uuidv4(),
      };

      mockVolumeRepository.create.mockResolvedValueOnce({
        ...volumeData,
        deviceUuid: TEST_DEVICE_UUID,
      });

      const result = await service.createVolume(TEST_DEVICE_UUID, volumeData);

      expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith(TEST_DEVICE_UUID);
      expect(mockVolumeRepository.findOneByNameAndDeviceUuid).toHaveBeenCalledWith(
        volumeData.name,
        TEST_DEVICE_UUID,
      );
      expect(mockVolumeRepository.create).toHaveBeenCalledWith(volumeData);
      expect(result).toEqual({
        ...volumeData,
        deviceUuid: TEST_DEVICE_UUID,
      });
    });

    it('should throw an error if device not found', async () => {
      const volumeData = {
        name: 'new-volume',
        driver: 'local',
      };

      await expect(service.createVolume('non-existent-uuid', volumeData)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith('non-existent-uuid');
    });

    it('should throw an error if volume with same name already exists', async () => {
      mockVolumeRepository.findOneByNameAndDeviceUuid.mockResolvedValueOnce(mockVolume);

      const volumeData = {
        name: 'test-volume',
        driver: 'local',
      };

      await expect(service.createVolume(TEST_DEVICE_UUID, volumeData)).rejects.toThrow(
        `Volume with name ${volumeData.name} already exists on device ${TEST_DEVICE_UUID}`,
      );
    });
  });

  describe('updateVolume', () => {
    it('should update an existing volume', async () => {
      const updateData = {
        labels: { updated: 'true' },
      };

      const result = await service.updateVolume(mockVolume.uuid, updateData);

      expect(mockVolumeRepository.findOneByUuid).toHaveBeenCalledWith(mockVolume.uuid);
      expect(mockVolumeRepository.update).toHaveBeenCalledWith(mockVolume.uuid, updateData);
      expect(result).toHaveProperty('labels.updated', 'true');
    });

    it('should throw an error if volume not found', async () => {
      mockVolumeRepository.findOneByUuid.mockResolvedValueOnce(null);

      const updateData = {
        labels: { updated: 'true' },
      };

      await expect(service.updateVolume(mockVolume.uuid, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteVolume', () => {
    it('should delete an existing volume', async () => {
      const result = await service.deleteVolume(mockVolume.uuid);

      expect(mockVolumeRepository.findOneByUuid).toHaveBeenCalledWith(mockVolume.uuid);
      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.removeVolume).toHaveBeenCalledWith(mockVolume.name);
      expect(mockVolumeRepository.deleteByUuid).toHaveBeenCalledWith(mockVolume.uuid);
      expect(result).toBe(true);
    });

    it('should throw an error if volume not found', async () => {
      mockVolumeRepository.findOneByUuid.mockResolvedValueOnce(null);

      await expect(service.deleteVolume(mockVolume.uuid)).rejects.toThrow(NotFoundException);
    });
  });

  describe('pruneVolumes', () => {
    it('should prune unused volumes on a device', async () => {
      const result = await service.pruneVolumes(TEST_DEVICE_UUID);

      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.pruneVolumes).toHaveBeenCalled();
      expect(result).toEqual({ count: 2 });
    });
  });
});
