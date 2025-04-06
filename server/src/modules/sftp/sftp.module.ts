import { SshInfrastructureModule } from '@infrastructure/ssh/ssh-infrastructure.module';
import { ShellModule } from '@modules/shell';
import { Module } from '@nestjs/common';
import { SftpService } from './application/services/sftp.service';
import { SFTP_SERVICE } from './domain/interfaces/sftp-service.interface';
import { SFTP_REPOSITORY } from './domain/repositories/sftp-repository.interface';
import { SftpRepository } from './infrastructure/repositories/sftp.repository';
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
    SftpRepository,
    {
      provide: SFTP_SERVICE,
      useExisting: SftpService,
    },
    {
      provide: SFTP_REPOSITORY,
      useExisting: SftpRepository,
    },
  ],
  exports: [SftpService, FileStreamService],
})
export class SftpModule {}
