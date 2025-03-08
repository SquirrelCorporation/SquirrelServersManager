import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { SsmAnsible } from 'ssm-shared-lib';
import { DevicesService } from '../../../application/services/devices.service';
import { DEVICE_REPOSITORY } from '../../../domain/repositories/device-repository.interface';
import { DEVICE_AUTH_REPOSITORY } from '../../../domain/repositories/device-auth-repository.interface';
import { IDevice } from '../../../domain/entities/device.entity';
import { IDeviceAuth } from '../../../domain/entities/device-auth.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  let deviceRepository: any;
  let deviceAuthRepository: any;

  // Mock data
  const mockDevice: IDevice = {
    _id: '615f5f4e8f5bca001c8ae123',
    uuid: '12345678-1234-1234-1234-123456789012',
    status: 1,
    systemInformation: {},
    capabilities: {
      containers: {}
    },
    configuration: {
      containers: {}
    }
  } as IDevice;

  const mockDeviceAuth: IDeviceAuth = {
    _id: '615f5f4e8f5bca001c8ae456',
    device: mockDevice,
    authType: SsmAnsible.SSHType.UserPassword,
    username: 'testuser',
    sshPwd: 'password123',
    host: 'localhost',
    port: '22'
  } as IDeviceAuth;

  const mockDeviceAuthWithBecomeMethod: Partial<IDeviceAuth> = {
    authType: SsmAnsible.SSHType.UserPassword,
    username: 'testuser',
    sshPwd: 'password123',
    host: 'localhost',
    port: '22',
    becomeMethod: 'sudo' as any // String value that needs to be converted to enum
  };

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
    };

    deviceAuthRepository = {
      findOneByDevice: vi.fn(),
      findOneByDeviceUuid: vi.fn(),
      updateOrCreateIfNotExist: vi.fn(),
      update: vi.fn(),
      deleteByDevice: vi.fn(),
      deleteCa: vi.fn(),
      deleteCert: vi.fn(),
      deleteKey: vi.fn(),
      findAllPop: vi.fn(),
      findAllPopWithSshKey: vi.fn(),
      findManyByDevicesUuid: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: DEVICE_REPOSITORY,
          useValue: deviceRepository,
        },
        {
          provide: DEVICE_AUTH_REPOSITORY,
          useValue: deviceAuthRepository,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  describe('createOrUpdateDeviceAuth', () => {
    it('should throw error if device not found', async () => {
      deviceRepository.findOneByUuid.mockResolvedValue(null);

      await expect(
        service.createOrUpdateDeviceAuth(mockDeviceAuthWithBecomeMethod, 'non-existent-uuid')
      ).rejects.toThrow('Device with UUID non-existent-uuid not found');

      expect(deviceRepository.findOneByUuid).toBeCalledWith('non-existent-uuid');
    });

    it('should transform becomeMethod string to enum and call updateOrCreateDeviceAuth', async () => {
      deviceRepository.findOneByUuid.mockResolvedValue(mockDevice);
      deviceAuthRepository.updateOrCreateIfNotExist.mockResolvedValue(mockDeviceAuth);

      const result = await service.createOrUpdateDeviceAuth(
        mockDeviceAuthWithBecomeMethod,
        mockDevice.uuid
      );

      expect(deviceRepository.findOneByUuid).toBeCalledWith(mockDevice.uuid);
      expect(deviceAuthRepository.updateOrCreateIfNotExist).toBeCalledWith(
        expect.objectContaining({
          ...mockDeviceAuthWithBecomeMethod,
          device: mockDevice,
          becomeMethod: SsmAnsible.AnsibleBecomeMethod.SUDO // Should be converted to enum
        })
      );
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should handle case when becomeMethod is not provided', async () => {
      const deviceAuthWithoutBecomeMethod = { ...mockDeviceAuthWithBecomeMethod };
      delete deviceAuthWithoutBecomeMethod.becomeMethod;

      deviceRepository.findOneByUuid.mockResolvedValue(mockDevice);
      deviceAuthRepository.updateOrCreateIfNotExist.mockResolvedValue(mockDeviceAuth);

      const result = await service.createOrUpdateDeviceAuth(
        deviceAuthWithoutBecomeMethod,
        mockDevice.uuid
      );

      expect(deviceAuthRepository.updateOrCreateIfNotExist).toBeCalledWith(
        expect.objectContaining({
          ...deviceAuthWithoutBecomeMethod,
          device: mockDevice
        })
      );
      expect(deviceAuthRepository.updateOrCreateIfNotExist).toBeCalledWith(
        expect.not.objectContaining({
          becomeMethod: expect.anything()
        })
      );
      expect(result).toEqual(mockDeviceAuth);
    });
  });

  describe('updateExistingDeviceAuth', () => {
    it('should throw error if device not found', async () => {
      deviceRepository.findOneByUuid.mockResolvedValue(null);

      await expect(
        service.updateExistingDeviceAuth(mockDeviceAuthWithBecomeMethod, 'non-existent-uuid')
      ).rejects.toThrow('Device with UUID non-existent-uuid not found');

      expect(deviceRepository.findOneByUuid).toBeCalledWith('non-existent-uuid');
    });

    it('should throw error if device auth not found', async () => {
      deviceRepository.findOneByUuid.mockResolvedValue(mockDevice);
      deviceAuthRepository.findOneByDeviceUuid.mockResolvedValue([]);

      await expect(
        service.updateExistingDeviceAuth(mockDeviceAuthWithBecomeMethod, mockDevice.uuid)
      ).rejects.toThrow(`Device Auth for device with UUID ${mockDevice.uuid} not found`);

      expect(deviceRepository.findOneByUuid).toBeCalledWith(mockDevice.uuid);
      expect(deviceAuthRepository.findOneByDeviceUuid).toBeCalledWith(mockDevice.uuid);
    });

    it('should transform becomeMethod string to enum and call updateDeviceAuth', async () => {
      deviceRepository.findOneByUuid.mockResolvedValue(mockDevice);
      deviceAuthRepository.findOneByDeviceUuid.mockResolvedValue([mockDeviceAuth]);
      deviceAuthRepository.update.mockResolvedValue(mockDeviceAuth);

      const result = await service.updateExistingDeviceAuth(
        mockDeviceAuthWithBecomeMethod,
        mockDevice.uuid
      );

      expect(deviceRepository.findOneByUuid).toBeCalledWith(mockDevice.uuid);
      expect(deviceAuthRepository.findOneByDeviceUuid).toBeCalledWith(mockDevice.uuid);
      expect(deviceAuthRepository.update).toBeCalledWith(
        expect.objectContaining({
          ...mockDeviceAuth,
          ...mockDeviceAuthWithBecomeMethod,
          becomeMethod: SsmAnsible.AnsibleBecomeMethod.SUDO // Should be converted to enum
        })
      );
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should preserve existing becomeMethod if not provided in update', async () => {
      const existingDeviceAuth = {
        ...mockDeviceAuth,
        becomeMethod: SsmAnsible.AnsibleBecomeMethod.SU
      };

      const updateWithoutBecomeMethod = { ...mockDeviceAuthWithBecomeMethod };
      delete updateWithoutBecomeMethod.becomeMethod;

      deviceRepository.findOneByUuid.mockResolvedValue(mockDevice);
      deviceAuthRepository.findOneByDeviceUuid.mockResolvedValue([existingDeviceAuth]);
      deviceAuthRepository.update.mockResolvedValue(existingDeviceAuth);

      const result = await service.updateExistingDeviceAuth(
        updateWithoutBecomeMethod,
        mockDevice.uuid
      );

      expect(deviceAuthRepository.update).toBeCalledWith(
        expect.objectContaining({
          ...existingDeviceAuth,
          ...updateWithoutBecomeMethod,
          becomeMethod: SsmAnsible.AnsibleBecomeMethod.SU // Should preserve existing enum
        })
      );
      expect(result).toEqual(existingDeviceAuth);
    });
  });
});