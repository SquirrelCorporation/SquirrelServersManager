import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmAnsible, SsmStatus } from 'ssm-shared-lib';
import { CreateDeviceDto } from '@modules/devices/presentation/dtos/device.dto';
import { DEVICE_AUTH_REPOSITORY } from '@modules/devices/domain/repositories/device-auth-repository.interface';
import { IDeviceAuthRepository } from '@modules/devices/domain/repositories/device-auth-repository.interface';
import { DEFAULT_VAULT_ID, VAULT_CRYPTO_SERVICE } from '@modules/ansible-vaults';
import { IVaultCryptoService } from '@modules/ansible-vaults';
import Events from 'src/core/events/events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IDevice } from '../../domain/entities/device.entity';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device-repository.interface';
import { IDevicesService } from '../../domain/services/devices-service.interface';

/**
 * Implementation of the devices service
 */
@Injectable()
export class DevicesService implements IDevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
    @Inject(DEVICE_AUTH_REPOSITORY)
    private readonly deviceAuthRepository: IDeviceAuthRepository,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultService: IVaultCryptoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<IDevice> {
    const isUnManagedDevice = createDeviceDto?.unManaged === true;
    const device = await this.deviceRepository.create({
      ip: createDeviceDto.ip,
      status: isUnManagedDevice
        ? SsmStatus.DeviceStatus.UNMANAGED
        : SsmStatus.DeviceStatus.REGISTERING,
      agentType: createDeviceDto.installMethod,
    });
    await this.deviceAuthRepository.create({
      device: device._id,
      authType: createDeviceDto.authType,
      sshUser: createDeviceDto.sshUser,
      sshPwd: createDeviceDto.sshPwd
        ? await this.vaultService.encrypt(createDeviceDto.sshPwd, DEFAULT_VAULT_ID)
        : undefined,
      sshPort: createDeviceDto.sshPort,
      sshKey: createDeviceDto.sshKey
        ? await this.vaultService.encrypt(createDeviceDto.sshKey, DEFAULT_VAULT_ID)
        : undefined,
      sshKeyPass: createDeviceDto.sshKeyPass
        ? await this.vaultService.encrypt(createDeviceDto.sshKeyPass, DEFAULT_VAULT_ID)
        : undefined,
      becomeMethod: createDeviceDto.becomeMethod as SsmAnsible.AnsibleBecomeMethod,
      becomeUser: createDeviceDto.becomeUser,
      becomePass: createDeviceDto.becomePass
        ? await this.vaultService.encrypt(createDeviceDto.becomePass, DEFAULT_VAULT_ID)
        : undefined,
    });
    this.logger.log(`Device ${device.uuid} created`);
    this.eventEmitter.emit(Events.DEVICE_CREATED, { device });
    return device;
  }

  async update(device: IDevice): Promise<IDevice | null> {
    return this.deviceRepository.update(device);
  }

  async findOneByUuid(uuid: string): Promise<IDevice | null> {
    if (!uuid) {
      this.logger.warn('Service: Missing UUID in findOneByUuid call');
      return null;
    }
    try {
      const device = await this.deviceRepository.findOneByUuid(uuid);
      return device;
    } catch (error) {
      this.logger.error(
        `Service: Error in findOneByUuid for UUID ${uuid}: ${error}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findByUuids(uuids: string[]): Promise<IDevice[] | null> {
    return this.deviceRepository.findByUuids(uuids);
  }

  async findOneByIp(ip: string): Promise<IDevice | null> {
    return this.deviceRepository.findOneByIp(ip);
  }

  async findAll(): Promise<IDevice[] | null> {
    this.logger.log(`Service: Getting all devices`);
    try {
      const devices = await this.deviceRepository.findAll();
      return devices;
    } catch (error: any) {
      this.logger.error(error, `Service: Error in findAll: ${error.message}`);
      throw error;
    }
  }

  async setDeviceOfflineAfter(inactivityInMinutes: number): Promise<void> {
    await this.deviceRepository.setDeviceOfflineAfter(inactivityInMinutes);
  }

  async deleteByUuid(uuid: string): Promise<void> {
    await this.deviceRepository.deleteByUuid(uuid);
  }

  async findWithFilter(filter: Record<string, unknown>): Promise<IDevice[] | null> {
    return this.deviceRepository.findWithFilter(filter);
  }

  async getDevicesOverview(): Promise<{
    online?: number;
    offline?: number;
    totalCpu?: number;
    totalMem?: number;
    overview?: any;
  }> {
    const devices = await this.findAll();
    const offline = devices?.filter((e) => e.status === SsmStatus.DeviceStatus.OFFLINE).length;
    const online = devices?.filter((e) => e.status === SsmStatus.DeviceStatus.ONLINE).length;
    const overview = devices?.map((e) => {
      return {
        name: e.status !== SsmStatus.DeviceStatus.UNMANAGED ? e.fqdn : e.ip,
        status: e.status,
        uuid: e.uuid,
        cpu: e.systemInformation?.cpu?.speed || 0,
        mem: e.systemInformation?.mem?.total || 0,
      };
    });

    const totalCpu = devices?.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue?.systemInformation?.cpu?.speed || 0);
    }, 0);

    const totalMem = devices?.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue?.systemInformation?.mem?.total || 0);
    }, 0);

    return {
      offline: offline,
      online: online,
      overview: overview,
      totalCpu: totalCpu ? totalCpu : NaN,
      totalMem: totalMem ? totalMem : NaN,
    };
  }
}
