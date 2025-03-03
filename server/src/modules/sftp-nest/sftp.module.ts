import { Module } from '@nestjs/common';
import { SshModule } from '../ssh-nest/ssh.module';
import { SftpService } from './services/sftp.service';
import { SftpGateway } from './sftp.gateway';

@Module({
  imports: [SshModule],
  providers: [SftpGateway, SftpService],
  exports: [SftpService],
})
export class SftpModule {}
