import { Inject, Injectable, Logger } from '@nestjs/common';
import { SsmAnsible } from 'ssm-shared-lib';
import { IDockerDeviceService } from '../../domain/services/docker-device-service.interface';
import { DEVICE_AUTH_SERVICE } from '../../domain/services/device-auth-service.interface';
import { IDeviceAuthService } from '../../domain/services/device-auth-service.interface';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device-repository.interface';
import { IDeviceRepository } from '../../domain/repositories/device-repository.interface';
import { IDevice } from '../../domain/entities/device.entity';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';

@Injectable()
export class DockerDeviceService implements IDockerDeviceService {
  private readonly logger = new Logger(DockerDeviceService.name);

  constructor(
    @Inject(DEVICE_AUTH_SERVICE)
    private readonly deviceAuthService: IDeviceAuthService,
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async updateDockerAuth(
    deviceAuth: IDeviceAuth,
    updates: {
      customDockerSSH?: boolean;
      dockerCustomAuthType?: SsmAnsible.SSHType;
      dockerCustomSshUser?: string;
      dockerCustomSshPwd?: string;
      dockerCustomSshKey?: string;
      dockerCustomSshKeyPass?: string;
      customDockerForcev6?: boolean;
      customDockerForcev4?: boolean;
      customDockerAgentForward?: boolean;
      customDockerTryKeyboard?: boolean;
      customDockerSocket?: string;
    },
  ): Promise<IDeviceAuth> {
    const updatedDeviceAuth = {
      ...deviceAuth,
      customDockerSSH: updates.customDockerSSH ?? deviceAuth.customDockerSSH,
      dockerCustomAuthType: updates.dockerCustomAuthType ?? deviceAuth.dockerCustomAuthType,
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

    return this.deviceAuthService.updateDeviceAuth(updatedDeviceAuth);
  }

  async getDockerDevicesToWatch(): Promise<IDevice[]> {
    return (
      (await this.deviceRepository.findAll())?.filter(
        (device) =>
          device.capabilities?.containers?.docker?.enabled &&
          device.configuration?.containers?.docker?.watchContainers,
      ) || []
    );
  }
}
