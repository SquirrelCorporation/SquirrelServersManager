import { getCustomAgent } from '@infrastructure/adapters/ssh/custom-agent.adapter';
import { SSHCredentialsAdapter } from '@infrastructure/adapters/ssh/ssh-credentials.adapter';
import { CONTAINER_SERVICE } from '@modules/containers';
import { IContainerService } from '@modules/containers/domain/interfaces/container-service.interface';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import {
  DEVICE_AUTH_SERVICE,
  IDeviceAuthService,
} from '@modules/devices/domain/services/device-auth-service.interface';
import { Controller, Get, Inject, Logger, NotFoundException, Param } from '@nestjs/common';
import DockerModem from 'docker-modem';
import Dockerode from 'dockerode';
import PinoLogger from 'src/logger';

@Controller('containers/diagnostic')
export class ContainerDiagnosticController {
  private readonly logger = new Logger(ContainerDiagnosticController.name);

  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService, // Keep if needed for other methods, remove otherwise
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
  ) {}

  @Get('devices/:uuid')
  async checkDockerConnection(@Param('uuid') deviceUuid: string) {
    const device = await this.devicesService.findOneByUuid(deviceUuid);
    if (!device) {
      throw new NotFoundException(`Device with UUID ${deviceUuid} not found`);
    }
    const deviceAuthArray = await this.deviceAuthService.findDeviceAuthByDeviceUuid(deviceUuid);
    const deviceAuth = deviceAuthArray?.[0];
    if (!deviceAuth) {
      throw new NotFoundException(`Device auth for UUID ${deviceUuid} not found`);
    }

    try {
      const sshHelper = new SSHCredentialsAdapter();
      const options = await sshHelper.getDockerSshConnectionOptions(device, deviceAuth);

      // Use PinoLogger instance if needed, otherwise remove logger import
      const localLogger = PinoLogger.child({ module: 'DockerConnectionCheck' });

      const agent = getCustomAgent(localLogger, {
        debug: (message: any) => {
          this.logger.debug(message); // Use NestJS logger for consistency
        },
        ...options.sshOptions,
        timeout: 60000,
      });

      options.modem = new DockerModem({
        agent: agent,
      });

      const docker = new Dockerode({ ...options, timeout: 60000 });
      await docker.ping();
      // Optionally get docker info if needed
      // const info = await docker.info();
      return {
        connectionStatus: 'successful',
      };
    } catch (error: any) {
      this.logger.error(`Docker connection check failed for ${deviceUuid}: ${error.message}`);
      return {
        connectionStatus: 'failed',
        errorMessage: error.message,
      };
    }
  }
}
