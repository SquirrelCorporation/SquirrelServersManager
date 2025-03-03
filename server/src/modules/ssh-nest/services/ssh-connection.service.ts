import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'ssh2';
import DeviceAuthRepo from '../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { tryResolveHost } from '../../../helpers/dns/dns-helper';
import SSHCredentialsHelper from '../../../helpers/ssh/SSHCredentialsHelper';
import { NotFoundError } from '../../../middlewares/api/ApiError';

@Injectable()
export class SshConnectionService {
  private readonly logger = new Logger(SshConnectionService.name);

  /**
   * Fetches device and authentication information
   */
  async fetchDeviceAndAuth(deviceUuid: string) {
    const device = await DeviceRepo.findOneByUuid(deviceUuid);
    if (!device) {
      this.logger.error(`Device ${deviceUuid} not found`);
      throw new NotFoundError(`Device ${deviceUuid} not found`);
    }

    const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
    if (!deviceAuth) {
      this.logger.error(`Device Auth for ${deviceUuid} not found`);
      throw new NotFoundError(`Device Auth for ${deviceUuid} not found`);
    }

    const host = device.ip as string;
    return { device, deviceAuth, host };
  }

  /**
   * Creates an SSH client and establishes a connection
   */
  async createConnection(deviceUuid: string): Promise<{ ssh: Client; host: string }> {
    const { device, deviceAuth, host } = await this.fetchDeviceAndAuth(deviceUuid);

    const sshCredentials = await SSHCredentialsHelper.getSShConnection(device, deviceAuth);
    const connectConfig = {
      ...sshCredentials,
      host: await tryResolveHost(sshCredentials.host as string),
    };

    return new Promise((resolve, reject) => {
      const ssh = new Client();

      ssh.on('ready', () => {
        this.logger.log(`SSH connection established to ${connectConfig.host}`);
        resolve({ ssh, host });
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
