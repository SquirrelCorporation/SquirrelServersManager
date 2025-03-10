import { Module } from '@nestjs/common';
import { AnsibleVaultModule } from '../ansible-vault';
import { DockerComposeService } from './application/services/docker-compose.service';
import { FileSystemService } from './application/services/file-system.service';
import { PlaybookFileService } from './application/services/playbook-file.service';
import { ShellWrapperService } from './application/services/shell-wrapper.service';
import { SshKeyService } from './application/services/ssh-key.service';

/**
 * ShellModule provides a set of services for executing shell commands and file system operations.
 * It follows clean architecture principles with clear separation of concerns.
 */
@Module({
  imports: [AnsibleVaultModule],
  providers: [
    ShellWrapperService,
    FileSystemService,
    DockerComposeService,
    PlaybookFileService,
    SshKeyService,
    {
      provide: 'ISshKeyService',
      useExisting: SshKeyService,
    },
    {
      provide: 'SHELL_WRAPPER_SERVICE',
      useExisting: ShellWrapperService,
    },
  ],
  exports: [
    ShellWrapperService,
    FileSystemService,
    DockerComposeService,
    PlaybookFileService,
    SshKeyService,
    'ISshKeyService',
    'SHELL_WRAPPER_SERVICE',
  ],
})
export class ShellModule {}
