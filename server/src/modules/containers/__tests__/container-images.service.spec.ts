import { Test, TestingModule } from '@nestjs/testing';
import { ContainerImagesService } from '../application/services/container-images.service';
import { CONTAINER_IMAGE_REPOSITORY } from '../domain/repositories/container-image-repository.interface';
import { WATCHER_ENGINE_SERVICE } from '../application/interfaces/watcher-engine-service.interface';
import { DevicesService } from '../../devices/application/services/devices.service';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Mock filesystem methods
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock device UUID for testing
const TEST_DEVICE_UUID = uuidv4();

// Mock container image for testing
const mockImage = {
  id: 'image-id',
  uuid: uuidv4(),
  name: 'test-image',
  tag: 'latest',
  deviceUuid: TEST_DEVICE_UUID,
  size: 10000000,
  createdAt: new Date(),
  repoDigests: ['test-image@sha256:1234567890'],
  labels: { 'com.docker.test': 'true' },
  containers: [],
};

// Mock Docker watcher component
const mockDockerWatcherComponent = {
  listImages: jest.fn().mockResolvedValue([
    {
      id: 'image-id',
      name: 'test-image',
      tag: 'latest',
      size: 10000000,
      createdAt: new Date(),
      repoDigests: ['test-image@sha256:1234567890'],
      labels: { 'com.docker.test': 'true' },
    },
  ]),
  getImage: jest.fn().mockResolvedValue({
    id: 'image-id',
    name: 'test-image',
    tag: 'latest',
    size: 10000000,
    createdAt: new Date(),
    repoDigests: ['test-image@sha256:1234567890'],
    labels: { 'com.docker.test': 'true' },
  }),
  pullImage: jest.fn().mockResolvedValue({
    id: 'new-image-id',
    name: 'nginx',
    tag: 'latest',
    size: 15000000,
    createdAt: new Date(),
    repoDigests: ['nginx@sha256:0987654321'],
    labels: { 'org.label-schema.name': 'nginx' },
  }),
  removeImage: jest.fn().mockResolvedValue(undefined),
  buildImage: jest.fn().mockResolvedValue({
    id: 'built-image-id',
    name: 'custom-image',
    tag: 'v1.0',
    size: 8000000,
    createdAt: new Date(),
    labels: { 'com.example.version': '1.0' },
  }),
  tagImage: jest.fn().mockResolvedValue(undefined),
  pushImage: jest.fn().mockResolvedValue(undefined),
  pruneImages: jest.fn().mockResolvedValue({ count: 3, spaceReclaimed: 25000000 }),
};

