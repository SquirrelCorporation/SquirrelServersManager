import { SshInfrastructureModule } from '@infrastructure/ssh/ssh-infrastructure.module';
import { SshGateway } from '@modules/ssh/presentation/gateways/ssh.gateway';
import { Module } from '@nestjs/common';
import { WsAuthModule } from '@infrastructure/websocket-auth/ws-auth.module';
import { DevicesModule } from '../devices/devices.module';
import { SshTerminalService } from './application/services/ssh-terminal.service';

@Module({
  imports: [DevicesModule, SshInfrastructureModule, WsAuthModule],
  providers: [
    {
      provide: SshTerminalService,
      useClass: SshTerminalService,
    },
    {
      provide: SshGateway,
      useClass: SshGateway,
    },
  ],
  exports: [SshTerminalService],
})
export class SshModule {}
