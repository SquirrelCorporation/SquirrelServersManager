import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmProxmox } from 'ssm-shared-lib';
import { IProxmoxDeviceService } from '../../domain/services/proxmox-device-service.interface';
import { DEVICE_AUTH_SERVICE } from '../../domain/services/device-auth-service.interface';
import { IDeviceAuthService } from '../../domain/services/device-auth-service.interface';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device-repository.interface';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';

@Injectable()
export class ProxmoxDeviceService implements IProxmoxDeviceService {
  private readonly logger = new Logger(ProxmoxDeviceService.name);

  constructor(
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async updateProxmoxAuth(
    deviceAuth: IDeviceAuth,
    updates: {
      remoteConnectionMethod?: SsmProxmox.RemoteConnectionMethod;
      connectionMethod?: SsmProxmox.ConnectionMethod;
      port?: number;
      ignoreSslErrors?: boolean;
      tokens?: {
        tokenId?: string;
        tokenSecret?: string;
      };
      userPwd?: {
        username?: string;
        password?: string;
      };
    },
  ): Promise<IDeviceAuth> {
    // Ensure proxmoxAuth exists or create it with defaults
    const proxmoxAuth = {
      ...(deviceAuth.proxmoxAuth || {}),
      remoteConnectionMethod:
        updates.remoteConnectionMethod ?? deviceAuth.proxmoxAuth?.remoteConnectionMethod,
      connectionMethod: updates.connectionMethod ?? deviceAuth.proxmoxAuth?.connectionMethod,
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

    return this.deviceAuthService.updateDeviceAuth(updatedDeviceAuth);
  }

  async getProxmoxDevicesToWatch(): Promise<IDevice[]> {
    return (
      (await this.deviceRepository.findAll())?.filter(
        (device) => device.capabilities?.containers?.proxmox?.enabled,
      ) || []
    );
  }
}
