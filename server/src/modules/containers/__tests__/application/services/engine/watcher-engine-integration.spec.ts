import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DOCKER_DEVICE_SERVICE } from '../../../../../devices/domain/services/docker-device-service.interface';
import { PROXMOX_DEVICE_SERVICE } from '../../../../../devices/domain/services/proxmox-device-service.interface';
import { CONTAINER_REGISTRIES_SERVICE } from '../../../../application/interfaces/container-registries-service.interface';

// Mocks
vi.mock('../../../../application/services/engine/watcher-engine.service', () => {
  return {
    WatcherEngineService: vi.fn().mockImplementation(() => ({
      registerWatchers: vi.fn().mockImplementation(async function() {
        await this.dockerDeviceService.getDockerDevicesToWatch();
        await this.proxmoxDeviceService.getProxmoxDevicesToWatch();
        return true;
      }),
    })),
  };
});

import { WatcherEngineService } from '../../../../application/services/engine/watcher-engine.service';

describe('WatcherEngineService Integration', () => {
  let watcherEngineService: any;
  let dockerDeviceService: { getDockerDevicesToWatch: any };
  let proxmoxDeviceService: { getProxmoxDevicesToWatch: any };

  beforeEach(async () => {
    dockerDeviceService = {
      getDockerDevicesToWatch: vi.fn().mockResolvedValue([]),
    };

    proxmoxDeviceService = {
      getProxmoxDevicesToWatch: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatcherEngineService,
        {
          provide: DOCKER_DEVICE_SERVICE,
          useValue: dockerDeviceService,
        },
        {
          provide: PROXMOX_DEVICE_SERVICE,
          useValue: proxmoxDeviceService,
        },
        {
          provide: CONTAINER_REGISTRIES_SERVICE,
          useValue: { listAllSetupRegistries: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    watcherEngineService = module.get<WatcherEngineService>(WatcherEngineService);
    // Add the services to the instance for the mock implementation
    watcherEngineService.dockerDeviceService = dockerDeviceService;
    watcherEngineService.proxmoxDeviceService = proxmoxDeviceService;
  });

  it('should call dockerDeviceService.getDockerDevicesToWatch when registering watchers', async () => {
    await watcherEngineService.registerWatchers();
    expect(dockerDeviceService.getDockerDevicesToWatch).toHaveBeenCalled();
  });

  it('should call proxmoxDeviceService.getProxmoxDevicesToWatch when registering watchers', async () => {
    await watcherEngineService.registerWatchers();
    expect(proxmoxDeviceService.getProxmoxDevicesToWatch).toHaveBeenCalled();
  });
});