import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { SsmAnsible } from 'ssm-shared-lib';
import { DeviceAuthService } from '../../../application/services/device-auth.service';
import { DEVICE_AUTH_REPOSITORY } from '../../../domain/repositories/device-auth-repository.interface';
import { IDevice } from '../../../domain/entities/device.entity';
import { IDeviceAuth } from '../../../domain/entities/device-auth.entity';

describe('DeviceAuthService', () => {
  let service: DeviceAuthService;
  let deviceAuthRepository: any;

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

  const mockDeviceAuth: IDeviceAuth = {
    _id: '615f5f4e8f5bca001c8ae456',
    device: mockDevice,
    authType: SsmAnsible.SSHType.UserPassword,
    sshUser: 'testuser',
    sshPwd: 'password123',
  } as IDeviceAuth;

  const mockDeviceAuthWithBecomeMethod: Partial<IDeviceAuth> = {
    authType: SsmAnsible.SSHType.UserPassword,
    sshUser: 'testuser',
    sshPwd: 'password123',
    sshPort: 22,
    becomeMethod: 'sudo' as any, // String value that needs to be converted to enum
  };

  beforeEach(async () => {
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
        DeviceAuthService,
        {
          provide: DEVICE_AUTH_REPOSITORY,
          useValue: deviceAuthRepository,
        },
      ],
    }).compile();

    service = module.get<DeviceAuthService>(DeviceAuthService);
  });

  describe('updateOrCreateDeviceAuth', () => {
    it('should transform becomeMethod string to enum and call updateOrCreateIfNotExist', async () => {
      deviceAuthRepository.updateOrCreateIfNotExist.mockResolvedValue(mockDeviceAuth);

      const result = await service.updateOrCreateDeviceAuth(mockDeviceAuthWithBecomeMethod);

      expect(deviceAuthRepository.updateOrCreateIfNotExist).toBeCalledWith(
        expect.objectContaining({
          ...mockDeviceAuthWithBecomeMethod,
          becomeMethod: SsmAnsible.AnsibleBecomeMethod.SUDO, // Should be converted to enum
        }),
      );
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should handle case when becomeMethod is not provided', async () => {
      const deviceAuthWithoutBecomeMethod = { ...mockDeviceAuthWithBecomeMethod };
      delete deviceAuthWithoutBecomeMethod.becomeMethod;

      deviceAuthRepository.updateOrCreateIfNotExist.mockResolvedValue(mockDeviceAuth);

      const result = await service.updateOrCreateDeviceAuth(deviceAuthWithoutBecomeMethod);

      expect(deviceAuthRepository.updateOrCreateIfNotExist).toBeCalledWith(
        expect.objectContaining({
          ...deviceAuthWithoutBecomeMethod,
        }),
      );
      expect(deviceAuthRepository.updateOrCreateIfNotExist).toBeCalledWith(
        expect.not.objectContaining({
          becomeMethod: expect.anything(),
        }),
      );
      expect(result).toEqual(mockDeviceAuth);
    });
  });

  describe('updateDeviceAuth', () => {
    it('should throw error if update fails', async () => {
      deviceAuthRepository.update.mockResolvedValue(null);

      await expect(service.updateDeviceAuth(mockDeviceAuth)).rejects.toThrow(
        `Failed to update device auth for device: ${mockDeviceAuth.device}`,
      );
    });

    it('should transform becomeMethod string to enum and call update', async () => {
      deviceAuthRepository.update.mockResolvedValue(mockDeviceAuth);

      const result = await service.updateDeviceAuth(mockDeviceAuth, {
        becomeMethod: 'sudo' as any,
      });

      expect(deviceAuthRepository.update).toBeCalledWith(
        expect.objectContaining({
          ...mockDeviceAuth,
          becomeMethod: SsmAnsible.AnsibleBecomeMethod.SUDO, // Should be converted to enum
        }),
      );
      expect(result).toEqual(mockDeviceAuth);
    });

    it('should preserve existing becomeMethod if not provided in update', async () => {
      const existingDeviceAuth = {
        ...mockDeviceAuth,
        becomeMethod: SsmAnsible.AnsibleBecomeMethod.SU,
      };

      deviceAuthRepository.update.mockResolvedValue(existingDeviceAuth);

      const result = await service.updateDeviceAuth(existingDeviceAuth, {
        sshUser: 'newuser',
      });

      expect(deviceAuthRepository.update).toBeCalledWith(
        expect.objectContaining({
          ...existingDeviceAuth,
          sshUser: 'newuser',
          becomeMethod: SsmAnsible.AnsibleBecomeMethod.SU, // Should preserve existing enum
        }),
      );
      expect(result).toEqual(existingDeviceAuth);
    });
  });
});
