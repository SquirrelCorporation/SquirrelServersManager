import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { DEVICE_REPOSITORY } from '../devices/domain/repositories/device-repository.interface';
import { DEVICE_AUTH_REPOSITORY } from '../devices/domain/repositories/device-auth-repository.interface';
import { SshConnectionService } from './application/services/ssh-connection.service';
import { SshTerminalService } from './application/services/ssh-terminal.service';
import { SshRepository } from './infrastructure/repositories/ssh.repository';
import { SshGateway } from './presentation/gateways/ssh.gateway';

@Module({
  imports: [DevicesModule],
  providers: [
    SshGateway,
    SshConnectionService,
    SshTerminalService,
    {
      provide: 'ISshRepository',
      useClass: SshRepository,
    },
    {
      provide: 'DeviceRepository',
      useExisting: DEVICE_REPOSITORY,
    },
    {
      provide: 'DeviceAuthRepository',
      useExisting: DEVICE_AUTH_REPOSITORY,
    },
  ],
  exports: [SshConnectionService, SshTerminalService],
})
export class SshModule {}