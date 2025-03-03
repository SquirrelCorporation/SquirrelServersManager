import { Module } from '@nestjs/common';
import { SshConnectionService } from './services/ssh-connection.service';
import { SshTerminalService } from './services/ssh-terminal.service';
import { SshGateway } from './ssh.gateway';

@Module({
  providers: [SshGateway, SshConnectionService, SshTerminalService],
  exports: [SshConnectionService, SshTerminalService],
})
export class SshModule {}
