import { SshInfrastructureModule } from '@infrastructure/ssh/ssh-infrastructure.module';
import { ShellModule } from '@modules/shell';
import { Module } from '@nestjs/common';
import { SftpService } from './application/services/sftp.service';
import { FileStreamService } from './infrastructure/services/file-stream.service';
import { SftpGateway } from './presentation/gateways/sftp.gateway';

@Module({
  imports: [
    // Import the infrastructure module directly instead of the full SSH module
    SshInfrastructureModule,
    ShellModule,
  ],
  providers: [
    SftpGateway,
    SftpService,
    FileStreamService,
    {
      provide: 'ISftpService',
      useExisting: SftpService,
    },
  ],
  exports: [SftpService, FileStreamService],
})
export class SftpModule {}
