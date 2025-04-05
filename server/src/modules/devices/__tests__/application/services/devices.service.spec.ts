import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { DevicesService } from '../../../application/services/devices.service';
import { DEVICE_REPOSITORY } from '../../../domain/repositories/device-repository.interface';
import { IDevice } from '../../../domain/entities/device.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  let deviceRepository: any;

  // Mock data
  const mockDevice: IDevice = {
    _id: '615f5f4e8f5bca001c8ae123',
    uuid: '12345678-1234-1234-1234-123456789012',
    status: 1,
    systemInformation: {},
    capabilities: {
      containers: {},
    },
    configuration: {
      containers: {},
    },
  } as IDevice;

  beforeEach(async () => {
    deviceRepository = {
      findOneByUuid: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      findWithFilter: vi.fn(),
      findOneByIp: vi.fn(),
      setDeviceOfflineAfter: vi.fn(),
      deleteByUuid: vi.fn(),
      findByUuids: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: DEVICE_REPOSITORY,
          useValue: deviceRepository,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  describe('create', () => {
    it('should create a device', async () => {
      deviceRepository.create.mockResolvedValue(mockDevice);
      const result = await service.create(mockDevice);
      expect(result).toEqual(mockDevice);
      expect(deviceRepository.create).toHaveBeenCalledWith(mockDevice);
    });
  });

  describe('update', () => {
    it('should update a device', async () => {
      deviceRepository.update.mockResolvedValue(mockDevice);
      const result = await service.update(mockDevice);
      expect(result).toEqual(mockDevice);
      expect(deviceRepository.update).toHaveBeenCalledWith(mockDevice);
    });
  });

  describe('findOneByUuid', () => {
    it('should find a device by UUID', async () => {
      deviceRepository.findOneByUuid.mockResolvedValue(mockDevice);
      const result = await service.findOneByUuid(mockDevice.uuid);
      expect(result).toEqual(mockDevice);
      expect(deviceRepository.findOneByUuid).toHaveBeenCalledWith(mockDevice.uuid);
    });
  });

  describe('findByUuids', () => {
    it('should find devices by UUIDs', async () => {
      const devices = [mockDevice];
      deviceRepository.findByUuids.mockResolvedValue(devices);
      const result = await service.findByUuids([mockDevice.uuid]);
      expect(result).toEqual(devices);
      expect(deviceRepository.findByUuids).toHaveBeenCalledWith([mockDevice.uuid]);
    });
  });

  describe('findOneByIp', () => {
    it('should find a device by IP', async () => {
      deviceRepository.findOneByIp.mockResolvedValue(mockDevice);
      const result = await service.findOneByIp('192.168.1.1');
      expect(result).toEqual(mockDevice);
      expect(deviceRepository.findOneByIp).toHaveBeenCalledWith('192.168.1.1');
    });
  });

  describe('findAll', () => {
    it('should find all devices', async () => {
      const devices = [mockDevice];
      deviceRepository.findAll.mockResolvedValue(devices);
      const result = await service.findAll();
      expect(result).toEqual(devices);
      expect(deviceRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('setDeviceOfflineAfter', () => {
    it('should set device offline after specified minutes', async () => {
      await service.setDeviceOfflineAfter(5);
      expect(deviceRepository.setDeviceOfflineAfter).toHaveBeenCalledWith(5);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete a device by UUID', async () => {
      await service.deleteByUuid(mockDevice.uuid);
      expect(deviceRepository.deleteByUuid).toHaveBeenCalledWith(mockDevice.uuid);
    });
  });

  describe('findWithFilter', () => {
    it('should find devices with filter', async () => {
      const filter = { status: 1 };
      const devices = [mockDevice];
      deviceRepository.findWithFilter.mockResolvedValue(devices);
      const result = await service.findWithFilter(filter);
      expect(result).toEqual(devices);
      expect(deviceRepository.findWithFilter).toHaveBeenCalledWith(filter);
    });
  });

  describe('getDevicesOverview', () => {
    it('should get devices overview', async () => {
      const devices = [
        {
          ...mockDevice,
          status: 1,
          systemInformation: {
            cpu: { speed: 2.4 },
            mem: { total: 8192 },
          },
        },
      ];
      deviceRepository.findAll.mockResolvedValue(devices);

      const result = await service.getDevicesOverview();

      expect(result).toEqual({
        offline: 0,
        online: 1,
        overview: [
          {
            name: mockDevice.ip,
            status: 1,
            uuid: mockDevice.uuid,
            cpu: 2.4,
            mem: 8192,
          },
        ],
        totalCpu: 2.4,
        totalMem: 8192,
      });
    });
  });
});
