import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DevicesService } from '../../../application/services/devices.service';
import { DeviceAuthService } from '../../../application/services/device-auth.service';
import { DockerDeviceService } from '../../../application/services/docker-device.service';
import { ProxmoxDeviceService } from '../../../application/services/proxmox-device.service';
import { DEVICE_REPOSITORY } from '../../../domain/repositories/device-repository.interface';
import { DEVICE_AUTH_REPOSITORY } from '../../../domain/repositories/device-auth-repository.interface';
import { DEVICE_AUTH_SERVICE } from '../../../domain/services/device-auth-service.interface';

describe('Device Services Structure', () => {
  let devicesService: DevicesService;
  let deviceAuthService: DeviceAuthService;
  let dockerDeviceService: DockerDeviceService;
  let proxmoxDeviceService: ProxmoxDeviceService;

  const mockDeviceRepository = {
    findAll: vi.fn(),
    findOneByUuid: vi.fn(),
    findOneByIp: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteByUuid: vi.fn(),
    findWithFilter: vi.fn(),
    setDeviceOfflineAfter: vi.fn(),
  };

  const mockDeviceAuthRepository = {
    findOneByDevice: vi.fn(),
    findOneByDeviceUuid: vi.fn(),
    updateOrCreateIfNotExist: vi.fn(),
    update: vi.fn(),
    deleteByDevice: vi.fn(),
    deleteCa: vi.fn(),
    deleteCert: vi.fn(),
    deleteKey: vi.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DevicesService,
        DeviceAuthService,
        DockerDeviceService,
        ProxmoxDeviceService,
        {
          provide: DEVICE_REPOSITORY,
          useValue: mockDeviceRepository,
        },
        {
          provide: DEVICE_AUTH_REPOSITORY,
          useValue: mockDeviceAuthRepository,
        },
        {
          provide: DEVICE_AUTH_SERVICE,
          useExisting: DeviceAuthService,
        },
      ],
    }).compile();

    devicesService = moduleRef.get<DevicesService>(DevicesService);
    deviceAuthService = moduleRef.get<DeviceAuthService>(DeviceAuthService);
    dockerDeviceService = moduleRef.get<DockerDeviceService>(DockerDeviceService);
    proxmoxDeviceService = moduleRef.get<ProxmoxDeviceService>(ProxmoxDeviceService);
  });

  it('DevicesService should be defined', () => {
    expect(devicesService).toBeDefined();
  });

  it('DeviceAuthService should be defined', () => {
    expect(deviceAuthService).toBeDefined();
  });

  it('DockerDeviceService should be defined', () => {
    expect(dockerDeviceService).toBeDefined();
  });

  it('ProxmoxDeviceService should be defined', () => {
    expect(proxmoxDeviceService).toBeDefined();
  });

  it('DevicesService should have findAll method', () => {
    expect(devicesService.findAll).toBeDefined();
  });

  it('DeviceAuthService should have updateDeviceAuth method', () => {
    expect(deviceAuthService.updateDeviceAuth).toBeDefined();
  });

  it('DockerDeviceService should have updateDockerAuth method', () => {
    expect(dockerDeviceService.updateDockerAuth).toBeDefined();
  });

  it('ProxmoxDeviceService should have updateProxmoxAuth method', () => {
    expect(proxmoxDeviceService.updateProxmoxAuth).toBeDefined();
  });
});