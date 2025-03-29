import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client } from 'ssh2';
import { NotFoundError } from '../../../middlewares/api/ApiError';
import { SSHCredentialsAdapter } from '../../adapters/ssh/ssh-credentials.adapter';
import { tryResolveHost } from '../../common/dns/dns.util';
import { IDevicesService, IDeviceAuthService } from '../../../modules/devices';

@Injectable()
export class SshConnectionService {
  private readonly logger = new Logger(SshConnectionService.name);

  constructor(
    @Inject('DeviceRepository') private readonly devicesService: IDevicesService,
    @Inject('DeviceAuthRepository') private readonly deviceAuthService: IDeviceAuthService
  ) {}

  /**
   * Fetches device and authentication information
   */
  async fetchDeviceAndAuth(deviceUuid: string) {
    const device = await this.devicesService.findOneByUuid(deviceUuid);
    if (!device) {
      this.logger.error(`Device ${deviceUuid} not found`);
      throw new NotFoundError(`Device ${deviceUuid} not found`);
    }

    const deviceAuth = await this.deviceAuthService.findDeviceAuthByDevice(device);
    if (!deviceAuth) {
      this.logger.error(`Authentication for device ${deviceUuid} not found`);
      throw new NotFoundError(`Authentication for device ${deviceUuid} not found`);
    }

    const host = device.ip as string;
    return { device, deviceAuth, host };
  }

  /**
   * Creates an SSH client and establishes a connection
   */
  async createConnection(ssh: Client, deviceUuid: string): Promise<{ host: string }> {
    const { device, deviceAuth, host } = await this.fetchDeviceAndAuth(deviceUuid);

    const sshHelper = new SSHCredentialsAdapter();
    const sshCredentials = await sshHelper.getSShConnection(device, deviceAuth);
    const connectConfig = {
      ...sshCredentials,
      host: await tryResolveHost(sshCredentials.host as string),
    };

    return new Promise((resolve, reject) => {
      ssh.on('ready', () => {
        this.logger.log(`SSH connection established to ${connectConfig.host}`);
        resolve({ host });
      });

      ssh.on('error', (err) => {
        this.logger.error(`SSH connection error to ${connectConfig.host}: ${err.message}`);
        reject(err);
      });

      try {
        ssh.connect(connectConfig);
      } catch (error: any) {
        this.logger.error(`Failed to connect to ${connectConfig.host}: ${error.message}`);
        reject(error);
      }
    });
  }

  /**
   * Closes an SSH connection
   */
  closeConnection(ssh: Client): void {
    try {
      if (ssh) {
        ssh.end();
      }
    } catch (error: any) {
      this.logger.error(`Error closing SSH connection: ${error.message}`);
    }
  }
}