import { Inject, Injectable } from '@nestjs/common';
import { SsmAnsible } from 'ssm-shared-lib';
import { IDevicesService } from '../interfaces/devices-service.interface';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device-repository.interface';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { DEVICE_AUTH_REPOSITORY } from '../../domain/repositories/device-auth-repository.interface';
import { IDeviceAuthRepository } from '../../domain/repositories/device-auth-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';

@Injectable()
export class DevicesService implements IDevicesService {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
    @Inject(DEVICE_AUTH_REPOSITORY)
    private readonly deviceAuthRepository: IDeviceAuthRepository,
  ) {}

  async create(device: IDevice): Promise<IDevice> {
    return this.deviceRepository.create(device);
  }

  async update(device: IDevice): Promise<IDevice | null> {
    return this.deviceRepository.update(device);
  }

  async findOneByUuid(uuid: string): Promise<IDevice | null> {
    return this.deviceRepository.findOneByUuid(uuid);
  }

  async findOneByIp(ip: string): Promise<IDevice | null> {
    return this.deviceRepository.findOneByIp(ip);
  }

  async findAll(): Promise<IDevice[] | null> {
    return this.deviceRepository.findAll();
  }

  async setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void> {
    await this.deviceRepository.setDeviceOfflineAfter(inactivityInMinutes);
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.deviceRepository.deleteByUuid(uuid);
  }

  async findWithFilter(filter: any): Promise<IDevice[] | null> {
    return this.deviceRepository.findWithFilter(filter);
  }

  // DEVICE AUTH METHODS
  async findDeviceAuthByDevice(device: IDevice): Promise<IDeviceAuth | null> {
    return this.deviceAuthRepository.findOneByDevice(device);
  }

  async findDeviceAuthByDeviceUuid(uuid: string): Promise<IDeviceAuth[] | null> {
    return this.deviceAuthRepository.findOneByDeviceUuid(uuid);
  }

  async updateOrCreateDeviceAuth(deviceAuth: Partial<IDeviceAuth>): Promise<IDeviceAuth> {
    return this.deviceAuthRepository.updateOrCreateIfNotExist(deviceAuth as IDeviceAuth);
  }

  async updateDeviceAuth(deviceAuth: IDeviceAuth): Promise<IDeviceAuth> {
    const result = await this.deviceAuthRepository.update(deviceAuth);
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

  // Docker and Proxmox device retrieval methods for monitoring
  async getDockerDevicesToWatch(): Promise<IDevice[]> {
    return (
      (await this.deviceRepository.findAll())?.filter(
        (device) =>
          device.capabilities?.containers?.docker?.enabled &&
          device.configuration?.containers?.docker?.watchContainers
      ) || []
    );
  }

  async getProxmoxDevicesToWatch(): Promise<IDevice[]> {
    return (
      (await this.deviceRepository.findAll())?.filter(
        (device) => device.capabilities?.containers?.proxmox?.enabled
      ) || []
    );
  }

  // Updated method to handle type transformations internally
  async createOrUpdateDeviceAuth(deviceAuth: Partial<IDeviceAuth>, deviceUuid: string): Promise<IDeviceAuth> {
    const device = await this.findOneByUuid(deviceUuid);
    if (!device) {
      throw new Error(`Device with UUID ${deviceUuid} not found`);
    }

    // Extract becomeMethod and handle type conversion
    const { becomeMethod, ...restDto } = deviceAuth;

    const transformedAuth = {
      ...restDto,
      device,
      ...(becomeMethod && { becomeMethod: becomeMethod as SsmAnsible.AnsibleBecomeMethod })
    };

    return this.updateOrCreateDeviceAuth(transformedAuth);
  }

  // Updated method to handle type transformations internally
  async updateExistingDeviceAuth(deviceAuthUpdates: Partial<IDeviceAuth>, deviceUuid: string): Promise<IDeviceAuth> {
    const device = await this.findOneByUuid(deviceUuid);
    if (!device) {
      throw new Error(`Device with UUID ${deviceUuid} not found`);
    }

    const deviceAuthList = await this.findDeviceAuthByDeviceUuid(deviceUuid);
    if (!deviceAuthList || deviceAuthList.length === 0) {
      throw new Error(`Device Auth for device with UUID ${deviceUuid} not found`);
    }

    const existingDeviceAuth = deviceAuthList[0];

    // Extract becomeMethod and handle type conversion
    const { becomeMethod, ...restDto } = deviceAuthUpdates;

    const transformedAuth = {
      ...existingDeviceAuth,
      ...restDto,
      ...(becomeMethod && { becomeMethod: becomeMethod as SsmAnsible.AnsibleBecomeMethod })
    };

    return this.updateDeviceAuth(transformedAuth);
  }
}