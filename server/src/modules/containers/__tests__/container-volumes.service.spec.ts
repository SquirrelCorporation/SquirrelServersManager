import { Test, TestingModule } from '@nestjs/testing';
import { ContainerVolumesService } from '../application/services/container-volumes.service';
import { CONTAINER_VOLUME_REPOSITORY } from '../domain/repositories/container-volume-repository.interface';
import { WATCHER_ENGINE_SERVICE } from '../application/interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../devices/application/services/devices.service';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
  createVolume: jest.fn().mockResolvedValue({
    id: 'volume-id',
    name: 'test-volume',
    driver: 'local',
    scope: 'local',
    mountpoint: '/var/lib/docker/volumes/test-volume/_data',
    driver_opts: {},
    labels: { 'com.docker.test': 'true' },
  }),
  getVolume: jest.fn().mockResolvedValue({
    id: 'volume-id',
    name: 'test-volume',
    driver: 'local',
    scope: 'local',
    mountpoint: '/var/lib/docker/volumes/test-volume/_data',
    driver_opts: {},
    labels: { 'com.docker.test': 'true' },
  }),
  listVolumes: jest.fn().mockResolvedValue([
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
  removeVolume: jest.fn().mockResolvedValue(undefined),
  pruneVolumes: jest.fn().mockResolvedValue({ count: 2 }),
};

// Mock repository
const mockVolumeRepository = {
  findAll: jest.fn().mockResolvedValue([mockVolume]),
  findAllByDeviceUuid: jest.fn().mockResolvedValue([mockVolume]),
  findOneByUuid: jest.fn().mockResolvedValue(mockVolume),
  findOneByNameAndDeviceUuid: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((volume) => Promise.resolve(volume)),
  update: jest.fn().mockImplementation((uuid, data) => Promise.resolve({ ...mockVolume, ...data })),
  deleteByUuid: jest.fn().mockResolvedValue(true),
};

// Mock watcher engine service
const mockWatcherEngineService = {
  findRegisteredDockerComponent: jest.fn().mockReturnValue(mockDockerWatcherComponent),
};

// Mock devices service
const mockDevicesService = {
  findByUuid: jest.fn().mockResolvedValue({ uuid: TEST_DEVICE_UUID, name: 'Test Device' }),
};

describe('ContainerVolumesService', () => {
  let service: ContainerVolumesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContainerVolumesService,
        {
          provide: CONTAINER_VOLUME_REPOSITORY,
          useValue: mockVolumeRepository,
        },
        {
          provide: WATCHER_ENGINE_SERVICE,
          useValue: mockWatcherEngineService,
        },
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
      ],
    }).compile();

    service = module.get<ContainerVolumesService>(ContainerVolumesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        labels: { 'test': 'value' },
      };

      const result = await service.createVolume(TEST_DEVICE_UUID, volumeData);
      
      expect(mockDevicesService.findByUuid).toHaveBeenCalledWith(TEST_DEVICE_UUID);
      expect(mockVolumeRepository.findOneByNameAndDeviceUuid).toHaveBeenCalledWith(volumeData.name, TEST_DEVICE_UUID);
      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.createVolume).toHaveBeenCalledWith(volumeData);
      expect(mockVolumeRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('uuid');
      expect(result).toHaveProperty('deviceUuid', TEST_DEVICE_UUID);
    });

    it('should throw an error if device not found', async () => {
      mockDevicesService.findByUuid.mockResolvedValueOnce(null);
      
      const volumeData = {
        name: 'new-volume',
        driver: 'local',
      };

      await expect(service.createVolume(TEST_DEVICE_UUID, volumeData)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if volume with same name already exists', async () => {
      mockVolumeRepository.findOneByNameAndDeviceUuid.mockResolvedValueOnce(mockVolume);
      
      const volumeData = {
        name: 'test-volume',
        driver: 'local',
      };

      await expect(service.createVolume(TEST_DEVICE_UUID, volumeData)).rejects.toThrow(
        `Volume with name ${volumeData.name} already exists on device ${TEST_DEVICE_UUID}`
      );
    });
  });

  describe('updateVolume', () => {
    it('should update an existing volume', async () => {
      const updateData = {
        labels: { 'updated': 'true' },
      };

      const result = await service.updateVolume(mockVolume.uuid, updateData);
      
      expect(mockVolumeRepository.findOneByUuid).toHaveBeenCalledWith(mockVolume.uuid);
      expect(mockVolumeRepository.update).toHaveBeenCalledWith(mockVolume.uuid, updateData);
      expect(result).toHaveProperty('labels.updated', 'true');
    });

    it('should throw an error if volume not found', async () => {
      mockVolumeRepository.findOneByUuid.mockResolvedValueOnce(null);
      
      const updateData = {
        labels: { 'updated': 'true' },
      };

      await expect(service.updateVolume(mockVolume.uuid, updateData)).rejects.toThrow(NotFoundException);
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