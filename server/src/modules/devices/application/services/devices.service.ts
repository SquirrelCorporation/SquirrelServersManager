import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmStatus } from 'ssm-shared-lib';
import { IDevicesService } from '../../domain/services/devices-service.interface';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device-repository.interface';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';

/**
 * Implementation of the devices service
 */
@Injectable()
export class DevicesService implements IDevicesService {
  private readonly logger = new Logger(DevicesService.name);
  
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
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
  
  async findByUuids(uuids: string[]): Promise<IDevice[] | null> {
    return this.deviceRepository.findByUuids(uuids);
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