import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmAnsible, SsmStatus } from 'ssm-shared-lib';
import { IDevicesService } from '../interfaces/devices-service.interface';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device-repository.interface';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { DEVICE_AUTH_REPOSITORY } from '../../domain/repositories/device-auth-repository.interface';
import { IDeviceAuthRepository } from '../../domain/repositories/device-auth-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';
import { UpdateDeviceAuthDto } from '../../presentation/dtos/device-auth.dto';
import { UpdateDockerAuthDto } from '../../presentation/dtos/update-docker-auth.dto';
import { UpdateProxmoxAuthDto } from '../../presentation/dtos/update-proxmox-auth.dto';

@Injectable()
export class DevicesService implements IDevicesService {
  private readonly logger = new Logger(DevicesService.name);
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
    const res = await this.deviceAuthRepository.findOneByDeviceUuid(uuid);
    return res;
  }

  async updateOrCreateDeviceAuth(deviceAuth: Partial<IDeviceAuth>): Promise<IDeviceAuth> {
    return this.deviceAuthRepository.updateOrCreateIfNotExist(deviceAuth as IDeviceAuth);
  }

  async updateDeviceAuth(
    deviceAuth: IDeviceAuth,
    updates?: UpdateDeviceAuthDto,
  ): Promise<IDeviceAuth> {
    let updatedDeviceAuth = deviceAuth;

    if (updates) {
      // Extract becomeMethod and handle type conversion
      const { becomeMethod, ...restDto } = updates;

      updatedDeviceAuth = {
        ...deviceAuth,
        ...restDto,
        // Keep the original authType from device auth
        authType: deviceAuth.authType,
        // Cast becomeMethod to the appropriate enum if it exists
        ...(becomeMethod && { becomeMethod: becomeMethod as SsmAnsible.AnsibleBecomeMethod }),
      };
    }

    const result = await this.deviceAuthRepository.update(updatedDeviceAuth);
    if (!result) {
      throw new Error(`Failed to update device auth for device: ${deviceAuth.device}`);
    }
    return result;
  }

  async updateDockerAuth(
    deviceAuth: IDeviceAuth,
    updates: UpdateDockerAuthDto,
  ): Promise<IDeviceAuth> {
    // Cast Docker auth type if needed
    const updatedDeviceAuth = {
      ...deviceAuth,
      customDockerSSH: updates.customDockerSSH ?? deviceAuth.customDockerSSH,
      dockerCustomAuthType:
        (updates.dockerCustomAuthType as unknown as SsmAnsible.SSHType) ??
        deviceAuth.dockerCustomAuthType,
      dockerCustomSshUser: updates.dockerCustomSshUser ?? deviceAuth.dockerCustomSshUser,
      dockerCustomSshPwd: updates.dockerCustomSshPwd ?? deviceAuth.dockerCustomSshPwd,
      dockerCustomSshKey: updates.dockerCustomSshKey ?? deviceAuth.dockerCustomSshKey,
      dockerCustomSshKeyPass: updates.dockerCustomSshKeyPass ?? deviceAuth.dockerCustomSshKeyPass,
      customDockerForcev6: updates.customDockerForcev6 ?? deviceAuth.customDockerForcev6,
      customDockerForcev4: updates.customDockerForcev4 ?? deviceAuth.customDockerForcev4,
      customDockerAgentForward:
        updates.customDockerAgentForward ?? deviceAuth.customDockerAgentForward,
      customDockerTryKeyboard:
        updates.customDockerTryKeyboard ?? deviceAuth.customDockerTryKeyboard,
      customDockerSocket: updates.customDockerSocket ?? deviceAuth.customDockerSocket,
    };

    return this.updateDeviceAuth(updatedDeviceAuth);
  }

  async updateProxmoxAuth(
    deviceAuth: IDeviceAuth,
    updates: UpdateProxmoxAuthDto,
  ): Promise<IDeviceAuth> {
    // Convert the connection methods to the proper types
    const proxmoxAuth = {
      ...(deviceAuth.proxmoxAuth || {}),
      remoteConnectionMethod:
        (updates.remoteConnectionMethod as any) ?? deviceAuth.proxmoxAuth?.remoteConnectionMethod,
      connectionMethod:
        (updates.connectionMethod as any) ?? deviceAuth.proxmoxAuth?.connectionMethod,
      port: updates.port ?? deviceAuth.proxmoxAuth?.port,
      ignoreSslErrors: updates.ignoreSslErrors ?? deviceAuth.proxmoxAuth?.ignoreSslErrors,
      tokens: {
        tokenId: updates.tokens?.tokenId ?? deviceAuth.proxmoxAuth?.tokens?.tokenId,
        tokenSecret: updates.tokens?.tokenSecret ?? deviceAuth.proxmoxAuth?.tokens?.tokenSecret,
      },
      userPwd: {
        username: updates.userPwd?.username ?? deviceAuth.proxmoxAuth?.userPwd?.username,
        password: updates.userPwd?.password ?? deviceAuth.proxmoxAuth?.userPwd?.password,
      },
    };

    const updatedDeviceAuth = {
      ...deviceAuth,
      proxmoxAuth,
    };

    return this.updateDeviceAuth(updatedDeviceAuth);
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
          device.configuration?.containers?.docker?.watchContainers,
      ) || []
    );
  }

  async getProxmoxDevicesToWatch(): Promise<IDevice[]> {
    return (
      (await this.deviceRepository.findAll())?.filter(
        (device) => device.capabilities?.containers?.proxmox?.enabled,
      ) || []
    );
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
