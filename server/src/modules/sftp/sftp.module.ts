import { Module } from '@nestjs/common';
import { SshInfrastructureModule } from '@infrastructure/ssh/ssh-infrastructure.module';
import { SftpService } from './application/services/sftp.service';
import { FileStreamService } from './infrastructure/services/file-stream.service';
import { SftpRepository } from './infrastructure/repositories/sftp.repository';
import { SftpGateway } from './presentation/gateways/sftp.gateway';

@Module({
  imports: [
    // Import the infrastructure module directly instead of the full SSH module
    SshInfrastructureModule,
  ],
  providers: [
    SftpGateway,
    SftpService,
    FileStreamService,
    SftpRepository,
    {
      provide: 'ISftpService',
      useExisting: SftpService,
    }
  ],
  exports: [SftpService, FileStreamService],
})
export class SftpModule {}
