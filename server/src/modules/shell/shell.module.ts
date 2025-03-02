import { Module } from '@nestjs/common';
import { AnsibleCommandService } from './services/ansible-command.service';
import { DockerComposeService } from './services/docker-compose.service';
import { FileSystemService } from './services/file-system.service';
import { PlaybookFileService } from './services/playbook-file.service';
import { ShellWrapperService } from './services/shell-wrapper.service';
import { SshKeyService } from './services/ssh-key.service';

/**
 * ShellModule provides a set of services for executing shell commands and file system operations.
 * It's designed to be backward compatible with the legacy shell module while providing NestJS structure.
 */
@Module({
  providers: [
    ShellWrapperService,
    FileSystemService,
    AnsibleCommandService,
    DockerComposeService,
    PlaybookFileService,
    SshKeyService,
  ],
  exports: [
    FileSystemService,
    AnsibleCommandService,
    DockerComposeService,
    PlaybookFileService,
    SshKeyService,
  ],
})
export class ShellModule {}
