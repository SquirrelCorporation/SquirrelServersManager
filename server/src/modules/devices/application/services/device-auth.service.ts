import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmAnsible } from 'ssm-shared-lib';
import { IDeviceAuthService } from '../../domain/services/device-auth-service.interface';
import { DEVICE_AUTH_REPOSITORY } from '../../domain/repositories/device-auth-repository.interface';
import { IDeviceAuthRepository } from '../../domain/repositories/device-auth-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';

@Injectable()
export class DeviceAuthService implements IDeviceAuthService {
  private readonly logger = new Logger(DeviceAuthService.name);
  
  constructor(
    @Inject(DEVICE_AUTH_REPOSITORY)
    private readonly deviceAuthRepository: IDeviceAuthRepository,
  ) {}

  async findDeviceAuthByDevice(device: IDevice): Promise<IDeviceAuth | null> {
    return this.deviceAuthRepository.findOneByDevice(device);
  }

  async findDeviceAuthByDeviceUuid(uuid: string): Promise<IDeviceAuth[] | null> {
    const res = await this.deviceAuthRepository.findOneByDeviceUuid(uuid);
    return res;
  }

  async updateOrCreateDeviceAuth(deviceAuth: Partial<IDeviceAuth>): Promise<IDeviceAuth> {
    return this.deviceAuthRepository.updateOrCreateIfNotExist(deviceAuth as IDeviceAuth);
  }

  async updateDeviceAuth(
    deviceAuth: IDeviceAuth,
    updates?: {
      authType?: SsmAnsible.SSHType;
      sshUser?: string;
      sshPwd?: string;
      sshKey?: string;
      sshKeyPass?: string;
      becomeMethod?: SsmAnsible.AnsibleBecomeMethod;
      becomeUser?: string;
      becomePass?: string;
    }
  ): Promise<IDeviceAuth> {
    let updatedDeviceAuth = deviceAuth;

    if (updates) {
      const { becomeMethod, ...restUpdates } = updates;

      updatedDeviceAuth = {
        ...deviceAuth,
        ...restUpdates,
        // Keep the original authType from device auth
        authType: deviceAuth.authType,
        // Handle becomeMethod properly
        ...(becomeMethod !== undefined && { becomeMethod }),
      };
    }

    const result = await this.deviceAuthRepository.update(updatedDeviceAuth);
    if (!result) {
      throw new Error(`Failed to update device auth for device: ${deviceAuth.device}`);
    }
    return result;
  }

  async deleteDeviceAuthByDevice(device: IDevice): Promise<void> {
    await this.deviceAuthRepository.deleteByDevice(device);
  }

  async deleteDeviceAuthCa(deviceAuth: IDeviceAuth): Promise<void> {
    await this.deviceAuthRepository.deleteCa(deviceAuth);
  }

  async deleteDeviceAuthCert(deviceAuth: IDeviceAuth): Promise<void> {
    await this.deviceAuthRepository.deleteCert(deviceAuth);
  }

  async deleteDeviceAuthKey(deviceAuth: IDeviceAuth): Promise<void> {
    await this.deviceAuthRepository.deleteKey(deviceAuth);
  }
}