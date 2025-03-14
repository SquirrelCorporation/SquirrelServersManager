import { Global, Logger, Module } from '@nestjs/common';
import { SshInfrastructureModule } from '@infrastructure/ssh/ssh-infrastructure.module';
import { DevicesModule } from '../devices/devices.module';
import { SshTerminalService } from './application/services/ssh-terminal.service';
import { SshGateway } from './presentation/gateways/ssh.gateway';

@Module({
  imports: [
    DevicesModule,
    // Import the infrastructure module to get SshConnectionService
    // This helps ensure it's only instantiated once
    SshInfrastructureModule,
  ],
  providers: [
    SshGateway, // The WebSocket gateway for SSH
    SshTerminalService, // Service for terminal sessions
  ],
})
@Global() // Make this a global module
export class SshModule {}
