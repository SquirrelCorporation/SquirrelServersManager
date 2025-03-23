import { Module } from '@nestjs/common';
import { AnsibleVaultsModule } from '../ansible-vaults';
import { DockerComposeService } from './application/services/docker-compose.service';
import { FileSystemService } from './application/services/file-system.service';
import { PlaybookFileService } from './application/services/playbook-file.service';
import { ShellWrapperService } from './application/services/shell-wrapper.service';
import { SshKeyService } from './application/services/ssh-key.service';
import {
  DOCKER_COMPOSE_SERVICE,
  FILE_SYSTEM_SERVICE,
  PLAYBOOK_FILE_SERVICE,
  SHELL_WRAPPER_SERVICE,
  SSH_KEY_SERVICE,
} from './index';

/**
 * ShellModule provides a set of services for executing shell commands and file system operations.
 * It follows clean architecture principles with clear separation of concerns.
 */
@Module({
  imports: [AnsibleVaultsModule],
  providers: [
    ShellWrapperService,
    FileSystemService,
    DockerComposeService,
    PlaybookFileService,
    SshKeyService,
    {
      provide: SSH_KEY_SERVICE,
      useExisting: SshKeyService,
    },
    {
      provide: SHELL_WRAPPER_SERVICE,
      useExisting: ShellWrapperService,
    },
    {
      provide: FILE_SYSTEM_SERVICE,
      useExisting: FileSystemService,
    },
    {
      provide: DOCKER_COMPOSE_SERVICE,
      useExisting: DockerComposeService,
    },
    {
      provide: PLAYBOOK_FILE_SERVICE,
      useExisting: PlaybookFileService,
    },
  ],
  exports: [
    ShellWrapperService,
    FileSystemService,
    DockerComposeService,
    PlaybookFileService,
    SshKeyService,
    SSH_KEY_SERVICE,
    SHELL_WRAPPER_SERVICE,
    FILE_SYSTEM_SERVICE,
    DOCKER_COMPOSE_SERVICE,
  ],
})
export class ShellModule {}