// Mock repository
const mockImageRepository = {
  findAll: jest.fn().mockResolvedValue([mockImage]),
  findAllByDeviceUuid: jest.fn().mockResolvedValue([mockImage]),
  findOneByUuid: jest.fn().mockResolvedValue(mockImage),
  findOneByIdAndDeviceUuid: jest.fn().mockResolvedValue(mockImage),
  findByNameAndTag: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((image) => Promise.resolve(image)),
  update: jest.fn().mockImplementation((uuid, data) => Promise.resolve({ ...mockImage, ...data })),
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

describe('ContainerImagesService', () => {
  let service: ContainerImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContainerImagesService,
        {
          provide: CONTAINER_IMAGE_REPOSITORY,
          useValue: mockImageRepository,
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

    service = module.get<ContainerImagesService>(ContainerImagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllImages', () => {
    it('should return all images', async () => {
      const result = await service.getAllImages();
      expect(result).toEqual([mockImage]);
      expect(mockImageRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getImagesByDeviceUuid', () => {
    it('should return images for a specific device', async () => {
      const result = await service.getImagesByDeviceUuid(TEST_DEVICE_UUID);
      expect(result).toEqual([mockImage]);
      expect(mockImageRepository.findAllByDeviceUuid).toHaveBeenCalledWith(TEST_DEVICE_UUID);
    });
  });

  describe('getImageByUuid', () => {
    it('should return a specific image by UUID', async () => {
      const result = await service.getImageByUuid(mockImage.uuid);
      expect(result).toEqual(mockImage);
      expect(mockImageRepository.findOneByUuid).toHaveBeenCalledWith(mockImage.uuid);
    });
  });

  describe('inspectImage', () => {
    it('should return detailed information about an image', async () => {
      const result = await service.inspectImage(mockImage.uuid);
      
      expect(mockImageRepository.findOneByUuid).toHaveBeenCalledWith(mockImage.uuid);
      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.getImage).toHaveBeenCalledWith(mockImage.id);
      expect(result).toHaveProperty('id', 'image-id');
    });

    it('should throw an error if image not found', async () => {
      mockImageRepository.findOneByUuid.mockResolvedValueOnce(null);
      
      await expect(service.inspectImage(mockImage.uuid)).rejects.toThrow(NotFoundException);
    });
  });

  describe('pullImage', () => {
    it('should pull an image on a device', async () => {
      const name = 'nginx';
      const tag = 'latest';
      
      const result = await service.pullImage(TEST_DEVICE_UUID, name, tag);
      
      expect(mockDevicesService.findByUuid).toHaveBeenCalledWith(TEST_DEVICE_UUID);
      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.pullImage).toHaveBeenCalledWith(name, tag);
      expect(mockImageRepository.findByNameAndTag).toHaveBeenCalledWith(name, tag, TEST_DEVICE_UUID);
      expect(mockImageRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('uuid');
      expect(result).toHaveProperty('deviceUuid', TEST_DEVICE_UUID);
    });

    it('should update existing image if it already exists', async () => {
      mockImageRepository.findByNameAndTag.mockResolvedValueOnce([mockImage]);
      
      const name = 'nginx';
      const tag = 'latest';
      
      const result = await service.pullImage(TEST_DEVICE_UUID, name, tag);
      
      expect(mockImageRepository.update).toHaveBeenCalled();
      expect(result).toHaveProperty('uuid', mockImage.uuid);
    });
  });

  describe('removeImage', () => {
    it('should remove an image', async () => {
      const result = await service.removeImage(mockImage.uuid);
      
      expect(mockImageRepository.findOneByUuid).toHaveBeenCalledWith(mockImage.uuid);
      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.removeImage).toHaveBeenCalledWith(mockImage.id, false);
      expect(mockImageRepository.deleteByUuid).toHaveBeenCalledWith(mockImage.uuid);
      expect(result).toBe(true);
    });
  });

  describe('buildImage', () => {
    it('should build an image from a Dockerfile', async () => {
      // Mock file system
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      const dockerfile = 'FROM nginx';
      const name = 'custom-image';
      const tag = 'v1.0';
      const buildContext = '/tmp/build';
      const buildArgs = { VERSION: '1.0' };
      
      const result = await service.buildImage(TEST_DEVICE_UUID, dockerfile, name, tag, buildContext, buildArgs);
      
      expect(fs.existsSync).toHaveBeenCalledWith(buildContext);
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.buildImage).toHaveBeenCalledWith(buildContext, {
        t: `${name}:${tag}`,
        buildargs: buildArgs,
      });
      expect(mockImageRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('uuid');
      expect(result).toHaveProperty('name', name);
      expect(result).toHaveProperty('tag', tag);
    });
  });

  describe('tagImage', () => {
    it('should tag an image with a new name/tag', async () => {
      // Mock list images to return the newly tagged image
      mockDockerWatcherComponent.listImages.mockResolvedValueOnce([{
        id: 'tagged-image-id',
        name: 'new-name',
        tag: 'new-tag',
        size: 10000000,
      }]);
      
      const newName = 'new-name';
      const newTag = 'new-tag';
      
      const result = await service.tagImage(mockImage.uuid, newName, newTag);
      
      expect(mockImageRepository.findOneByUuid).toHaveBeenCalledWith(mockImage.uuid);
      expect(mockDockerWatcherComponent.tagImage).toHaveBeenCalledWith(mockImage.id, newName, newTag);
      expect(mockDockerWatcherComponent.listImages).toHaveBeenCalled();
      expect(mockImageRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('uuid');
      expect(result).toHaveProperty('name', newName);
      expect(result).toHaveProperty('tag', newTag);
    });
  });

  describe('pushImage', () => {
    it('should push an image to a registry', async () => {
      const result = await service.pushImage(mockImage.uuid);
      
      expect(mockImageRepository.findOneByUuid).toHaveBeenCalledWith(mockImage.uuid);
      expect(mockDockerWatcherComponent.pushImage).toHaveBeenCalledWith(mockImage.name, mockImage.tag, undefined);
      expect(result).toBe(true);
    });
  });

  describe('pruneImages', () => {
    it('should prune unused images on a device', async () => {
      const result = await service.pruneImages(TEST_DEVICE_UUID);
      
      expect(mockDevicesService.findByUuid).toHaveBeenCalledWith(TEST_DEVICE_UUID);
      expect(mockWatcherEngineService.findRegisteredDockerComponent).toHaveBeenCalled();
      expect(mockDockerWatcherComponent.pruneImages).toHaveBeenCalled();
      expect(result).toEqual({ count: 3, spaceReclaimed: 25000000 });
    });
  });
});