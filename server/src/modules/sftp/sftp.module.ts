import { Module } from '@nestjs/common';
import { SshModule } from '../ssh/ssh.module';
import { SftpService } from './application/services/sftp.service';
import { FileStreamService } from './infrastructure/services/file-stream.service';
import { SftpRepository } from './infrastructure/repositories/sftp.repository';
import { SftpGateway } from './presentation/gateways/sftp.gateway';

@Module({
  imports: [SshModule],
  providers: [
    SftpGateway,
    SftpService,
    FileStreamService,
    {
      provide: 'ISftpRepository',
      useClass: SftpRepository,
    },
    {
      provide: 'ISftpService',
      useExisting: SftpService,
    },
  ],
  exports: [SftpService, FileStreamService],
})
export class SftpModule {}
